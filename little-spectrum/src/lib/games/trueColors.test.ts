import { describe, expect, it } from "vitest";
import { assignPredictions, trueColors, type TrueColorsResult } from "./trueColors";
import type { SessionState, Submission } from "./engine";

function state(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: "s1",
    gardenId: "g1",
    game: "true-colors",
    status: "active",
    createdBy: "a",
    clueGiverId: null,
    prompt: {
      id: "ideal-saturday-morning",
      text: "Ideal Saturday morning?",
      options: ["Sleep in", "Farmers market", "Long run", "Pancake project"],
    },
    round: 1,
    result: null,
    earlyReveal: false,
    createdAt: "2026-10-26T00:00:00Z",
    revealedAt: null,
    participants: [
      { userId: "a", name: "Ada", avatar: "sun:amber", predictsUserId: "b" },
      { userId: "b", name: "Bo", avatar: "cat:violet", predictsUserId: "c" },
      { userId: "c", name: "Cy", avatar: "leaf:green", predictsUserId: "d" },
      { userId: "d", name: "Dee", avatar: "moon:blue", predictsUserId: "a" },
    ],
    submissions: [],
    photos: [],
    secret: null,
    ...overrides,
  };
}

function picks(userId: string, answer: number, prediction: number): Submission {
  return { userId, round: 1, kind: "answer", payload: { answer, prediction }, createdAt: "" };
}

describe("assignPredictions", () => {
  it("pairs two people with each other", () => {
    expect(assignPredictions(["b", "a"])).toEqual({ a: "b", b: "a" });
  });

  it("builds a single circle for four people in sorted order", () => {
    expect(assignPredictions(["d", "b", "a", "c"])).toEqual({ a: "b", b: "c", c: "d", d: "a" });
  });
});

describe("trueColors engine", () => {
  it("picks a question and assigns predictions to every participant", () => {
    const pick = trueColors.pickPrompt([], state().participants, () => 0);
    expect(pick.secret).toBeNull();
    expect(pick.prompt).toMatchObject({ id: pick.promptId, text: expect.any(String) });
    expect((pick.prompt as { options: string[] }).options).toHaveLength(4);
    expect(pick.predictions).toEqual({ a: "b", b: "c", c: "d", d: "a" });
  });

  it("accepts only integer options from 0 to 3 for both picks", () => {
    const s = state();
    expect(trueColors.validateSubmission(s, "a", { answer: 0, prediction: 3 })).toEqual({
      ok: true,
      kind: "answer",
      payload: { answer: 0, prediction: 3 },
    });
    expect(trueColors.validateSubmission(s, "a", { answer: 4, prediction: 0 }).ok).toBe(false);
    expect(trueColors.validateSubmission(s, "a", { answer: -1, prediction: 0 }).ok).toBe(false);
    expect(trueColors.validateSubmission(s, "a", { answer: 1.5, prediction: 0 }).ok).toBe(false);
    expect(trueColors.validateSubmission(s, "a", { answer: 1 }).ok).toBe(false);
    expect(trueColors.validateSubmission(s, "a", { answer: 1, prediction: "two" }).ok).toBe(false);
    expect(trueColors.validateSubmission(s, "a", null).ok).toBe(false);
  });

  it("rejects a second submission from the same person", () => {
    const s = state({ submissions: [picks("a", 1, 1)] });
    const result = trueColors.validateSubmission(s, "a", { answer: 2, prediction: 2 });
    expect(result).toEqual({ ok: false, error: "Your picks are already locked in." });
  });

  it("scores every prediction when everyone is in", () => {
    const s = state({
      submissions: [picks("a", 0, 2), picks("b", 2, 1), picks("c", 1, 3), picks("d", 3, 1)],
    });
    expect(trueColors.isRoundComplete(s)).toBe(true);
    const outcome = trueColors.computeReveal(s, false);
    expect(outcome.final).toBe(true);
    const result = outcome.result as TrueColorsResult;
    expect(result).toMatchObject({ correct: 3, scorable: 4, missing: [] });
    expect(result.predictions).toEqual([
      { predictorId: "a", targetId: "b", predicted: 2, actual: 2, correct: true },
      { predictorId: "b", targetId: "c", predicted: 1, actual: 1, correct: true },
      { predictorId: "c", targetId: "d", predicted: 3, actual: 3, correct: true },
      { predictorId: "d", targetId: "a", predicted: 1, actual: 0, correct: false },
    ]);
  });

  it("leaves predictions about a missing player unscored on early reveal", () => {
    const s = state({ submissions: [picks("a", 0, 2), picks("b", 2, 1), picks("c", 1, 3)] });
    expect(trueColors.isRoundComplete(s)).toBe(false);
    expect(trueColors.earlyRevealCheck(s)).toEqual({ ok: true, reason: "", pending: ["d"] });
    const result = trueColors.computeReveal(s, true).result as TrueColorsResult;
    expect(result).toMatchObject({ correct: 2, scorable: 2, missing: ["d"] });
    expect(result.predictions).toContainEqual({
      predictorId: "c",
      targetId: "d",
      predicted: 3,
      actual: null,
      correct: null,
    });
    expect(result.predictions.some((p) => p.predictorId === "d")).toBe(false);
  });

  it("reports nothing scorable when no submitted pair points at each other", () => {
    const s = state({ submissions: [picks("a", 0, 2), picks("c", 1, 3)] });
    expect(trueColors.earlyRevealCheck(s)).toMatchObject({ ok: true, pending: ["b", "d"] });
    const result = trueColors.computeReveal(s, true).result as TrueColorsResult;
    expect(result).toMatchObject({ correct: 0, scorable: 0, missing: ["b", "d"] });
    expect(result.answers).toEqual([
      { userId: "a", answer: 0 },
      { userId: "c", answer: 1 },
    ]);
    expect(result.predictions.every((p) => p.correct === null)).toBe(true);
  });

  it("blocks early reveal with fewer than two players in", () => {
    expect(trueColors.earlyRevealCheck(state({ submissions: [picks("a", 0, 0)] })).ok).toBe(false);
  });

  it("shows only the viewer's own picks before the reveal", () => {
    const s = state({ submissions: [picks("a", 0, 2), picks("b", 2, 1)] });
    expect(trueColors.view(s, "a")).toMatchObject({
      phase: "waiting",
      question: "Ideal Saturday morning?",
      predictsUserId: "b",
      myAnswer: 0,
      myPrediction: 2,
      submitted: ["a", "b"],
      result: null,
    });
    expect(trueColors.view(s, "c")).toMatchObject({
      phase: "answer",
      predictsUserId: "d",
      myAnswer: null,
      myPrediction: null,
    });
    expect(JSON.stringify(trueColors.view(s, "c"))).not.toContain('"answer":0');
  });

  it("exposes the result once revealed", () => {
    const result: TrueColorsResult = { answers: [], predictions: [], correct: 0, scorable: 0, missing: [] };
    expect(trueColors.view(state({ status: "revealed", result }), "a")).toMatchObject({ phase: "revealed", result });
  });

  it("describes turns from each player's point of view", () => {
    expect(trueColors.turnStatus(state(), "a")).toEqual({ needsYou: true, line: "Your picks are needed." });
    const two = state({ submissions: [picks("a", 0, 0), picks("c", 0, 0)] });
    expect(trueColors.turnStatus(two, "a")).toEqual({ needsYou: false, line: "Two of four picks are in." });
    const three = state({ submissions: [...two.submissions, picks("d", 0, 0)] });
    expect(trueColors.turnStatus(three, "a")).toEqual({ needsYou: false, line: "Waiting for Bo's picks." });
    expect(trueColors.turnStatus(state({ status: "revealed" }), "a")).toEqual({
      needsYou: false,
      line: "The reveal is ready.",
    });
  });
});
