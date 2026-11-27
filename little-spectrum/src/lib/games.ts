import type { ColorKey } from "./colors";

export type GameKey = "hue-knew" | "true-colors" | "hue-clue" | "same-wavelength" | "palette-picks" | "color-quest";

export type GameDefinition = {
  key: GameKey;
  name: string;
  descriptor: string;
  color: ColorKey;
  colorLabel: string;
  kind: "clue" | "simultaneous";
  blurb: string;
  howTo: string[];
};

export const GAME_KEYS: GameKey[] = [
  "hue-knew",
  "true-colors",
  "hue-clue",
  "same-wavelength",
  "palette-picks",
  "color-quest",
];

export const GAMES: Record<GameKey, GameDefinition> = {
  "hue-knew": {
    key: "hue-knew",
    name: "Hue Knew?",
    descriptor: "Guess the vibe",
    color: "coral",
    colorLabel: "Coral",
    kind: "clue",
    blurb: "One of you gets a secret spot on a scale and drops a clue. Everyone else guesses where it lands.",
    howTo: [
      "The clue giver sees a secret target on a scale between two opposites.",
      "They write a short clue that points at it.",
      "Everyone else slides a guess into place.",
      "Closest guesses score highest. The group shares an average.",
    ],
  },
  "true-colors": {
    key: "true-colors",
    name: "True Colors",
    descriptor: "Predict your friend",
    color: "rose",
    colorLabel: "Rose",
    kind: "simultaneous",
    blurb: "Answer a quick question for yourself, then predict what a friend picked.",
    howTo: [
      "Everyone gets the same four-option question.",
      "Pick your own answer.",
      "Predict the answer of the friend assigned to you.",
      "Reveal who called it.",
    ],
  },
  "hue-clue": {
    key: "hue-clue",
    name: "Hue Clue",
    descriptor: "Find the color",
    color: "violet",
    colorLabel: "Violet",
    kind: "clue",
    blurb: "A secret square on a color grid, a clue of three words or fewer, and a hunt for the exact shade.",
    howTo: [
      "The clue giver gets a secret square on the color grid.",
      "They describe it in up to three words.",
      "Everyone else picks the square they think it is.",
      "Closer squares score higher.",
    ],
  },
  "same-wavelength": {
    key: "same-wavelength",
    name: "Same Wavelength",
    descriptor: "Match your minds",
    color: "blue",
    colorLabel: "Blue",
    kind: "simultaneous",
    blurb: "Same category, one answer each. Try to say the exact same thing without talking.",
    howTo: [
      "Everyone sees the same category.",
      "Type one word or a short phrase, then lock it in.",
      "Reveal together and look for matches.",
      "Up to three attempts to get everyone on the same page.",
    ],
  },
  "palette-picks": {
    key: "palette-picks",
    name: "Palette Picks",
    descriptor: "Rank and compare",
    color: "amber",
    colorLabel: "Amber",
    kind: "simultaneous",
    blurb: "Rank five things from best to least best, then see how your tastes line up.",
    howTo: [
      "Everyone gets the same five items.",
      "Order them first through fifth.",
      "Reveal everyone's rankings side by side.",
      "See shared favorites and the biggest disagreements.",
    ],
  },
  "color-quest": {
    key: "color-quest",
    name: "Color Quest",
    descriptor: "Share your world",
    color: "green",
    colorLabel: "Green",
    kind: "simultaneous",
    blurb: "One photo prompt for everyone. Snap something from your day and swap views.",
    howTo: [
      "Everyone gets the same photo prompt.",
      "Share one photo with an optional caption.",
      "Reveal the gallery together.",
      "It is saved as a memory. No score, just a glimpse.",
    ],
  },
};

export function isGameKey(value: string): value is GameKey {
  return (GAME_KEYS as string[]).includes(value);
}
