import { describe, expect, it } from "vitest";
import { anonymousUser, createGarden, service, token, type TestUser } from "./helpers";

async function playedSession(gardenId: string, a: TestUser, b: TestUser): Promise<string> {
  const { data, error } = await service().rpc("create_session", {
    p_user: a.id,
    p_garden: gardenId,
    p_game: "same-wavelength",
    p_participants: [a.id, b.id],
    p_prompt: { id: "beach", text: "Something you bring to the beach" },
    p_secret: null,
    p_clue_giver: null,
    p_predictions: {},
  });
  if (error) throw new Error(error.message);
  const id = data as string;
  await service().rpc("submit_answer", { p_user: a.id, p_session: id, p_round: 1, p_kind: "answer", p_payload: { word: "towel" } });
  await service().rpc("submit_answer", { p_user: b.id, p_session: id, p_round: 1, p_kind: "answer", p_payload: { word: "towel" } });
  return id;
}

describe("weekly rewards", () => {
  it("awards one item after three completions in a week, even with simultaneous completions", async () => {
    const ada = await anonymousUser("Ada");
    const bo = await anonymousUser("Bo");
    const invite = token();
    const gardenId = await createGarden(ada, 2, invite);
    await service().rpc("join_garden", { p_user: bo.id, p_token: invite });
    const sessions = await Promise.all(Array.from({ length: 5 }, () => playedSession(gardenId, ada, bo)));
    const reveals = await Promise.all(
      sessions.map((id) =>
        service().rpc("reveal_round", { p_session: id, p_round: 1, p_result: {}, p_final: true, p_early: false, p_expected_submissions: 2 }),
      ),
    );
    const rewarded = reveals.filter((r) => (r.data as { reward: unknown }).reward !== null);
    expect(rewarded).toHaveLength(1);
    const { data: events } = await service().from("growth_events").select("id").eq("garden_id", gardenId);
    expect(events).toHaveLength(5);
    const { data: rewards } = await service().from("weekly_rewards").select("*").eq("garden_id", gardenId);
    expect(rewards).toHaveLength(1);
    expect(rewards![0].ordinal).toBe(1);
  });

  it("does not count a multi-round session more than once", async () => {
    const ada = await anonymousUser("Ada");
    const bo = await anonymousUser("Bo");
    const invite = token();
    const gardenId = await createGarden(ada, 2, invite);
    await service().rpc("join_garden", { p_user: bo.id, p_token: invite });
    const id = await playedSession(gardenId, ada, bo);
    const first = await service().rpc("reveal_round", { p_session: id, p_round: 1, p_result: { rounds: [1] }, p_final: false, p_early: false, p_expected_submissions: 2 });
    expect(first.data).toMatchObject({ status: "revealed", growth: false });
    await service().rpc("submit_answer", { p_user: ada.id, p_session: id, p_round: 2, p_kind: "answer", p_payload: { word: "sand" } });
    await service().rpc("submit_answer", { p_user: bo.id, p_session: id, p_round: 2, p_kind: "answer", p_payload: { word: "sand" } });
    const second = await service().rpc("reveal_round", { p_session: id, p_round: 2, p_result: { rounds: [1, 2] }, p_final: true, p_early: false, p_expected_submissions: 2 });
    expect(second.data).toMatchObject({ status: "revealed", growth: true });
    const { data: events } = await service().from("growth_events").select("id").eq("session_id", id);
    expect(events).toHaveLength(1);
  });

  it("refuses a reveal whose submission count is stale", async () => {
    const ada = await anonymousUser("Ada");
    const bo = await anonymousUser("Bo");
    const invite = token();
    const gardenId = await createGarden(ada, 2, invite);
    await service().rpc("join_garden", { p_user: bo.id, p_token: invite });
    const id = await playedSession(gardenId, ada, bo);
    const { data } = await service().rpc("reveal_round", { p_session: id, p_round: 1, p_result: {}, p_final: true, p_early: true, p_expected_submissions: 1 });
    expect(data).toMatchObject({ status: "retry" });
  });
});
