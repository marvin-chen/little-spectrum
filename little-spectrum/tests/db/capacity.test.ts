import { describe, expect, it } from "vitest";
import { anonymousUser, createGarden, service, token } from "./helpers";

describe("garden capacity", () => {
  it("lets exactly one of two simultaneous joiners into a two-person garden", async () => {
    const creator = await anonymousUser("Creator");
    const invite = token();
    await createGarden(creator, 2, invite);
    const [a, b, c] = await Promise.all([anonymousUser("A"), anonymousUser("B"), anonymousUser("C")]);
    const join = (userId: string) => service().rpc("join_garden", { p_user: userId, p_token: invite });
    const results = await Promise.all([join(a.id), join(b.id), join(c.id)]);
    const statuses = results.map((r) => (r.data as { status: string }).status).sort();
    expect(statuses).toEqual(["full", "full", "joined"]);
  });

  it("returns existing members without consuming a slot and rejects a ninth member", async () => {
    const creator = await anonymousUser("Creator");
    const invite = token();
    const gardenId = await createGarden(creator, 8, invite);
    const friends = await Promise.all(Array.from({ length: 8 }, (_, i) => anonymousUser(`F${i}`)));
    const results = await Promise.all(friends.map((f) => service().rpc("join_garden", { p_user: f.id, p_token: invite })));
    const statuses = results.map((r) => (r.data as { status: string }).status).sort();
    expect(statuses).toEqual(["full", "joined", "joined", "joined", "joined", "joined", "joined", "joined"]);
    const { data: again } = await service().rpc("join_garden", { p_user: creator.id, p_token: invite });
    expect(again).toMatchObject({ status: "member", garden_id: gardenId });
    const { data: members } = await service().from("memberships").select("user_id").eq("garden_id", gardenId);
    expect(members).toHaveLength(8);
  });

  it("rejects revoked invitations", async () => {
    const creator = await anonymousUser("Creator");
    const invite = token();
    const gardenId = await createGarden(creator, 2, invite);
    await service().rpc("rotate_invitation", { p_user: creator.id, p_garden: gardenId, p_token: null });
    const late = await anonymousUser("Late");
    const { data } = await service().rpc("join_garden", { p_user: late.id, p_token: invite });
    expect(data).toMatchObject({ status: "invalid" });
  });
});
