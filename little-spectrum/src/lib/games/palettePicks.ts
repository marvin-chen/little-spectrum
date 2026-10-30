import { RANKING_SETS } from "@/content/rankingSets";
import {
  allSubmitted,
  average,
  findSubmission,
  isRecord,
  pickUnused,
  roundSubmissions,
  simultaneousEarlyRevealCheck,
  simultaneousTurnStatus,
  type GameEngine,
  type SessionState,
} from "./engine";

export const ITEM_COUNT = 5;

// The largest possible sum of absolute rank differences for five items.
const MAX_RANK_DISTANCE = 12;

export type PalettePicksPrompt = { id: string; title: string; prompt: string; items: string[] };

export type PalettePicksPair = { a: string; b: string; similarity: number };

export type PalettePicksResult = {
  rankings: Array<{ userId: string; order: number[] }>;
  averages: Array<{ item: number; averageRank: number; spread: number }>;
  consensusOrder: number[];
  sharedFavorites: number[];
  biggestDisagreements: number[];
  pairs: PalettePicksPair[];
  mostSimilarPairs: PalettePicksPair[];
  overallSimilarity: number | null;
  missing: string[];
};

export type PalettePicksView = {
  phase: "rank" | "waiting" | "revealed";
  title: string;
  prompt: string;
  items: string[];
  myOrder: number[] | null;
  submitted: string[];
  result: PalettePicksResult | null;
};

export function isPermutation(order: unknown): order is number[] {
  if (!Array.isArray(order) || order.length !== ITEM_COUNT) return false;
  const seen = new Set<number>();
  for (const value of order) {
    if (!Number.isInteger(value) || value < 0 || value >= ITEM_COUNT || seen.has(value)) return false;
    seen.add(value);
  }
  return true;
}

// order[0] is first place, so the rank of an item is its position plus one.
function rankOf(order: number[], item: number): number {
  return order.indexOf(item) + 1;
}

export function pairSimilarity(a: number[], b: number[]): number {
  let distance = 0;
  for (let item = 0; item < ITEM_COUNT; item += 1) {
    distance += Math.abs(rankOf(a, item) - rankOf(b, item));
  }
  return Math.round(100 * (1 - distance / MAX_RANK_DISTANCE));
}

function rankingsOf(state: SessionState): Array<{ userId: string; order: number[] }> {
  return roundSubmissions(state)
    .filter((s) => s.kind === "answer" && isRecord(s.payload) && isPermutation(s.payload.order))
    .map((s) => ({ userId: s.userId, order: [...((s.payload as { order: number[] }).order)] }));
}

export const palettePicks: GameEngine = {
  key: "palette-picks",

  pickPrompt(recentPromptIds, _participants, random) {
    const set = pickUnused(RANKING_SETS, recentPromptIds, random);
    return {
      promptId: set.id,
      prompt: { id: set.id, title: set.title, prompt: set.prompt, items: [...set.items] } satisfies PalettePicksPrompt,
      secret: null,
    };
  },

  validateSubmission(state, userId, input) {
    if (findSubmission(state, userId, "answer")) return { ok: false, error: "Your ranking is already locked in." };
    if (!isRecord(input) || !isPermutation(input.order)) {
      return { ok: false, error: "Put all five items in order before confirming." };
    }
    return { ok: true, kind: "answer", payload: { order: [...input.order] } };
  },

  isRoundComplete(state) {
    return allSubmitted(state);
  },

  earlyRevealCheck(state) {
    return simultaneousEarlyRevealCheck(state);
  },

  computeReveal(state) {
    const rankings = rankingsOf(state);
    const ranked = new Set(rankings.map((r) => r.userId));
    const missing = state.participants.filter((p) => !ranked.has(p.userId)).map((p) => p.userId);

    const averages = Array.from({ length: ITEM_COUNT }, (_, item) => {
      const ranks = rankings.map((r) => rankOf(r.order, item));
      const sum = ranks.reduce((a, b) => a + b, 0);
      return {
        item,
        averageRank: ranks.length > 0 ? sum / ranks.length : 0,
        spread: ranks.length > 0 ? Math.max(...ranks) - Math.min(...ranks) : 0,
      };
    }).sort((a, b) => a.averageRank - b.averageRank || a.item - b.item);

    const bestAverage = averages[0].averageRank;
    const widestSpread = Math.max(...averages.map((a) => a.spread));
    const sharedFavorites = rankings.length > 0 ? averages.filter((a) => a.averageRank === bestAverage).map((a) => a.item) : [];
    const biggestDisagreements =
      widestSpread > 0
        ? averages
            .filter((a) => a.spread === widestSpread)
            .map((a) => a.item)
            .sort((a, b) => a - b)
        : [];

    const pairs: PalettePicksPair[] = [];
    for (let i = 0; i < rankings.length; i += 1) {
      for (let j = i + 1; j < rankings.length; j += 1) {
        pairs.push({
          a: rankings[i].userId,
          b: rankings[j].userId,
          similarity: pairSimilarity(rankings[i].order, rankings[j].order),
        });
      }
    }
    const topSimilarity = Math.max(...pairs.map((p) => p.similarity));

    const result: PalettePicksResult = {
      rankings,
      averages,
      consensusOrder: averages.map((a) => a.item),
      sharedFavorites,
      biggestDisagreements,
      pairs,
      mostSimilarPairs: pairs.filter((p) => p.similarity === topSimilarity),
      overallSimilarity: average(pairs.map((p) => p.similarity)),
      missing,
    };
    return { result, final: true };
  },

  view(state, userId): PalettePicksView {
    const prompt = state.prompt as PalettePicksPrompt;
    const revealed = state.status === "revealed";
    const mine = findSubmission(state, userId, "answer");
    const myOrder = isRecord(mine?.payload) && isPermutation(mine.payload.order) ? [...mine.payload.order] : null;
    return {
      phase: revealed ? "revealed" : myOrder ? "waiting" : "rank",
      title: prompt.title,
      prompt: prompt.prompt,
      items: prompt.items,
      myOrder,
      submitted: roundSubmissions(state)
        .filter((s) => s.kind === "answer")
        .map((s) => s.userId),
      result: revealed ? (state.result as PalettePicksResult) : null,
    };
  },

  turnStatus(state, userId) {
    return simultaneousTurnStatus(state, userId, { one: "ranking", many: "rankings" });
  },
};
