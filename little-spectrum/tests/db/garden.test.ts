import { describe, expect, it } from "vitest";
import { updateGardenTheme, updateInviteCard } from "@/lib/data/gardens";
import { getGardenDetails } from "@/lib/data/growth";
import { DEFAULT_INVITE_CARD } from "@/lib/inviteCard";
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
