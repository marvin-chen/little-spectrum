import { describe, expect, it } from "vitest";
import { listSessionCards } from "@/lib/data/sessions";
import { anonymousUser, createGarden, service, token, type TestUser } from "./helpers";

async function twoPlayerGarden(): Promise<{ ada: TestUser; bo: TestUser; gardenId: string }> {
  const [ada, bo] = await Promise.all([anonymousUser("Ada"), anonymousUser("Bo")]);
  const invite = token();
  const gardenId = await createGarden(ada, 2, invite);
  await service().rpc("join_garden", { p_user: bo.id, p_token: invite });
  return { ada, bo, gardenId };
}

// Inserts one Hue Knew session per status, oldest first and a minute apart, with both players in each.
async function seedSessions(gardenId: string, ada: TestUser, bo: TestUser, statuses: Array<"active" | "revealed">): Promise<string[]> {
  const start = Date.parse("2026-01-01T00:00:00Z");
  const { data, error } = await service()
    .from("sessions")
    .insert(
      statuses.map((status, i) => {
        const at = new Date(start + i * 60_000).toISOString();
        return {
          garden_id: gardenId,
          game: "hue-knew",
          status,
          created_by: ada.id,
          clue_giver_id: ada.id,
          prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
          created_at: at,
          revealed_at: status === "revealed" ? at : null,
        };
      }),
    )
    .select("id, created_at");
  if (error) throw new Error(error.message);
  const ids = data.sort((a, b) => a.created_at.localeCompare(b.created_at)).map((row) => row.id as string);
  const { error: participantError } = await service()
    .from("session_participants")
    .insert(ids.flatMap((id) => [{ session_id: id, user_id: ada.id }, { session_id: id, user_id: bo.id }]));
  if (participantError) throw new Error(participantError.message);
  return ids;
}

describe("home session cards", () => {
  it("keeps the newest sessions once a player is past the limit", async () => {
    const { ada, bo, gardenId } = await twoPlayerGarden();
    const ids = await seedSessions(gardenId, ada, bo, Array(61).fill("active"));
    const cards = await listSessionCards(gardenId, ada.id);
    expect(cards).toHaveLength(60);
    expect(cards[0].id).toBe(ids[60]);
    expect(cards.map((c) => c.id)).not.toContain(ids[0]);
  });
});
