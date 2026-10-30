import { describe, expect, it } from "vitest";
import { isPermutation, pairSimilarity, palettePicks, type PalettePicksResult } from "./palettePicks";
import type { SessionState, Submission } from "./engine";

function state(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: "s1",
    gardenId: "g1",
    game: "palette-picks",
    status: "active",
    createdBy: "a",
    clueGiverId: null,
    prompt: {
      id: "breakfast-lineup",
      title: "Breakfast lineup",
      prompt: "Rank these breakfasts from must-have to skip",
      items: ["Pancakes", "Avocado toast", "Overnight oats", "Breakfast burrito", "Eggs benedict"],
    },
    round: 1,
    result: null,
    earlyReveal: false,
    createdAt: "2026-10-26T00:00:00Z",
    revealedAt: null,
    participants: [
      { userId: "a", name: "Ada", avatar: "sun:amber", predictsUserId: null },
      { userId: "b", name: "Bo", avatar: "cat:violet", predictsUserId: null },
      { userId: "c", name: "Cy", avatar: "leaf:green", predictsUserId: null },
    ],
    submissions: [],
    photos: [],
    secret: null,
    ...overrides,
  };
}

function ranking(userId: string, order: number[]): Submission {
  return { userId, round: 1, kind: "answer", payload: { order }, createdAt: "" };
}

function reveal(submissions: Submission[], early = false): PalettePicksResult {
  return palettePicks.computeReveal(state({ submissions }), early).result as PalettePicksResult;
}

describe("pairSimilarity", () => {
  it("scores identical rankings 100 and reversed rankings 0", () => {
    expect(pairSimilarity([0, 1, 2, 3, 4], [0, 1, 2, 3, 4])).toBe(100);
    expect(pairSimilarity([0, 1, 2, 3, 4], [4, 3, 2, 1, 0])).toBe(0);
  });

  it("scores a single adjacent swap 83", () => {
    expect(pairSimilarity([0, 1, 2, 3, 4], [1, 0, 2, 3, 4])).toBe(83);
    expect(pairSimilarity([1, 0, 2, 3, 4], [0, 1, 2, 3, 4])).toBe(83);
  });
});

describe("isPermutation", () => {
  it("accepts every ordering of the five item indexes", () => {
    expect(isPermutation([0, 1, 2, 3, 4])).toBe(true);
    expect(isPermutation([4, 2, 0, 3, 1])).toBe(true);
  });

  it("rejects duplicates, gaps, and out of range values", () => {
    expect(isPermutation([0, 0, 1, 2, 3])).toBe(false);
    expect(isPermutation([0, 1, 2, 3, 5])).toBe(false);
    expect(isPermutation([-1, 0, 1, 2, 3])).toBe(false);
    expect(isPermutation([0, 1, 2, 3])).toBe(false);
    expect(isPermutation([0, 1, 2, 3, 4, 4])).toBe(false);
    expect(isPermutation([0, 1, 2, 3, "4"])).toBe(false);
    expect(isPermutation([0.5, 1, 2, 3, 4])).toBe(false);
    expect(isPermutation("01234")).toBe(false);
    expect(isPermutation(null)).toBe(false);
  });
});

describe("palettePicks engine", () => {
  it("picks a prompt with five items and no secret", () => {
    const pick = palettePicks.pickPrompt([], state().participants, () => 0);
    expect(pick.secret).toBeNull();
    expect(pick.prompt).toMatchObject({ id: pick.promptId });
    expect((pick.prompt as { items: string[] }).items).toHaveLength(5);
  });

  it("validates rankings and refuses a second one", () => {
    const s = state();
    expect(palettePicks.validateSubmission(s, "a", null).ok).toBe(false);
    expect(palettePicks.validateSubmission(s, "a", { order: [0, 1, 2, 3, 3] }).ok).toBe(false);
    expect(palettePicks.validateSubmission(s, "a", { order: [0, 1, 2, 3, 9] }).ok).toBe(false);
    expect(palettePicks.validateSubmission(s, "a", { order: [3, 1, 4, 0, 2] })).toEqual({
      ok: true,
      kind: "answer",
      payload: { order: [3, 1, 4, 0, 2] },
    });
    const locked = state({ submissions: [ranking("a", [3, 1, 4, 0, 2])] });
    expect(palettePicks.validateSubmission(locked, "a", { order: [0, 1, 2, 3, 4] })).toMatchObject({
      ok: false,
      error: "Your ranking is already locked in.",
    });
  });

  it("completes only once everyone has ranked", () => {
    const two = state({ submissions: [ranking("a", [0, 1, 2, 3, 4]), ranking("b", [1, 0, 2, 3, 4])] });
    expect(palettePicks.isRoundComplete(two)).toBe(false);
    const three = state({ submissions: [...two.submissions, ranking("c", [4, 3, 2, 1, 0])] });
    expect(palettePicks.isRoundComplete(three)).toBe(true);
    expect(palettePicks.computeReveal(three, false).final).toBe(true);
  });

  it("computes averages, consensus, and pair scores for three players", () => {
    const result = reveal([ranking("a", [0, 1, 2, 3, 4]), ranking("b", [1, 0, 2, 3, 4]), ranking("c", [4, 3, 2, 1, 0])]);
    expect(result.rankings).toEqual([
      { userId: "a", order: [0, 1, 2, 3, 4] },
      { userId: "b", order: [1, 0, 2, 3, 4] },
      { userId: "c", order: [4, 3, 2, 1, 0] },
    ]);
    expect(result.consensusOrder).toEqual([1, 0, 2, 3, 4]);
    expect(result.averages.map((a) => a.item)).toEqual([1, 0, 2, 3, 4]);
    expect(result.averages[0].averageRank).toBeCloseTo(7 / 3);
    expect(result.averages[1].averageRank).toBeCloseTo(8 / 3);
    expect(result.averages[2]).toEqual({ item: 2, averageRank: 3, spread: 0 });
    expect(result.averages.map((a) => a.spread)).toEqual([3, 4, 0, 2, 4]);
    expect(result.pairs).toEqual([
      { a: "a", b: "b", similarity: 83 },
      { a: "a", b: "c", similarity: 0 },
      { a: "b", b: "c", similarity: 0 },
    ]);
    expect(result.overallSimilarity).toBe(28);
    expect(result.missing).toEqual([]);
  });

  it("includes every item tied for the best average as a shared favorite", () => {
    const result = reveal([ranking("a", [0, 1, 2, 3, 4]), ranking("b", [1, 0, 2, 3, 4])]);
    expect(result.sharedFavorites).toEqual([0, 1]);
    expect(result.consensusOrder).toEqual([0, 1, 2, 3, 4]);
  });

  it("flags the items with the widest spread as the biggest disagreements", () => {
    const result = reveal([ranking("a", [0, 1, 2, 3, 4]), ranking("b", [1, 0, 2, 3, 4]), ranking("c", [4, 3, 2, 1, 0])]);
    expect(result.biggestDisagreements).toEqual([0, 4]);
    const agreed = reveal([ranking("a", [0, 1, 2, 3, 4]), ranking("b", [0, 1, 2, 3, 4])]);
    expect(agreed.biggestDisagreements).toEqual([]);
    expect(agreed.overallSimilarity).toBe(100);
  });

  it("keeps every pair tied for the top similarity", () => {
    const result = reveal([ranking("a", [0, 1, 2, 3, 4]), ranking("b", [1, 0, 2, 3, 4]), ranking("c", [0, 1, 2, 4, 3])]);
    expect(result.mostSimilarPairs).toEqual([
      { a: "a", b: "b", similarity: 83 },
      { a: "a", b: "c", similarity: 83 },
    ]);
    expect(result.overallSimilarity).toBe(78);
  });

  it("reveals early with one missing player and scores the remaining pair", () => {
    const s = state({ submissions: [ranking("a", [0, 1, 2, 3, 4]), ranking("b", [1, 0, 2, 3, 4])] });
    expect(palettePicks.earlyRevealCheck(s)).toEqual({ ok: true, reason: "", pending: ["c"] });
    const result = palettePicks.computeReveal(s, true).result as PalettePicksResult;
    expect(result.missing).toEqual(["c"]);
    expect(result.pairs).toHaveLength(1);
    expect(result.overallSimilarity).toBe(83);
    expect(result.mostSimilarPairs).toEqual([{ a: "a", b: "b", similarity: 83 }]);
  });

  it("gives no overall similarity with a single ranking", () => {
    const s = state({ submissions: [ranking("a", [2, 0, 1, 3, 4])] });
    expect(palettePicks.earlyRevealCheck(s).ok).toBe(false);
    const result = palettePicks.computeReveal(s, true).result as PalettePicksResult;
    expect(result.overallSimilarity).toBeNull();
    expect(result.pairs).toEqual([]);
    expect(result.mostSimilarPairs).toEqual([]);
    expect(result.biggestDisagreements).toEqual([]);
    expect(result.sharedFavorites).toEqual([2]);
    expect(result.consensusOrder).toEqual([2, 0, 1, 3, 4]);
    expect(result.missing).toEqual(["b", "c"]);
  });

  it("shows each player their own order and nobody else's before the reveal", () => {
    const s = state({ submissions: [ranking("a", [3, 1, 4, 0, 2])] });
    expect(palettePicks.view(s, "a")).toMatchObject({ phase: "waiting", myOrder: [3, 1, 4, 0, 2], submitted: ["a"], result: null });
    const other = palettePicks.view(s, "b") as { phase: string; myOrder: number[] | null };
    expect(other).toMatchObject({ phase: "rank", myOrder: null, submitted: ["a"] });
    expect(JSON.stringify(other)).not.toContain("[3,1,4,0,2]");
    const revealed = state({ status: "revealed", result: reveal(s.submissions, true) });
    expect(palettePicks.view(revealed, "b")).toMatchObject({ phase: "revealed", title: "Breakfast lineup" });
  });

  it("describes turns from each player's point of view", () => {
    const s = state({ submissions: [ranking("a", [0, 1, 2, 3, 4]), ranking("b", [1, 0, 2, 3, 4])] });
    expect(palettePicks.turnStatus(s, "c")).toEqual({ needsYou: true, line: "Your ranking is needed." });
    expect(palettePicks.turnStatus(s, "a")).toEqual({ needsYou: false, line: "Waiting for Cy's ranking." });
    const one = state({ submissions: [ranking("a", [0, 1, 2, 3, 4])] });
    expect(palettePicks.turnStatus(one, "a")).toEqual({ needsYou: false, line: "One of three rankings are in." });
    expect(palettePicks.turnStatus(state({ status: "revealed" }), "a")).toEqual({ needsYou: false, line: "The reveal is ready." });
  });
});
