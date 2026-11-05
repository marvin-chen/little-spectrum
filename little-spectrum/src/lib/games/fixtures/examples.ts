import type { GameKey } from "@/lib/games";
import type { SessionState } from "../contract";
import { getEngine } from "../registry";
import { createFixture, FIXTURE_TIME, revealFixture, submitFixture } from "./builders";

export const FIXTURE_SCENARIOS = ["initial", "waiting", "revealed", "early"] as const;
export type FixtureScenario = typeof FIXTURE_SCENARIOS[number];

export function exampleInput(game: GameKey, index: number): unknown {
  switch (game) {
    case "hue-knew": return { guess: 30 + index * 5 };
    case "hue-clue": return { col: index % 12, row: index % 8 };
    case "true-colors": return { answer: index % 4, prediction: (index + 1) % 4 };
    case "same-wavelength": return { word: "Sunshine" };
    case "palette-picks": return { order: index % 2 ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4] };
    case "color-quest": return { photoId: `fixture-photo-${index + 1}`, caption: `A little color from friend ${index + 1}` };
  }
}

/** Server/test only: returns private synthetic state, not browser props. */
export function gameExample(game: GameKey, scenario: FixtureScenario, players: 2 | 3 | 8 = 3): SessionState {
  const engine = getEngine(game);
  let state = createFixture(engine, players);
  if (game === "color-quest") {
    state.photos = state.participants.map((p, i) => ({
      id: `fixture-photo-${i + 1}`, userId: p.userId, storagePath: `fixture-only/${i + 1}.jpg`,
      caption: null, width: 800, height: 600, status: "ready", createdAt: FIXTURE_TIME,
    }));
  }
  if (scenario === "initial") return state;
  if (state.clueGiverId) state = submitFixture(engine, state, state.clueGiverId, { clue: "Warm summer evening" });
  const answerers = state.participants.filter((p) => p.userId !== state.clueGiverId);
  // Two-player early reveal has no missing players; use three/eight to review partial results.
  const count = scenario === "waiting" ? 1 : scenario === "early" ? Math.min(answerers.length, state.clueGiverId ? 1 : 2) : answerers.length;
  for (const p of answerers.slice(0, count)) {
    const index = state.participants.findIndex((candidate) => candidate.userId === p.userId);
    state = submitFixture(engine, state, p.userId, exampleInput(game, index));
  }
  if (scenario === "revealed" || scenario === "early") state = revealFixture(engine, state, scenario === "early");
  return state;
}
