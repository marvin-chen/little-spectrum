import { beforeAll, describe, expect, it } from "vitest";
import { anonymousUser, createGarden, service, token, type TestUser } from "./helpers";

let ada: TestUser;
let bo: TestUser;
let cy: TestUser;
let gardenId: string;
let sessionId: string;

beforeAll(async () => {
  [ada, bo, cy] = await Promise.all([anonymousUser("Ada"), anonymousUser("Bo"), anonymousUser("Cy")]);
  const invite = token();
  gardenId = await createGarden(ada, 8, invite);
  const { data: joined } = await service().rpc("join_garden", { p_user: bo.id, p_token: invite });
  expect(joined).toMatchObject({ status: "joined" });
  const { data: created, error } = await service().rpc("create_session", {
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
  sessionId = created as string;
});

describe("row level security", () => {
  it("restricts gardens and memberships to members", async () => {
    const { data: adaSees } = await ada.client.from("gardens").select("id").eq("id", gardenId);
    const { data: cySees } = await cy.client.from("gardens").select("id").eq("id", gardenId);
    expect(adaSees).toHaveLength(1);
    expect(cySees).toHaveLength(0);
    const { data: cyMembers } = await cy.client.from("memberships").select("user_id").eq("garden_id", gardenId);
    expect(cyMembers).toHaveLength(0);
  });

  it("keeps secret targets visible only to the clue giver until reveal", async () => {
    const { data: adaSecret } = await ada.client.from("session_secrets").select("payload").eq("session_id", sessionId);
    const { data: boSecret } = await bo.client.from("session_secrets").select("payload").eq("session_id", sessionId);
    expect(adaSecret).toHaveLength(1);
    expect(boSecret).toHaveLength(0);
  });

  it("shows unrevealed submissions only to their author", async () => {
    await service().rpc("submit_answer", { p_user: ada.id, p_session: sessionId, p_round: 1, p_kind: "clue", p_payload: { clue: "blanket" } });
    const { data: adaSees } = await ada.client.from("submissions").select("id").eq("session_id", sessionId);
    const { data: boSees } = await bo.client.from("submissions").select("id").eq("session_id", sessionId);
    const { data: cySees } = await cy.client.from("submissions").select("id").eq("session_id", sessionId);
    expect(adaSees).toHaveLength(1);
    expect(boSees).toHaveLength(0);
    expect(cySees).toHaveLength(0);
  });

  it("blocks direct writes and privileged functions for signed-in users", async () => {
    const { error: insertError } = await bo.client.from("memberships").insert({ garden_id: gardenId, user_id: cy.id });
    expect(insertError).toBeTruthy();
    const { error: rpcError } = await bo.client.rpc("reveal_round", {
      p_session: sessionId,
      p_round: 1,
      p_result: {},
      p_final: true,
      p_early: true,
      p_expected_submissions: 1,
    });
    expect(rpcError).toBeTruthy();
    const { data: still } = await service().from("sessions").select("status").eq("id", sessionId).single();
    expect(still?.status).toBe("active");
  });

  it("rejects duplicate and out-of-turn submissions", async () => {
    const { data: dup } = await service().rpc("submit_answer", { p_user: ada.id, p_session: sessionId, p_round: 1, p_kind: "clue", p_payload: { clue: "other" } });
    expect(dup).toMatchObject({ status: "duplicate" });
    const { error } = await service().rpc("submit_answer", { p_user: cy.id, p_session: sessionId, p_round: 1, p_kind: "answer", p_payload: { guess: 1 } });
    expect(error?.message).toContain("not_participant");
  });

  it("reveals once and awards growth exactly once under concurrent reveals", async () => {
    await service().rpc("submit_answer", { p_user: bo.id, p_session: sessionId, p_round: 1, p_kind: "answer", p_payload: { guess: 40 } });
    const reveal = () =>
      service().rpc("reveal_round", {
        p_session: sessionId,
        p_round: 1,
        p_result: { target: 42 },
        p_final: true,
        p_early: false,
        p_expected_submissions: 2,
      });
    const results = await Promise.all([reveal(), reveal(), reveal()]);
    const statuses = results.map((r) => (r.data as { status: string }).status).sort();
    expect(statuses).toEqual(["already_revealed", "already_revealed", "revealed"]);
    const { data: events } = await service().from("growth_events").select("id").eq("session_id", sessionId);
    expect(events).toHaveLength(1);
    const { data: boSecret } = await bo.client.from("session_secrets").select("payload").eq("session_id", sessionId);
    expect(boSecret).toHaveLength(1);
    const { data: boSubs } = await bo.client.from("submissions").select("id").eq("session_id", sessionId);
    expect(boSubs).toHaveLength(2);
  });
});
