import { describe, expect, it } from "vitest";
import type { SessionState } from "./engine";
import { cleanClue, hueClue, scoreDistance } from "./hueClue";
import { HUE_CLUE_COLS, HUE_CLUE_ROWS, PALETTE, cellCoord, cellHex, cellLabel, manhattan } from "./hueCluePalette";

function state(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: "s1",
    gardenId: "g1",
    game: "hue-clue",
    status: "active",
    createdBy: "a",
    clueGiverId: "a",
    prompt: { id: "cell" },
    round: 1,
    result: null,
    earlyReveal: false,
    createdAt: "",
    revealedAt: null,
    participants: [
      { userId: "a", name: "Ada", avatar: "sun:amber", predictsUserId: null },
      { userId: "b", name: "Bo", avatar: "cat:violet", predictsUserId: null },
      { userId: "c", name: "Cy", avatar: "leaf:green", predictsUserId: null },
    ],
    submissions: [],
    photos: [],
    secret: { target: { col: 4, row: 2 } },
    ...overrides,
  };
}

describe("palette", () => {
  it("builds a deterministic 12 by 8 grid with coordinates and labels", () => {
    expect(PALETTE).toHaveLength(HUE_CLUE_ROWS);
    expect(PALETTE[0]).toHaveLength(HUE_CLUE_COLS);
    expect(cellCoord(0, 0)).toBe("A1");
    expect(cellCoord(11, 7)).toBe("L8");
    expect(cellLabel(2, 2)).toBe("Soft yellow");
    expect(cellHex(0, 4)).toBe(cellHex(0, 4));
    expect(cellHex(0, 4)).toMatch(/^#[0-9a-f]{6}$/);
    expect(new Set(PALETTE.flat().map((c) => c.hex)).size).toBe(96);
  });

  it("measures Manhattan distance", () => {
    expect(manhattan({ col: 0, row: 0 }, { col: 3, row: 2 })).toBe(5);
    expect(scoreDistance(0)).toBe(100);
    expect(scoreDistance(3)).toBe(55);
    expect(scoreDistance(7)).toBe(0);
  });
});

describe("hueClue engine", () => {
  it("limits clues to three words", () => {
    expect(cleanClue("sun kissed peach")).toBe("sun kissed peach");
    expect(cleanClue("a bit too long")).toBeNull();
    expect(cleanClue("   ")).toBeNull();
  });

  it("shows the target only to the clue giver", () => {
    expect(hueClue.view(state(), "a")).toMatchObject({ isClueGiver: true, target: { col: 4, row: 2 } });
    expect(hueClue.view(state(), "b")).toMatchObject({ isClueGiver: false, target: null });
  });

  it("validates guesses as grid cells after the clue", () => {
    const s = state({ submissions: [{ userId: "a", round: 1, kind: "clue", payload: { clue: "lemon" }, createdAt: "" }] });
    expect(hueClue.validateSubmission(s, "b", { col: 12, row: 0 }).ok).toBe(false);
    expect(hueClue.validateSubmission(s, "b", { col: 5, row: 2 })).toEqual({ ok: true, kind: "answer", payload: { col: 5, row: 2 } });
    expect(hueClue.validateSubmission(state(), "b", { col: 5, row: 2 }).ok).toBe(false);
  });

  it("scores by distance and lists missing players on early reveal", () => {
    const s = state({
      submissions: [
        { userId: "a", round: 1, kind: "clue", payload: { clue: "lemon" }, createdAt: "" },
        { userId: "b", round: 1, kind: "answer", payload: { col: 5, row: 4 }, createdAt: "" },
      ],
    });
    expect(hueClue.isRoundComplete(s)).toBe(false);
    expect(hueClue.earlyRevealCheck(s)).toMatchObject({ ok: true, pending: ["c"] });
    const outcome = hueClue.computeReveal(s, true);
    expect(outcome.result).toMatchObject({
      clue: "lemon",
      guesses: [{ userId: "b", distance: 3, score: 55 }],
      shared: 55,
      missing: ["c"],
      suggestedClueGiverId: "b",
    });
  });

  it("describes turns", () => {
    expect(hueClue.turnStatus(state(), "b")).toEqual({ needsYou: false, line: "Waiting for Ada's clue." });
    const s = state({ submissions: [{ userId: "a", round: 1, kind: "clue", payload: { clue: "lemon" }, createdAt: "" }] });
    expect(hueClue.turnStatus(s, "b")).toEqual({ needsYou: true, line: "Your clue is ready." });
    expect(hueClue.turnStatus(s, "a")).toEqual({ needsYou: false, line: "Waiting for Bo and Cy." });
  });
});
