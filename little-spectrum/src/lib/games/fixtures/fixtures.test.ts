import { describe, expect, it, vi } from "vitest";
import { GAME_KEYS } from "@/lib/games";
import { createFixture, previewFixture, revealFixture, submitFixture } from "./builders";
vi.mock("@/lib/photos/server", () => ({ signedPhotoUrls: vi.fn(() => { throw new Error("Fixtures must not sign real URLs"); }) }));
const { getEngine } = await import("../registry");
const { gameExample, exampleInput, FIXTURE_SCENARIOS } = await import("./examples");

describe.each(GAME_KEYS)("%s shared fixtures", (game) => {
  it.each([2, 3, 8] as const)("builds deterministic valid lifecycle examples for %i players", async (players) => {
    const engine = getEngine(game);
    for (const scenario of FIXTURE_SCENARIOS) {
      const state = gameExample(game, scenario, players);
      expect(state).toEqual(gameExample(game, scenario, players));
      expect(state.participants).toHaveLength(players);
      for (const p of state.participants) {
        const projected = await previewFixture(engine, state, p.userId);
        expect(projected.game).toBe(game);
        expect(JSON.stringify(projected)).not.toContain("fixture-only/");
        expect(projected).not.toHaveProperty("secret");
        expect(projected).not.toHaveProperty("submissions");
      }
      if (scenario === "revealed" || scenario === "early") {
        expect(state.status).toBe("revealed");
        expect(state.result).not.toBeNull();
        expect(state.earlyReveal).toBe(scenario === "early");
      } else expect(state.status).toBe("active");
    }
  });

  it("rejects premature reveals, outsiders, duplicate and post-reveal submissions", async () => {
    const engine = getEngine(game);
    const initial = gameExample(game, "initial");
    expect(() => revealFixture(engine, initial)).toThrow("not ready");
    expect(() => revealFixture(engine, initial, true)).toThrow("not ready");
    await expect(previewFixture(engine, initial, "outsider")).rejects.toThrow("Only participants");
    expect(() => submitFixture(engine, initial, "outsider", {})).toThrow("participant");
    const waiting = gameExample(game, "waiting");
    const submitted = waiting.submissions.at(-1)!;
    expect(() => submitFixture(engine, waiting, submitted.userId, submitted.payload)).toThrow();
    expect(() => submitFixture(engine, gameExample(game, "revealed"), initial.createdBy, {})).toThrow("already revealed");
  });

  it("keeps earlier examples independent and active answers private", async () => {
    const engine = getEngine(game);
    const waiting = gameExample(game, "waiting", 8);
    const before = structuredClone(waiting);
    const last = waiting.participants[7];
    submitFixture(engine, waiting, last.userId, exampleInput(game, 7));
    expect(waiting).toEqual(before);
    const view = (await previewFixture(engine, waiting, last.userId)).view as Record<string, unknown>;
    if (game === "color-quest") {
      expect(view.gallery).toBeNull();
      expect(view.myPhoto).toBeNull();
      expect(JSON.stringify(view)).not.toContain("fixture-photo-");
    } else expect(view.result).toBeNull();
    if (game === "hue-knew" || game === "hue-clue") expect(view.target).toBeNull();
    if (game === "true-colors") expect(view.myAnswer).toBeNull();
    if (game === "same-wavelength") expect(view.myWord).toBeNull();
    if (game === "palette-picks") expect(view.myOrder).toBeNull();
  });
});

it("advances a nonmatching round without finalizing and preserves only earlier answers", async () => {
  const engine = getEngine("same-wavelength");
  let state = createFixture(engine, 2);
  state = submitFixture(engine, state, state.participants[0].userId, { word: "Moon" });
  state = submitFixture(engine, state, state.participants[1].userId, { word: "Sun" });
  state = revealFixture(engine, state);
  expect(state.status).toBe("active");
  expect(state.round).toBe(2);
  expect(state.revealedAt).toBeNull();
  const view = (await previewFixture(engine, state, state.createdBy)).view;
  expect(view).toMatchObject({ phase: "answer", myWord: null, previousRounds: [{ round: 1, answers: [{ word: "Moon" }, { word: "Sun" }] }] });
});

it("represents deleted photos without signing or exposing storage paths", async () => {
  const engine = getEngine("color-quest");
  const state = gameExample("color-quest", "revealed");
  state.photos = [];
  const view = (await previewFixture(engine, state, state.createdBy)).view;
  expect(view).toMatchObject({ gallery: [{ removed: true, url: null }, { removed: true, url: null }, { removed: true, url: null }] });
});
