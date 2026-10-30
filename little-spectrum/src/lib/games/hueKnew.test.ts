import { describe, expect, it } from "vitest";
import { hueKnew, scoreGuess, suggestNextClueGiver } from "./hueKnew";
import type { SessionState } from "./engine";

function state(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: "s1",
    gardenId: "g1",
    game: "hue-knew",
    status: "active",
    createdBy: "a",
    clueGiverId: "a",
    prompt: { id: "cozy-chaotic", left: "Cozy", right: "Chaotic" },
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
    secret: { target: 70 },
    ...overrides,
  };
}

describe("scoreGuess", () => {
  it("scores exact guesses 100 and clamps at zero", () => {
    expect(scoreGuess(70, 70)).toBe(100);
    expect(scoreGuess(70, 60)).toBe(80);
    expect(scoreGuess(70, 10)).toBe(0);
    expect(scoreGuess(0, 100)).toBe(0);
  });
});

describe("hueKnew engine", () => {
  it("hides the target from guessers and shows it to the clue giver", () => {
    const s = state();
    expect(hueKnew.view(s, "a")).toMatchObject({ isClueGiver: true, target: 70, phase: "clue" });
    expect(hueKnew.view(s, "b")).toMatchObject({ isClueGiver: false, target: null, phase: "clue" });
  });

  it("rejects guesses before the clue and clues from non clue givers", () => {
    const s = state();
    expect(hueKnew.validateSubmission(s, "b", { guess: 50 }).ok).toBe(false);
    expect(hueKnew.validateSubmission(s, "a", { clue: "" }).ok).toBe(false);
    expect(hueKnew.validateSubmission(s, "a", { clue: "x".repeat(61) }).ok).toBe(false);
    expect(hueKnew.validateSubmission(s, "a", { clue: "  warm   blanket " })).toEqual({
      ok: true,
      kind: "clue",
      payload: { clue: "warm blanket" },
    });
  });

  it("completes only when every guesser has answered and computes scores", () => {
    const withClue = state({
      submissions: [{ userId: "a", round: 1, kind: "clue", payload: { clue: "blanket" }, createdAt: "" }],
    });
    expect(hueKnew.isRoundComplete(withClue)).toBe(false);
    expect(hueKnew.earlyRevealCheck(withClue).ok).toBe(false);
    const oneGuess = state({
      submissions: [
        ...withClue.submissions,
        { userId: "b", round: 1, kind: "answer", payload: { guess: 60 }, createdAt: "" },
      ],
    });
    expect(hueKnew.isRoundComplete(oneGuess)).toBe(false);
    expect(hueKnew.earlyRevealCheck(oneGuess)).toMatchObject({ ok: true, pending: ["c"] });
    const early = hueKnew.computeReveal(oneGuess, true);
    expect(early.result).toMatchObject({ target: 70, clue: "blanket", shared: 80, missing: ["c"] });

    const all = state({
      submissions: [
        ...oneGuess.submissions,
        { userId: "c", round: 1, kind: "answer", payload: { guess: 90 }, createdAt: "" },
      ],
    });
    expect(hueKnew.isRoundComplete(all)).toBe(true);
    const outcome = hueKnew.computeReveal(all, false);
    expect(outcome.final).toBe(true);
    expect(outcome.result).toMatchObject({ shared: 70, missing: [] });
  });

  it("suggests a different clue giver next time", () => {
    expect(suggestNextClueGiver(state())).toBe("b");
    expect(suggestNextClueGiver(state({ clueGiverId: "c" }))).toBe("a");
  });

  it("describes turns from each player's point of view", () => {
    const s = state();
    expect(hueKnew.turnStatus(s, "a")).toEqual({ needsYou: true, line: "Your clue is needed." });
    expect(hueKnew.turnStatus(s, "b")).toEqual({ needsYou: false, line: "Waiting for Ada's clue." });
    const withClue = state({
      submissions: [
        { userId: "a", round: 1, kind: "clue", payload: { clue: "blanket" }, createdAt: "" },
        { userId: "b", round: 1, kind: "answer", payload: { guess: 60 }, createdAt: "" },
      ],
    });
    expect(hueKnew.turnStatus(withClue, "c")).toEqual({ needsYou: true, line: "Your clue is ready." });
    expect(hueKnew.turnStatus(withClue, "b")).toEqual({ needsYou: false, line: "Waiting for Cy's guess." });
  });
});
