import { describe, expect, it } from "vitest";
import { listMemories } from "@/lib/data/memories";
import { ensureRevealed, loadState } from "@/lib/data/sessions";
import { anonymousUser, createGarden, service, token, type TestUser } from "./helpers";

async function finishRound(gardenId: string, ada: TestUser, bo: TestUser): Promise<string> {
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
  await ensureRevealed((await loadState(id as string))!);
  return id as string;
}

describe("memories feed", () => {
  it("pages through every round the player was in, even when others played more recently", async () => {
    const [ada, bo, cy, dee] = await Promise.all(["Ada", "Bo", "Cy", "Dee"].map((name) => anonymousUser(name)));
    const invite = token();
    const gardenId = await createGarden(ada, 8, invite);
    for (const user of [bo, cy, dee]) await service().rpc("join_garden", { p_user: user.id, p_token: invite });

    const mine: string[] = [];
    for (let i = 0; i < 25; i += 1) mine.push(await finishRound(gardenId, ada, bo));

    const later = Date.now() + 60_000;
    const { data: others, error } = await service()
      .from("sessions")
      .insert(
        Array.from({ length: 120 }, (_, i) => ({
          garden_id: gardenId,
          game: "hue-knew",
          status: "revealed",
          created_by: cy.id,
          clue_giver_id: cy.id,
          prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
          revealed_at: new Date(later + i * 1000).toISOString(),
        })),
      )
      .select("id");
    if (error) throw new Error(error.message);
    await service()
      .from("session_participants")
      .insert(others.flatMap((s) => [cy, dee].map((u) => ({ session_id: s.id, user_id: u.id }))));

    const first = await listMemories(gardenId, ada.id);
    expect(first.memories.map((m) => m.session.id)).toEqual(mine.slice(5).reverse());
    expect(first.next).not.toBeNull();
    expect(first.activity).toHaveLength(10);
    expect(first.activity.every((entry) => others.some((s) => s.id === entry.id))).toBe(true);

    const second = await listMemories(gardenId, ada.id, { before: first.next! });
    expect(second.memories.map((m) => m.session.id)).toEqual(mine.slice(0, 5).reverse());
    expect(second.next).toBeNull();
    expect(second.activity).toEqual([]);
  }, 60_000);
});
