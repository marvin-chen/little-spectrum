import { describe, expect, it } from "vitest";
import { localSubmission } from "./localView";
import type { SessionView } from "../sessionView";

describe("local preview submission", () => {
  it.each([
    ["hue-knew", { guess: 67 }, { myGuess: 67, phase: "guess" }],
    ["hue-clue", { col: 2, row: 3 }, { myGuess: { col: 2, row: 3 }, phase: "guess" }],
    ["true-colors", { answer: 2, prediction: 1 }, { myAnswer: 2, myPrediction: 1, phase: "waiting" }],
    ["same-wavelength", { word: "Moon" }, { myWord: "Moon", phase: "waiting" }],
    ["palette-picks", { order: [4, 3, 2, 1, 0] }, { myOrder: [4, 3, 2, 1, 0], phase: "waiting" }],
    ["color-quest", { photo: { url: "blob:local" } }, { myPhoto: { url: "blob:local" }, phase: "waiting" }],
  ] as const)("keeps %s input in the local waiting view", (game, input, expected) => {
    const session = { game, view: { phase: "answer", result: null, submitted: [] } } as unknown as SessionView;
    const next = localSubmission(session, "a", input);
    expect(next.view).toMatchObject(expected);
    expect(next.view).toMatchObject({ result: null, submitted: ["a"] });
    expect(session.view).toMatchObject({ phase: "answer", submitted: [] });
    expect(next.turn.needsYou).toBe(false);
  });

  it("shows the submitted clue without inventing other players' guesses", () => {
    const session = {
      game: "hue-knew",
      view: { clue: null, phase: "clue", target: 37, guessers: [{ userId: "b", submitted: false }] },
    } as unknown as SessionView;
    const next = localSubmission(session, "a", { clue: "Warm breeze" });
    expect(next.view).toMatchObject({ clue: "Warm breeze", phase: "guess", guessers: [{ submitted: false }] });
  });
});
