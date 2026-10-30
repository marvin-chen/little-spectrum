import { describe, expect, it } from "vitest";
import type { SessionState, Submission } from "./engine";
import { groupMatches, normalizeWord, sameWavelength, type SameWavelengthResult, type SameWavelengthView } from "./sameWavelength";

function state(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: "s1",
    gardenId: "g1",
    game: "same-wavelength",
    status: "active",
    createdBy: "a",
    clueGiverId: null,
    prompt: { id: "bring-to-the-beach", text: "Something you bring to the beach" },
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

function answer(userId: string, word: string, round = 1): Submission {
  return { userId, round, kind: "answer", payload: { word }, createdAt: "" };
}

describe("normalizeWord", () => {
  it("trims, collapses spaces, and folds case", () => {
    expect(normalizeWord("  Beach   Towel! ")).toBe("beach towel");
    expect(normalizeWord("ICE Cream")).toBe("ice cream");
  });

  it("strips apostrophes, hyphens, and other punctuation", () => {
    expect(normalizeWord("Don't")).toBe("dont");
    expect(normalizeWord("Sun-screen")).toBe("sunscreen");
    expect(normalizeWord("rock ’n’ roll")).toBe("rock n roll");
    expect(normalizeWord("(Flip-flops), obviously...")).toBe("flipflops obviously");
  });
});

describe("groupMatches", () => {
  it("groups pairs and trios, largest first, stable by first appearance", () => {
    const groups = groupMatches([
      { userId: "a", word: "Towel" },
      { userId: "b", word: "sunscreen" },
      { userId: "c", word: "towel " },
      { userId: "d", word: "Sun screen" },
      { userId: "e", word: "sunscreen!" },
      { userId: "f", word: "Sunscreen" },
      { userId: "g", word: "kite" },
    ]);
    expect(groups).toEqual([
      ["b", "e", "f"],
      ["a", "c"],
    ]);
  });

  it("returns no groups when nobody matches", () => {
    expect(
      groupMatches([
        { userId: "a", word: "towel" },
        { userId: "b", word: "kite" },
      ]),
    ).toEqual([]);
  });
});

describe("sameWavelength engine", () => {
  it("validates words and rejects a second submission in the same round", () => {
    const s = state();
    expect(sameWavelength.validateSubmission(s, "a", { word: "" }).ok).toBe(false);
    expect(sameWavelength.validateSubmission(s, "a", { word: "x".repeat(41) }).ok).toBe(false);
    expect(sameWavelength.validateSubmission(s, "a", { word: "!!!" }).ok).toBe(false);
    expect(sameWavelength.validateSubmission(s, "a", { word: "  Beach   Towel! " })).toEqual({
      ok: true,
      kind: "answer",
      payload: { word: "Beach Towel!" },
    });
    const locked = state({ submissions: [answer("a", "towel")] });
    expect(sameWavelength.validateSubmission(locked, "a", { word: "kite" }).ok).toBe(false);
  });

  it("completes the round only when everyone has answered", () => {
    const partial = state({ submissions: [answer("a", "towel"), answer("b", "kite")] });
    expect(sameWavelength.isRoundComplete(partial)).toBe(false);
    const full = state({ submissions: [...partial.submissions, answer("c", "sunscreen")] });
    expect(sameWavelength.isRoundComplete(full)).toBe(true);
  });

  it("allows an early reveal only with at least two answers in", () => {
    const one = state({ submissions: [answer("a", "towel")] });
    expect(sameWavelength.earlyRevealCheck(one)).toMatchObject({ ok: false, pending: ["b", "c"] });
    const two = state({ submissions: [answer("a", "towel"), answer("b", "kite")] });
    expect(sameWavelength.earlyRevealCheck(two)).toMatchObject({ ok: true, pending: ["c"] });
  });

  it("keeps going for three attempts and ends without a full match", () => {
    const first = state({ submissions: [answer("a", "towel"), answer("b", "Towel"), answer("c", "kite")] });
    const r1 = sameWavelength.computeReveal(first, false);
    expect(r1.final).toBe(false);
    expect(r1.result).toMatchObject({
      finished: false,
      outcome: "some",
      rounds: [{ round: 1, groups: [["a", "b"]], largestGroup: 2, allMatched: false, missing: [] }],
    });

    const second = state({
      round: 2,
      result: r1.result,
      submissions: [...first.submissions, answer("a", "kite", 2), answer("b", "sunscreen", 2), answer("c", "hat", 2)],
    });
    const view = sameWavelength.view(second, "a") as SameWavelengthView;
    expect(view.phase).toBe("waiting");
    expect(view.previousRounds.map((r) => r.round)).toEqual([1]);
    expect(view.attemptsLeft).toBe(1);
    const r2 = sameWavelength.computeReveal(second, false);
    expect(r2.final).toBe(false);
    expect((r2.result as SameWavelengthResult).rounds.map((r) => r.round)).toEqual([1, 2]);
    expect(r2.result).toMatchObject({ outcome: "none" });

    const third = state({
      round: 3,
      result: r2.result,
      submissions: [...second.submissions, answer("a", "towel", 3), answer("b", "towel", 3), answer("c", "kite", 3)],
    });
    const r3 = sameWavelength.computeReveal(third, false);
    expect(r3.final).toBe(true);
    expect(r3.result).toMatchObject({ finished: true, outcome: "some" });
    expect((r3.result as SameWavelengthResult).rounds.map((r) => r.round)).toEqual([1, 2, 3]);
  });

  it("ends on the first attempt when two people match", () => {
    const s = state({
      participants: [
        { userId: "a", name: "Ada", avatar: "sun:amber", predictsUserId: null },
        { userId: "b", name: "Bo", avatar: "cat:violet", predictsUserId: null },
      ],
      submissions: [answer("a", "Beach towel"), answer("b", "beach   TOWEL!")],
    });
    const outcome = sameWavelength.computeReveal(s, false);
    expect(outcome.final).toBe(true);
    expect(outcome.result).toMatchObject({
      finished: true,
      outcome: "all",
      rounds: [{ round: 1, groups: [["a", "b"]], allMatched: true, missing: [] }],
    });
  });

  it("ends the whole session on an early reveal and lists who was missing", () => {
    const s = state({ submissions: [answer("a", "towel"), answer("b", "towel")] });
    const outcome = sameWavelength.computeReveal(s, true);
    expect(outcome.final).toBe(true);
    expect(outcome.result).toMatchObject({
      finished: true,
      outcome: "some",
      rounds: [{ round: 1, groups: [["a", "b"]], allMatched: false, missing: ["c"] }],
    });
  });

  it("hides other players' current words until the reveal", () => {
    const s = state({ submissions: [answer("a", "towel"), answer("b", "kite")] });
    const mine = sameWavelength.view(s, "a") as SameWavelengthView;
    expect(mine).toMatchObject({ phase: "waiting", myWord: "towel", submitted: ["a", "b"], result: null });
    expect(JSON.stringify(mine)).not.toContain("kite");
    const theirs = sameWavelength.view(s, "c") as SameWavelengthView;
    expect(theirs).toMatchObject({ phase: "answer", myWord: null, category: "Something you bring to the beach" });
    expect(JSON.stringify(theirs)).not.toContain("towel");
  });

  it("describes turns from each player's point of view", () => {
    expect(sameWavelength.turnStatus(state(), "a")).toEqual({ needsYou: true, line: "Your answer is needed." });
    expect(sameWavelength.turnStatus(state({ round: 2 }), "a")).toEqual({
      needsYou: true,
      line: "Attempt 2. Your answer is needed.",
    });
    const one = state({ submissions: [answer("a", "towel")] });
    expect(sameWavelength.turnStatus(one, "a")).toEqual({ needsYou: false, line: "One of three answers are in." });
    const two = state({ submissions: [answer("a", "towel"), answer("b", "kite")] });
    expect(sameWavelength.turnStatus(two, "a")).toEqual({ needsYou: false, line: "Waiting for Cy's answer." });
    expect(sameWavelength.turnStatus(state({ status: "revealed" }), "a")).toEqual({
      needsYou: false,
      line: "The reveal is ready.",
    });
  });
});
