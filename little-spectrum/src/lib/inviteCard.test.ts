import { describe, expect, it } from "vitest";
import { DEFAULT_INVITE_CARD, HEADLINE_MAX, NOTE_MAX, parseInviteCard } from "./inviteCard";

describe("parseInviteCard", () => {
  it("returns defaults for empty or malformed input", () => {
    expect(parseInviteCard({})).toEqual(DEFAULT_INVITE_CARD);
    expect(parseInviteCard(null)).toEqual(DEFAULT_INVITE_CARD);
    expect(parseInviteCard({ layout: "banner", sticker: "evil", accent: "#fff" })).toEqual(DEFAULT_INVITE_CARD);
  });

  it("trims, collapses, and caps text", () => {
    const card = parseInviteCard({ headline: `  Hello   there ${"x".repeat(100)}`, note: "a".repeat(500) });
    expect(card.headline.length).toBe(HEADLINE_MAX);
    expect(card.headline.startsWith("Hello there")).toBe(true);
    expect(card.note.length).toBe(NOTE_MAX);
  });

  it("keeps valid choices and allows an empty note", () => {
    expect(parseInviteCard({ layout: "ticket", sticker: "hue-clue", accent: "violet", showMembers: false, showGarden: true, note: "" })).toMatchObject({
      layout: "ticket",
      sticker: "hue-clue",
      accent: "violet",
      showMembers: false,
      showGarden: true,
      note: "",
    });
  });
});
