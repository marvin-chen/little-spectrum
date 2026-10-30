import type { GameKey } from "@/lib/games";
import type { GameEngine } from "./engine";
import { hueKnew } from "./hueKnew";

const engines: Partial<Record<GameKey, GameEngine>> = {
  "hue-knew": hueKnew,
};

export function getEngine(game: GameKey): GameEngine {
  const engine = engines[game];
  if (!engine) throw new Error(`Game ${game} is not available yet`);
  return engine;
}

export function isGameAvailable(game: GameKey): boolean {
  return Boolean(engines[game]);
}
