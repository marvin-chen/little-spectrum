import { describe, expect, it } from "vitest";
import { anonymousUser, createGarden, service, token, type TestUser } from "./helpers";

async function twoPlayerGarden(): Promise<{ ada: TestUser; bo: TestUser; cy: TestUser; gardenId: string }> {
  const [ada, bo, cy] = await Promise.all([anonymousUser("Ada"), anonymousUser("Bo"), anonymousUser("Cy")]);
  const invite = token();
  const gardenId = await createGarden(ada, 8, invite);
  await service().rpc("join_garden", { p_user: bo.id, p_token: invite });
  await service().rpc("join_garden", { p_user: cy.id, p_token: invite });
  return { ada, bo, cy, gardenId };
}

async function hueKnewSession(gardenId: string, ada: TestUser, bo: TestUser): Promise<string> {
  const { data, error } = await service().rpc("create_session", {
    p_user: ada.id,
    p_garden: gardenId,
    p_game: "hue-knew",
    p_participants: [ada.id, bo.id],
    p_prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
    p_secret: { target: 42 },
    p_clue_giver: ada.id,
    p_predictions: {},
  });
  if (error) throw new Error(error.message);
  return data as string;
}

describe("session lifecycle", () => {
  it("rejects submissions after a session is closed and keeps the first answer", async () => {
    const { ada, bo, gardenId } = await twoPlayerGarden();
    const id = await hueKnewSession(gardenId, ada, bo);
    await service().rpc("submit_answer", {
      p_user: ada.id,
      p_session: id,
      p_round: 1,
      p_kind: "clue",
      p_payload: { clue: "blanket" },
    });
    await service().rpc("submit_answer", {
      p_user: bo.id,
      p_session: id,
      p_round: 1,
      p_kind: "answer",
      p_payload: { guess: 40 },
    });
    await service().rpc("reveal_round", {
      p_session: id,
      p_round: 1,
      p_result: { target: 42 },
      p_final: true,
      p_early: false,
      p_expected_submissions: 2,
    });
    const { data: late } = await service().rpc("submit_answer", {
      p_user: bo.id,
      p_session: id,
      p_round: 1,
      p_kind: "answer",
      p_payload: { guess: 99 },
    });
    expect(late).toMatchObject({ status: "closed" });
    const { data: rows } = await service()
      .from("submissions")
      .select("payload")
      .eq("session_id", id)
      .eq("user_id", bo.id);
    expect(rows).toEqual([{ payload: { guess: 40 } }]);
  });

  it("does not award growth while a session is still active", async () => {
    const { ada, bo, gardenId } = await twoPlayerGarden();
    const id = await hueKnewSession(gardenId, ada, bo);
    await service().rpc("submit_answer", {
      p_user: ada.id,
      p_session: id,
      p_round: 1,
      p_kind: "clue",
      p_payload: { clue: "blanket" },
    });
    const { data: events } = await service().from("growth_events").select("id").eq("session_id", id);
    expect(events).toHaveLength(0);
  });

  it("keeps secrets and photos from non participants even after the reveal", async () => {
    const { ada, bo, cy, gardenId } = await twoPlayerGarden();
    const id = await hueKnewSession(gardenId, ada, bo);
    await service().rpc("submit_answer", {
      p_user: ada.id,
      p_session: id,
      p_round: 1,
      p_kind: "clue",
      p_payload: { clue: "blanket" },
    });
    await service().rpc("submit_answer", {
      p_user: bo.id,
      p_session: id,
      p_round: 1,
      p_kind: "answer",
      p_payload: { guess: 40 },
    });
    await service()
      .from("photos")
      .insert({ session_id: id, user_id: bo.id, storage_path: `sessions/${id}/${bo.id}-x.jpg`, status: "ready" });
    // Before the reveal, Ada cannot see Bo's photo row, after it she can. Cy never can.
    const { data: adaBefore } = await ada.client.from("photos").select("id").eq("session_id", id);
    expect(adaBefore).toHaveLength(0);
    await service().rpc("reveal_round", {
      p_session: id,
      p_round: 1,
      p_result: { target: 42 },
      p_final: true,
      p_early: false,
      p_expected_submissions: 2,
    });
    const { data: adaAfter } = await ada.client.from("photos").select("id").eq("session_id", id);
    expect(adaAfter).toHaveLength(1);
    const { data: cyPhotos } = await cy.client.from("photos").select("id").eq("session_id", id);
    const { data: cySecret } = await cy.client.from("session_secrets").select("payload").eq("session_id", id);
    const { data: cySession } = await cy.client.from("sessions").select("id").eq("id", id);
    expect(cyPhotos).toHaveLength(0);
    expect(cySecret).toHaveLength(0);
    expect(cySession).toHaveLength(0);
  });
});

describe("week boundaries in the garden timezone", () => {
  async function weekStart(gardenId: string, at: string): Promise<string> {
    const { data, error } = await service().rpc("week_start_for", { p_garden: gardenId, p_at: at });
    if (error) throw new Error(error.message);
    return data as string;
  }

  it.each([
    // Daylight saving ends in New York on 2026-11-01. Sunday night stays in the old week until local midnight.
    ["America/New_York", "2026-11-01T05:30:00Z", "2026-10-26"],
    ["America/New_York", "2026-11-02T04:30:00Z", "2026-10-26"],
    ["America/New_York", "2026-11-02T05:30:00Z", "2026-11-02"],
    // Daylight saving starts on 2026-03-08.
    ["America/New_York", "2026-03-09T03:30:00Z", "2026-03-02"],
    ["America/New_York", "2026-03-09T04:30:00Z", "2026-03-09"],
    // The same instant is a different week in Tokyo and Los Angeles.
    ["Asia/Tokyo", "2026-10-25T16:30:00Z", "2026-10-26"],
    ["America/Los_Angeles", "2026-10-25T16:30:00Z", "2026-10-19"],
  ])("uses %s so %s starts the week of %s", async (timezone, at, expected) => {
    const creator = await anonymousUser("Clock");
    const { data: gardenId, error } = await service().rpc("create_garden", {
      p_user: creator.id,
      p_name: "Clock",
      p_capacity: 2,
      p_theme: "meadow",
      p_timezone: timezone,
      p_token: token(),
    });
    if (error) throw new Error(error.message);
    expect(await weekStart(gardenId as string, at)).toBe(expected);
  });
});

describe("rewards across weeks", () => {
  it("keeps earlier keepsakes after a missed week and numbers the next one correctly", async () => {
    const { ada, bo, gardenId } = await twoPlayerGarden();
    // An old reward from three weeks ago, with no activity since.
    await service()
      .from("weekly_rewards")
      .insert({ garden_id: gardenId, week_start: "2026-10-05", ordinal: 1, item_key: "sprout", variant: 0 });
    for (let i = 0; i < 3; i += 1) {
      const id = await hueKnewSession(gardenId, ada, bo);
      await service().rpc("submit_answer", {
        p_user: ada.id,
        p_session: id,
        p_round: 1,
        p_kind: "clue",
        p_payload: { clue: "blanket" },
      });
      await service().rpc("submit_answer", {
        p_user: bo.id,
        p_session: id,
        p_round: 1,
        p_kind: "answer",
        p_payload: { guess: 40 },
      });
      await service().rpc("reveal_round", {
        p_session: id,
        p_round: 1,
        p_result: { target: 42 },
        p_final: true,
        p_early: false,
        p_expected_submissions: 2,
      });
    }
    const { data: rewards } = await service()
      .from("weekly_rewards")
      .select("ordinal, week_start, item_key")
      .eq("garden_id", gardenId)
      .order("ordinal");
    expect(rewards).toHaveLength(2);
    expect(rewards![0]).toMatchObject({ ordinal: 1, week_start: "2026-10-05", item_key: "sprout" });
    expect(rewards![1].ordinal).toBe(2);
    expect(rewards![1].week_start).not.toBe("2026-10-05");
  });
});
