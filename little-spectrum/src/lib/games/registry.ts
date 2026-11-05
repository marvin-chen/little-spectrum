import type { GameKey } from "@/lib/games";
import { colorQuest } from "./colorQuest";
import type { GameEngine } from "./engine";
import { hueClue } from "./hueClue";
import { hueKnew } from "./hueKnew";
import { palettePicks } from "./palettePicks";
import { sameWavelength } from "./sameWavelength";
import { trueColors } from "./trueColors";

const engines = {
  "hue-knew": hueKnew,
  "true-colors": trueColors,
  "hue-clue": hueClue,
  "same-wavelength": sameWavelength,
  "palette-picks": palettePicks,
  "color-quest": colorQuest,
} satisfies Record<GameKey, GameEngine>;

export function getEngine(game: GameKey): GameEngine {
  return engines[game];
}

export function isGameAvailable(game: GameKey): boolean {
  return Boolean(engines[game]);
}
