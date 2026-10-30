// Fixtures for demo mode, shown when Supabase is not configured. Nothing here touches a server.
import type { GrowthSummary } from "@/lib/data/growth";
import type { SessionCard, SessionView } from "@/lib/data/sessions";
import type { GameKey } from "@/lib/games";
import type { HueClueResult } from "@/lib/games/hueClue";
import type { HueKnewResult } from "@/lib/games/hueKnew";
import type { PalettePicksResult } from "@/lib/games/palettePicks";
import type { SameWavelengthResult } from "@/lib/games/sameWavelength";
import type { TrueColorsResult } from "@/lib/games/trueColors";
import { addDays, formatWeekReset, weekStartFor } from "@/lib/week";

export type DemoMember = { userId: string; name: string; avatar: string };

export const DEMO_VIEWER_ID = "demo-jamie";

export const DEMO_GARDEN = {
  id: "demo",
  name: "Sunday Sprouts",
  theme: "meadow",
  timezone: "America/Los_Angeles",
  members: [
    { userId: "demo-jamie", name: "Jamie", avatar: "sun:coral" },
    { userId: "demo-priya", name: "Priya", avatar: "flower:violet" },
    { userId: "demo-theo", name: "Theo", avatar: "cat:blue" },
    { userId: "demo-noor", name: "Noor", avatar: "moon:amber" },
  ] satisfies DemoMember[],
};

const JAMIE = "demo-jamie";
const PRIYA = "demo-priya";
const THEO = "demo-theo";
const NOOR = "demo-noor";

// A fixed Thursday morning so the demo never drifts as real weeks pass.
export const DEMO_NOW = new Date("2026-10-29T17:00:00Z");
const WEEK = weekStartFor(DEMO_NOW, DEMO_GARDEN.timezone);

const REWARD_ITEMS = ["sprout", "tulips", "sunflower", "mushrooms", "lantern"];
const REWARD_WEEKS = [addDays(WEEK, -35), addDays(WEEK, -21), addDays(WEEK, -14), addDays(WEEK, -7), WEEK];

export const DEMO_GROWTH: GrowthSummary = {
  weekStart: WEEK,
  weekResetLabel: formatWeekReset(WEEK, DEMO_GARDEN.timezone),
  completionsThisWeek: 3,
  goal: 3,
  rewardedThisWeek: true,
  totalCompletions: 16,
  streak: 4,
  rewards: REWARD_ITEMS.map((itemKey, i) => ({
    id: `demo-reward-${i + 1}`,
    itemKey,
    variant: i % 3,
    ordinal: i + 1,
    weekStart: REWARD_WEEKS[i],
    sessionId: null,
    createdAt: `${REWARD_WEEKS[i]}T20:00:00Z`,
  })),
};

const EVERYONE = DEMO_GARDEN.members;

export const DEMO_CARDS: SessionCard[] = [
  {
    id: "demo-card-hue-knew",
    game: "hue-knew",
    status: "active",
    round: 1,
    turn: { needsYou: true, line: "Your clue is ready." },
    participants: EVERYONE,
    createdAt: "2026-10-29T15:40:00Z",
    revealedAt: null,
  },
  {
    id: "demo-card-true-colors",
    game: "true-colors",
    status: "active",
    round: 1,
    turn: { needsYou: false, line: "Waiting for Theo's picks." },
    participants: EVERYONE,
    createdAt: "2026-10-29T14:05:00Z",
    revealedAt: null,
  },
  {
    id: "demo-same-wavelength",
    game: "same-wavelength",
    status: "revealed",
    round: 2,
    turn: { needsYou: false, line: "The reveal is ready." },
    participants: EVERYONE,
    createdAt: "2026-10-28T02:10:00Z",
    revealedAt: "2026-10-28T03:25:00Z",
  },
  {
    id: "demo-palette-picks",
    game: "palette-picks",
    status: "revealed",
    round: 1,
    turn: { needsYou: false, line: "The reveal is ready." },
    participants: EVERYONE,
    createdAt: "2026-10-27T01:30:00Z",
    revealedAt: "2026-10-27T04:45:00Z",
  },
];

function revealedSession(input: {
  id: string;
  game: GameKey;
  round?: number;
  createdBy: string;
  clueGiverId?: string;
  createdAt: string;
  revealedAt: string;
}): SessionView {
  return {
    id: input.id,
    gardenId: DEMO_GARDEN.id,
    game: input.game,
    status: "revealed",
    round: input.round ?? 1,
    createdBy: input.createdBy,
    clueGiverId: input.clueGiverId ?? null,
    createdAt: input.createdAt,
    revealedAt: input.revealedAt,
    earlyReveal: false,
    participants: EVERYONE,
    isCreator: input.createdBy === DEMO_VIEWER_ID,
    turn: { needsYou: false, line: "The reveal is ready." },
    earlyReveal_: { ok: false, reason: "This round is already revealed.", pending: [], pendingNames: [] },
    view: null,
  };
}

export type DemoResult =
  | { game: "hue-knew"; session: SessionView; left: string; right: string; result: HueKnewResult }
  | {
      game: "true-colors";
      session: SessionView;
      prompt: { text: string; options: [string, string, string, string] };
      result: TrueColorsResult;
    }
  | { game: "hue-clue"; session: SessionView; result: HueClueResult }
  | { game: "same-wavelength"; session: SessionView; result: SameWavelengthResult }
  | { game: "palette-picks"; session: SessionView; items: string[]; result: PalettePicksResult };

// Scores below follow the real engines: Hue Knew? is 100 minus twice the distance, Hue Clue is 100 minus 15 per step,
// Palette Picks similarity is 100 times one minus the rank distance over 12, and shared scores are rounded averages.
export const DEMO_RESULTS: DemoResult[] = [
  {
    game: "same-wavelength",
    session: revealedSession({
      id: "demo-same-wavelength",
      game: "same-wavelength",
      round: 2,
      createdBy: NOOR,
      createdAt: "2026-10-28T02:10:00Z",
      revealedAt: "2026-10-28T03:25:00Z",
    }),
    result: {
      finished: true,
      outcome: "all",
      rounds: [
        {
          round: 1,
          answers: [
            { userId: JAMIE, word: "pancakes" },
            { userId: PRIYA, word: "waffles" },
            { userId: THEO, word: "pancakes" },
            { userId: NOOR, word: "eggs" },
          ],
          groups: [[JAMIE, THEO]],
          largestGroup: 2,
          allMatched: false,
          missing: [],
        },
        {
          round: 2,
          answers: [
            { userId: JAMIE, word: "pancakes" },
            { userId: PRIYA, word: "pancakes" },
            { userId: THEO, word: "pancakes" },
            { userId: NOOR, word: "pancakes" },
          ],
          groups: [[JAMIE, PRIYA, THEO, NOOR]],
          largestGroup: 4,
          allMatched: true,
          missing: [],
        },
      ],
    },
  },
  {
    game: "palette-picks",
    session: revealedSession({
      id: "demo-palette-picks",
      game: "palette-picks",
      createdBy: THEO,
      createdAt: "2026-10-27T01:30:00Z",
      revealedAt: "2026-10-27T04:45:00Z",
    }),
    items: ["Pancakes", "Avocado toast", "Overnight oats", "Breakfast burrito", "Eggs benedict"],
    result: {
      rankings: [
        { userId: JAMIE, order: [0, 3, 4, 1, 2] },
        { userId: PRIYA, order: [1, 0, 2, 3, 4] },
        { userId: THEO, order: [3, 0, 4, 1, 2] },
        { userId: NOOR, order: [0, 1, 3, 4, 2] },
      ],
      averages: [
        { item: 0, averageRank: 1.5, spread: 1 },
        { item: 3, averageRank: 2.5, spread: 3 },
        { item: 1, averageRank: 2.75, spread: 3 },
        { item: 4, averageRank: 3.75, spread: 2 },
        { item: 2, averageRank: 4.5, spread: 2 },
      ],
      consensusOrder: [0, 3, 1, 4, 2],
      sharedFavorites: [0],
      biggestDisagreements: [1, 3],
      pairs: [
        { a: JAMIE, b: PRIYA, similarity: 17 },
        { a: JAMIE, b: THEO, similarity: 83 },
        { a: JAMIE, b: NOOR, similarity: 67 },
        { a: PRIYA, b: THEO, similarity: 17 },
        { a: PRIYA, b: NOOR, similarity: 50 },
        { a: THEO, b: NOOR, similarity: 50 },
      ],
      mostSimilarPairs: [{ a: JAMIE, b: THEO, similarity: 83 }],
      overallSimilarity: 47,
      missing: [],
    },
  },
  {
    game: "hue-knew",
    session: revealedSession({
      id: "demo-hue-knew",
      game: "hue-knew",
      createdBy: PRIYA,
      clueGiverId: PRIYA,
      createdAt: "2026-10-25T16:20:00Z",
      revealedAt: "2026-10-25T19:02:00Z",
    }),
    left: "Cozy",
    right: "Chaotic",
    result: {
      target: 14,
      clue: "Sunday pancakes",
      guesses: [
        { userId: JAMIE, guess: 20, score: 88 },
        { userId: THEO, guess: 9, score: 90 },
        { userId: NOOR, guess: 31, score: 66 },
      ],
      shared: 81,
      missing: [],
      suggestedClueGiverId: THEO,
    },
  },
  {
    game: "true-colors",
    session: revealedSession({
      id: "demo-true-colors",
      game: "true-colors",
      createdBy: JAMIE,
      createdAt: "2026-10-22T00:15:00Z",
      revealedAt: "2026-10-22T02:40:00Z",
    }),
    prompt: {
      text: "Ideal Saturday morning?",
      options: ["Sleep in", "Farmers market", "Long run", "Pancake project"],
    },
    result: {
      answers: [
        { userId: JAMIE, answer: 3 },
        { userId: PRIYA, answer: 1 },
        { userId: THEO, answer: 2 },
        { userId: NOOR, answer: 0 },
      ],
      predictions: [
        { predictorId: JAMIE, targetId: PRIYA, predicted: 1, actual: 1, correct: true },
        { predictorId: PRIYA, targetId: THEO, predicted: 0, actual: 2, correct: false },
        { predictorId: THEO, targetId: NOOR, predicted: 0, actual: 0, correct: true },
        { predictorId: NOOR, targetId: JAMIE, predicted: 3, actual: 3, correct: true },
      ],
      correct: 3,
      scorable: 4,
      missing: [],
    },
  },
  {
    game: "hue-clue",
    session: revealedSession({
      id: "demo-hue-clue",
      game: "hue-clue",
      createdBy: THEO,
      clueGiverId: THEO,
      createdAt: "2026-10-18T22:05:00Z",
      revealedAt: "2026-10-19T01:12:00Z",
    }),
    result: {
      target: { col: 7, row: 1 },
      clue: "Hotel pool",
      guesses: [
        { userId: JAMIE, col: 7, row: 2, distance: 1, score: 85 },
        { userId: PRIYA, col: 6, row: 1, distance: 1, score: 85 },
        { userId: NOOR, col: 8, row: 3, distance: 3, score: 55 },
      ],
      shared: 75,
      missing: [],
      suggestedClueGiverId: JAMIE,
    },
  },
];
