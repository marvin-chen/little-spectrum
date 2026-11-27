import { describe, expect, it } from "vitest";
import { updateGardenTheme, updateInviteCard } from "@/lib/data/gardens";
import { getGardenDetails, getGrowthSummary } from "@/lib/data/growth";
import { DEFAULT_INVITE_CARD } from "@/lib/inviteCard";
import { addDays, weekStartFor } from "@/lib/week";
import { anonymousUser, createGarden, service, token } from "./helpers";

describe("creator only garden settings", () => {
  it("lets the creator change the theme and invite card and refuses everyone else", async () => {
    const [ada, bo, cy] = await Promise.all([anonymousUser("Ada"), anonymousUser("Bo"), anonymousUser("Cy")]);
    const invite = token();
    const gardenId = await createGarden(ada, 8, invite);
    await service().rpc("join_garden", { p_user: bo.id, p_token: invite });

    await updateGardenTheme(ada.id, gardenId, "sunset");
    await updateInviteCard(ada.id, gardenId, { ...DEFAULT_INVITE_CARD, headline: "Hello" });
    for (const other of [bo, cy]) {
      await expect(updateGardenTheme(other.id, gardenId, "lagoon")).rejects.toThrow("not_creator");
      await expect(updateInviteCard(other.id, gardenId, { ...DEFAULT_INVITE_CARD, headline: "Nope" })).rejects.toThrow(
        "not_creator",
      );
    }

    const { data } = await service().from("gardens").select("theme, invite_card").eq("id", gardenId).single();
    expect(data).toMatchObject({ theme: "sunset", invite_card: { headline: "Hello" } });
  });
});

describe("garden growth in a long lived garden", () => {
  it("keeps totals, streak, and keepsake rounds correct past a few hundred rounds", async () => {
    const timezone = "America/Los_Angeles";
    const [ada, bo] = await Promise.all([anonymousUser("Ada"), anonymousUser("Bo")]);
    const invite = token();
    const gardenId = await createGarden(ada, 2, invite);
    await service().rpc("join_garden", { p_user: bo.id, p_token: invite });

    const thisWeek = weekStartFor(new Date(), timezone);
    const weeks = Array.from({ length: 60 }, (_, i) => addDays(thisWeek, -7 * i));
    const rows = weeks.flatMap((week) => Array<string>(5).fill(week));
    const { data: sessions, error } = await service()
      .from("sessions")
      .insert(
        rows.map((week) => ({
          garden_id: gardenId,
          game: "hue-knew",
          status: "revealed",
          created_by: ada.id,
          clue_giver_id: ada.id,
          prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
          revealed_at: `${week}T12:00:00Z`,
        })),
      )
      .select("id");
    if (error) throw new Error(error.message);
    const ids = sessions.map((s) => s.id as string);
    const people = ids.flatMap((id) => [ada, bo].map((u) => ({ session_id: id, user_id: u.id })));
    const events = ids.map((id, i) => ({ garden_id: gardenId, session_id: id, week_start: rows[i] }));
    const rewards = [weeks[59], weeks[0]].map((week, i) => ({
      garden_id: gardenId,
      week_start: week,
      ordinal: i + 1,
      item_key: "sprout",
    }));
    const insert = async (table: string, values: object[]) => {
      const { error: insertError } = await service().from(table).insert(values);
      if (insertError) throw new Error(insertError.message);
    };
    await insert("session_participants", people);
    await insert("growth_events", events);
    await insert("weekly_rewards", rewards);

    const growth = await getGrowthSummary(gardenId, timezone);
    expect(growth).toMatchObject({ totalCompletions: 300, completionsThisWeek: 5, streak: 60 });

    const details = await getGardenDetails(gardenId, ada.id, timezone);
    expect(details.contributorsThisWeek).toBe(2);
    expect(details.items.map((item) => item.activities.length)).toEqual([5, 5]);
  });
});

describe("garden details", () => {
  it("lists the rounds behind a keepsake and who contributed this week", async () => {
    const [ada, bo, cy] = await Promise.all([anonymousUser("Ada"), anonymousUser("Bo"), anonymousUser("Cy")]);
    const invite = token();
    const gardenId = await createGarden(ada, 8, invite);
    for (const user of [bo, cy]) await service().rpc("join_garden", { p_user: user.id, p_token: invite });

    for (let i = 0; i < 3; i += 1) {
      const { data: id, error } = await service().rpc("create_session", {
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

    const mine = await getGardenDetails(gardenId, ada.id, "America/Los_Angeles");
    expect(mine.contributorsThisWeek).toBe(2);
    expect(mine.items).toHaveLength(1);
    expect(mine.items[0].activities).toHaveLength(3);
    expect(mine.items[0].activities.every((a) => a.isParticipant && a.participantNames.includes("Bo"))).toBe(true);

    const outsider = await getGardenDetails(gardenId, cy.id, "America/Los_Angeles");
    expect(outsider.items[0].activities).toHaveLength(3);
    expect(outsider.items[0].activities.every((a) => !a.isParticipant && a.participantNames.length === 0)).toBe(true);
  });
});
