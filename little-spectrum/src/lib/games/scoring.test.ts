import { describe, expect, it } from "vitest";
import { scoreGuess } from "./hueKnew";
import { scoreDistance } from "./hueClue";
import { manhattan } from "./hueCluePalette";
import { pairSimilarity, isPermutation } from "./palettePicks";
import { normalizeWord } from "./sameWavelength";

describe("scoring tables", () => {
  it.each([
    [50, 50, 100],
    [50, 49, 98],
    [50, 0, 0],
    [0, 100, 0],
    [100, 51, 2],
    [30, 80, 0],
  ])("Hue Knew? target %i guess %i scores %i", (target, guess, expected) => {
    expect(scoreGuess(target, guess)).toBe(expected);
  });

  it.each([
    [{ col: 0, row: 0 }, { col: 0, row: 0 }, 0, 100],
    [{ col: 0, row: 0 }, { col: 1, row: 0 }, 1, 85],
    [{ col: 3, row: 2 }, { col: 0, row: 7 }, 8, 0],
    [{ col: 11, row: 7 }, { col: 0, row: 0 }, 18, 0],
    [{ col: 5, row: 5 }, { col: 7, row: 2 }, 5, 25],
  ])("Hue Clue distance from %o to %o is %i scoring %i", (a, b, distance, expected) => {
    expect(manhattan(a, b)).toBe(distance);
    expect(scoreDistance(distance)).toBe(expected);
  });

  it.each([
    [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], 100],
    [[0, 1, 2, 3, 4], [4, 3, 2, 1, 0], 0],
    [[0, 1, 2, 3, 4], [1, 0, 2, 3, 4], 83],
    [[0, 1, 2, 3, 4], [0, 1, 2, 4, 3], 83],
    [[0, 1, 2, 3, 4], [1, 2, 3, 4, 0], 33],
  ])("Palette Picks %j versus %j is %i alike", (a, b, expected) => {
    expect(pairSimilarity(a, b)).toBe(expected);
  });

  it.each([
    [[0, 1, 2, 3, 4], true],
    [[4, 3, 2, 1, 0], true],
    [[0, 1, 2, 3], false],
    [[0, 1, 2, 3, 3], false],
    [[0, 1, 2, 3, 5], false],
    [["0", 1, 2, 3, 4], false],
    ["01234", false],
  ])("isPermutation(%j) is %s", (order, expected) => {
    expect(isPermutation(order)).toBe(expected);
  });

  it.each([
    ["  Beach   Towel! ", "beach towel"],
    ["Sun-screen", "sunscreen"],
    ["TOWEL.", "towel"],
    ["“Flip flops”", "flip flops"],
    ["ice cream", "ice cream"],
  ])("normalizeWord(%j) is %j", (input, expected) => {
    expect(normalizeWord(input)).toBe(expected);
  });
});
