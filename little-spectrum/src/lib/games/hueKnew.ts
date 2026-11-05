import { SPECTRUMS } from "@/content/spectrums";
import {
  average,
  cleanText,
  findSubmission,
  isRecord,
  joinNames,
  nameOf,
  pickUnused,
  possessive,
  roundSubmissions,
  type GameEngine,
  type SessionState,
  type TurnStatus,
} from "./engine";

export type HueKnewPrompt = { id: string; left: string; right: string };
export type HueKnewSecret = { target: number };
export type HueKnewResult = {
  target: number;
  clue: string;
  guesses: Array<{ userId: string; guess: number; score: number }>;
  shared: number | null;
  missing: string[];
  suggestedClueGiverId: string;
};

export type HueKnewView = {
  phase: "clue" | "guess" | "revealed";
  left: string;
  right: string;
  clueGiverId: string;
  isClueGiver: boolean;
  target: number | null;
  clue: string | null;
  myGuess: number | null;
  guessers: Array<{ userId: string; submitted: boolean }>;
  result: HueKnewResult | null;
};

export const MAX_CLUE_LENGTH = 60;

export function scoreGuess(target: number, guess: number): number {
  return Math.max(0, Math.round(100 - 2 * Math.abs(target - guess)));
}

function guessers(state: SessionState) {
  return state.participants.filter((p) => p.userId !== state.clueGiverId);
}

function clueOf(state: SessionState): string | null {
  if (!state.clueGiverId) return null;
  const clue = findSubmission(state, state.clueGiverId, "clue", 1);
  return isRecord(clue?.payload) && typeof clue.payload.clue === "string" ? clue.payload.clue : null;
}

export function suggestNextClueGiver(state: SessionState): string {
  const ordered = [...state.participants].sort((a, b) => a.userId.localeCompare(b.userId));
  const index = ordered.findIndex((p) => p.userId === state.clueGiverId);
  return ordered[(index + 1) % ordered.length]?.userId ?? ordered[0].userId;
}

export const hueKnew: GameEngine<HueKnewView> = {
  key: "hue-knew",

  pickPrompt(recentPromptIds, _participants, random) {
    const spectrum = pickUnused(SPECTRUMS, recentPromptIds, random);
    const target = Math.floor(random() * 101);
    return {
      promptId: spectrum.id,
      prompt: { id: spectrum.id, left: spectrum.left, right: spectrum.right } satisfies HueKnewPrompt,
      secret: { target } satisfies HueKnewSecret,
    };
  },

  validateSubmission(state, userId, input) {
    if (!isRecord(input)) return { ok: false, error: "Nothing to submit." };
    if (userId === state.clueGiverId) {
      const clue = cleanText(input.clue, MAX_CLUE_LENGTH);
      if (!clue) return { ok: false, error: `Write a clue of 1 to ${MAX_CLUE_LENGTH} characters.` };
      return { ok: true, kind: "clue", payload: { clue } };
    }
    if (!clueOf(state)) return { ok: false, error: "The clue is not in yet." };
    const guess = Number(input.guess);
    if (!Number.isInteger(guess) || guess < 0 || guess > 100) {
      return { ok: false, error: "Pick a spot between 0 and 100." };
    }
    return { ok: true, kind: "answer", payload: { guess } };
  },

  isRoundComplete(state) {
    if (!clueOf(state)) return false;
    return guessers(state).every((p) => findSubmission(state, p.userId, "answer"));
  },

  earlyRevealCheck(state) {
    const pending = guessers(state)
      .filter((p) => !findSubmission(state, p.userId, "answer"))
      .map((p) => p.userId);
    if (!clueOf(state)) return { ok: false, reason: "The clue has to be in before a reveal.", pending };
    const guessCount = guessers(state).length - pending.length;
    if (guessCount < 1) return { ok: false, reason: "At least one guess is needed before a reveal.", pending };
    return { ok: true, reason: "", pending };
  },

  computeReveal(state) {
    const secret = state.secret as HueKnewSecret;
    const clue = clueOf(state) ?? "";
    const guesses = roundSubmissions(state)
      .filter((s) => s.kind === "answer" && isRecord(s.payload))
      .map((s) => {
        const guess = Number((s.payload as Record<string, unknown>).guess);
        return { userId: s.userId, guess, score: scoreGuess(secret.target, guess) };
      });
    const guessed = new Set(guesses.map((g) => g.userId));
    const missing = guessers(state)
      .filter((p) => !guessed.has(p.userId))
      .map((p) => p.userId);
    const result: HueKnewResult = {
      target: secret.target,
      clue,
      guesses,
      shared: average(guesses.map((g) => g.score)),
      missing,
      suggestedClueGiverId: suggestNextClueGiver(state),
    };
    return { result, final: true };
  },

  view(state, userId): HueKnewView {
    const prompt = state.prompt as HueKnewPrompt;
    const isClueGiver = userId === state.clueGiverId;
    const clue = clueOf(state);
    const revealed = state.status === "revealed";
    const mine = findSubmission(state, userId, "answer");
    const myGuess = isRecord(mine?.payload) ? Number(mine.payload.guess) : null;
    return {
      phase: revealed ? "revealed" : clue ? "guess" : "clue",
      left: prompt.left,
      right: prompt.right,
      clueGiverId: state.clueGiverId ?? state.createdBy,
      isClueGiver,
      target: isClueGiver && !revealed ? (state.secret as HueKnewSecret).target : null,
      clue,
      myGuess,
      guessers: guessers(state).map((p) => ({
        userId: p.userId,
        submitted: Boolean(findSubmission(state, p.userId, "answer")),
      })),
      result: revealed ? (state.result as HueKnewResult) : null,
    };
  },

  turnStatus(state, userId): TurnStatus {
    if (state.status === "revealed") return { needsYou: false, line: "The reveal is ready." };
    const clue = clueOf(state);
    const clueGiverName = nameOf(state, state.clueGiverId ?? "");
    if (!clue) {
      return userId === state.clueGiverId
        ? { needsYou: true, line: "Your clue is needed." }
        : { needsYou: false, line: `Waiting for ${possessive(clueGiverName)} clue.` };
    }
    const pending = guessers(state).filter((p) => !findSubmission(state, p.userId, "answer"));
    if (userId !== state.clueGiverId && !findSubmission(state, userId, "answer")) {
      return { needsYou: true, line: "Your clue is ready." };
    }
    if (pending.length === 1) return { needsYou: false, line: `Waiting for ${possessive(pending[0].name)} guess.` };
    if (pending.length === 0) return { needsYou: false, line: "Everyone is in." };
    return { needsYou: false, line: `Waiting for ${joinNames(pending.map((p) => p.name))}.` };
  },
};
