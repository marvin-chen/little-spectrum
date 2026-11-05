import { CATEGORIES } from "@/content/categories";
import {
  cleanText,
  findSubmission,
  isRecord,
  pickUnused,
  roundSubmissions,
  simultaneousEarlyRevealCheck,
  simultaneousTurnStatus,
  type GameEngine,
  type SessionState,
} from "./engine";

export type SameWavelengthPrompt = { id: string; text: string };

export type SameWavelengthRound = {
  round: number;
  answers: Array<{ userId: string; word: string }>;
  // Groups of user ids whose normalized words match, largest first.
  groups: string[][];
  largestGroup: number;
  allMatched: boolean;
  missing: string[];
};

export type SameWavelengthResult = {
  rounds: SameWavelengthRound[];
  finished: boolean;
  outcome: "all" | "some" | "none";
};

export type SameWavelengthView = {
  phase: "answer" | "waiting" | "revealed";
  category: string;
  round: number;
  // Attempts remaining after the current one.
  attemptsLeft: number;
  myWord: string | null;
  submitted: string[];
  previousRounds: SameWavelengthRound[];
  result: SameWavelengthResult | null;
};

export const MAX_ATTEMPTS = 3;
export const MAX_WORD_LENGTH = 40;

// Exact matching after trimming, case folding, and dropping punctuation. No semantic matching.
export function normalizeWord(input: string): string {
  return input
    .toLowerCase()
    .replace(/\p{P}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Groups of two or more user ids sharing a normalized word, largest first, stable by first appearance.
export function groupMatches(answers: Array<{ userId: string; word: string }>): string[][] {
  const byWord = new Map<string, string[]>();
  for (const { userId, word } of answers) {
    const key = normalizeWord(word);
    if (!key) continue;
    const group = byWord.get(key);
    if (group) {
      if (!group.includes(userId)) group.push(userId);
    } else {
      byWord.set(key, [userId]);
    }
  }
  return [...byWord.values()].filter((group) => group.length >= 2).sort((a, b) => b.length - a.length);
}

function wordOf(payload: unknown): string | null {
  return isRecord(payload) && typeof payload.word === "string" ? payload.word : null;
}

function storedRounds(state: SessionState): SameWavelengthRound[] {
  return isRecord(state.result) && Array.isArray(state.result.rounds)
    ? (state.result.rounds as SameWavelengthRound[])
    : [];
}

function currentAnswers(state: SessionState): Array<{ userId: string; word: string }> {
  const answers: Array<{ userId: string; word: string }> = [];
  for (const s of roundSubmissions(state)) {
    if (s.kind !== "answer") continue;
    const word = wordOf(s.payload);
    if (word !== null && !answers.some((a) => a.userId === s.userId)) answers.push({ userId: s.userId, word });
  }
  return answers;
}

export const sameWavelength: GameEngine<SameWavelengthView> = {
  key: "same-wavelength",

  pickPrompt(recentPromptIds, _participants, random) {
    const category = pickUnused(CATEGORIES, recentPromptIds, random);
    return {
      promptId: category.id,
      prompt: { id: category.id, text: category.text } satisfies SameWavelengthPrompt,
      secret: null,
    };
  },

  validateSubmission(state, userId, input) {
    if (!isRecord(input)) return { ok: false, error: "Nothing to submit." };
    if (findSubmission(state, userId, "answer")) return { ok: false, error: "Your answer is already locked in." };
    const word = cleanText(input.word, MAX_WORD_LENGTH);
    if (!word) return { ok: false, error: `Write one word or a short phrase, up to ${MAX_WORD_LENGTH} characters.` };
    if (!normalizeWord(word)) return { ok: false, error: "Use at least one letter or number." };
    return { ok: true, kind: "answer", payload: { word } };
  },

  isRoundComplete(state) {
    return state.participants.every((p) => findSubmission(state, p.userId, "answer"));
  },

  earlyRevealCheck(state) {
    return simultaneousEarlyRevealCheck(state);
  },

  computeReveal(state, early) {
    const answers = currentAnswers(state);
    const groups = groupMatches(answers);
    const grouped = new Set(groups.flat());
    const answered = new Set(answers.map((a) => a.userId));
    const missing = state.participants.filter((p) => !answered.has(p.userId)).map((p) => p.userId);
    const allMatched = state.participants.length > 0 && state.participants.every((p) => grouped.has(p.userId));
    const thisRound: SameWavelengthRound = {
      round: state.round,
      answers,
      groups,
      largestGroup: groups[0]?.length ?? 0,
      allMatched,
      missing,
    };
    const final = allMatched || state.round >= MAX_ATTEMPTS || early;
    const result: SameWavelengthResult = {
      rounds: [...storedRounds(state).filter((r) => r.round < state.round), thisRound],
      finished: final,
      outcome: allMatched ? "all" : groups.length > 0 ? "some" : "none",
    };
    return { result, final };
  },

  view(state, userId): SameWavelengthView {
    const prompt = state.prompt as SameWavelengthPrompt;
    const revealed = state.status === "revealed";
    const myWord = wordOf(findSubmission(state, userId, "answer")?.payload);
    return {
      phase: revealed ? "revealed" : myWord !== null ? "waiting" : "answer",
      category: prompt.text,
      round: state.round,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - state.round),
      myWord,
      submitted: currentAnswers(state).map((a) => a.userId),
      previousRounds: storedRounds(state).filter((r) => r.round < state.round),
      result: revealed ? (state.result as SameWavelengthResult) : null,
    };
  },

  turnStatus(state, userId) {
    return simultaneousTurnStatus(state, userId, { one: "answer", many: "answers" });
  },
};
