import { describe, expect, it } from "vitest";
import { anonymousUser, createGarden, service, token, type TestUser } from "./helpers";

async function gardenWith(capacity: 2 | 8, ...names: string[]) {
  const [creator, ...others] = await Promise.all(["Ada", ...names].map((name) => anonymousUser(name)));
  const invite = token();
  const gardenId = await createGarden(creator, capacity, invite);
  for (const user of others) await service().rpc("join_garden", { p_user: user.id, p_token: invite });
  return { creator, others, gardenId, invite };
}

async function capacityOf(gardenId: string): Promise<number> {
  const { data } = await service().from("gardens").select("capacity").eq("id", gardenId).single();
  return data!.capacity;
}

describe("creator only garden functions", () => {
  it("refuses invitation changes from a member and lets the creator rotate the link", async () => {
    const { creator, others, gardenId, invite } = await gardenWith(8, "Bo");
    const [bo] = others;

    const refused = await service().rpc("rotate_invitation", { p_user: bo.id, p_garden: gardenId, p_token: token() });
    expect(refused.error?.message).toContain("not_creator");
    const { data: stillActive } = await service()
      .from("invitations")
      .select("token")
      .eq("garden_id", gardenId)
      .is("revoked_at", null);
    expect(stillActive).toEqual([{ token: invite }]);

    const fresh = token();
    const rotated = await service().rpc("rotate_invitation", {
      p_user: creator.id,
      p_garden: gardenId,
      p_token: fresh,
    });
    expect(rotated.error).toBeNull();
    const cy = await anonymousUser("Cy");
    expect((await service().rpc("join_garden", { p_user: cy.id, p_token: invite })).data).toEqual({
      status: "invalid",
    });
    expect((await service().rpc("join_garden", { p_user: cy.id, p_token: fresh })).data).toMatchObject({
      status: "joined",
    });
  });

  it("refuses to expand the garden for a member and lets the creator expand it", async () => {
    const { creator, others, gardenId } = await gardenWith(2, "Bo");

    const refused = await service().rpc("expand_garden", { p_user: others[0].id, p_garden: gardenId });
    expect(refused.error?.message).toContain("not_creator");
    expect(await capacityOf(gardenId)).toBe(2);

    const expanded = await service().rpc("expand_garden", { p_user: creator.id, p_garden: gardenId });
    expect(expanded.error).toBeNull();
    expect(await capacityOf(gardenId)).toBe(8);
  });
});

describe("starting a session", () => {
  async function create(gardenId: string, user: TestUser, participants: string[]) {
    return service().rpc("create_session", {
      p_user: user.id,
      p_garden: gardenId,
      p_game: "hue-knew",
      p_participants: participants,
      p_prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
      p_secret: { target: 42 },
      p_clue_giver: user.id,
      p_predictions: {},
    });
  }

  it("refuses a bad player list and creates nothing", async () => {
    const { creator: ada, others, gardenId } = await gardenWith(8, "Bo", "Cy");
    const [bo, cy] = others;
    const outsider = await anonymousUser("Dee");

    const cases: Array<[string, TestUser, string[], string]> = [
      ["someone outside the garden starts it", outsider, [outsider.id, ada.id], "not_member"],
      ["only one player", ada, [ada.id], "too_few_participants"],
      ["the starter is not playing", ada, [bo.id, cy.id], "creator_not_participant"],
      ["a player is not a member", ada, [ada.id, outsider.id], "participants_not_members"],
      ["a player is listed twice", ada, [ada.id, ada.id], "participants_not_members"],
    ];
    for (const [, user, participants, message] of cases) {
      expect((await create(gardenId, user, participants)).error?.message).toContain(message);
    }
    const { count } = await service()
      .from("sessions")
      .select("id", { count: "exact", head: true })
      .eq("garden_id", gardenId);
    expect(count).toBe(0);

    expect((await create(gardenId, ada, [ada.id, bo.id])).error).toBeNull();
  });
});
