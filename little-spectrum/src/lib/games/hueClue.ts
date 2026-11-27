import {
  average,
  cleanText,
  findSubmission,
  isRecord,
  joinNames,
  nameOf,
  possessive,
  roundSubmissions,
  type GameEngine,
  type SessionState,
  type TurnStatus,
} from "./engine";
import { HUE_CLUE_COLS, HUE_CLUE_ROWS, isValidCell, manhattan } from "./hueCluePalette";

export type Cell = { col: number; row: number };
export type HueCluePrompt = { id: string };
export type HueClueSecret = { target: Cell };
export type HueClueResult = {
  target: Cell;
  clue: string;
  guesses: Array<{ userId: string; col: number; row: number; distance: number; score: number }>;
  shared: number | null;
  missing: string[];
  suggestedClueGiverId: string;
};

export type HueClueView = {
  phase: "clue" | "guess" | "revealed";
  clueGiverId: string;
  isClueGiver: boolean;
  target: Cell | null;
  clue: string | null;
  myGuess: Cell | null;
  guessers: Array<{ userId: string; submitted: boolean }>;
  result: HueClueResult | null;
};

export const MAX_CLUE_WORDS = 3;
export const MAX_CLUE_CHARS = 40;

export function scoreDistance(distance: number): number {
  return Math.max(0, 100 - 15 * distance);
}

export function cleanClue(value: unknown): string | null {
  const text = cleanText(value, MAX_CLUE_CHARS);
  if (!text) return null;
  if (text.split(" ").length > MAX_CLUE_WORDS) return null;
  return text;
}

function guessers(state: SessionState) {
  return state.participants.filter((p) => p.userId !== state.clueGiverId);
}

function clueOf(state: SessionState): string | null {
  if (!state.clueGiverId) return null;
  const clue = findSubmission(state, state.clueGiverId, "clue", 1);
  return isRecord(clue?.payload) && typeof clue.payload.clue === "string" ? clue.payload.clue : null;
}

function cellOf(payload: unknown): Cell | null {
  if (!isRecord(payload)) return null;
  const col = Number(payload.col);
  const row = Number(payload.row);
  return isValidCell(col, row) ? { col, row } : null;
}

export function suggestNextClueGiver(state: SessionState): string {
  const ordered = [...state.participants].sort((a, b) => a.userId.localeCompare(b.userId));
  const index = ordered.findIndex((p) => p.userId === state.clueGiverId);
  return ordered[(index + 1) % ordered.length]?.userId ?? ordered[0].userId;
}

export const hueClue: GameEngine<HueClueView> = {
  key: "hue-clue",

  pickPrompt(_recent, _participants, random) {
    const target = { col: Math.floor(random() * HUE_CLUE_COLS), row: Math.floor(random() * HUE_CLUE_ROWS) };
    const id = `cell-${target.col}-${target.row}-${Math.floor(random() * 1e9)}`;
    return { promptId: id, prompt: { id } satisfies HueCluePrompt, secret: { target } satisfies HueClueSecret };
  },

  validateSubmission(state, userId, input) {
    if (!isRecord(input)) return { ok: false, error: "Nothing to submit." };
    if (userId === state.clueGiverId) {
      const clue = cleanClue(input.clue);
      if (!clue) return { ok: false, error: `Write a clue of up to ${MAX_CLUE_WORDS} words.` };
      return { ok: true, kind: "clue", payload: { clue } };
    }
    if (!clueOf(state)) return { ok: false, error: "The clue is not in yet." };
    const chosen = cellOf(input);
    if (!chosen) return { ok: false, error: "Pick a square on the grid." };
    return { ok: true, kind: "answer", payload: chosen };
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
    if (guessers(state).length - pending.length < 1) {
      return { ok: false, reason: "At least one guess is needed before a reveal.", pending };
    }
    return { ok: true, reason: "", pending };
  },

  computeReveal(state) {
    const { target } = state.secret as HueClueSecret;
    const guesses = roundSubmissions(state)
      .filter((s) => s.kind === "answer")
      .map((s) => ({ userId: s.userId, cell: cellOf(s.payload) }))
      .filter((g): g is { userId: string; cell: Cell } => g.cell !== null)
      .map((g) => {
        const distance = manhattan(target, g.cell);
        return { userId: g.userId, col: g.cell.col, row: g.cell.row, distance, score: scoreDistance(distance) };
      });
    const guessed = new Set(guesses.map((g) => g.userId));
    const result: HueClueResult = {
      target,
      clue: clueOf(state) ?? "",
      guesses,
      shared: average(guesses.map((g) => g.score)),
      missing: guessers(state)
        .filter((p) => !guessed.has(p.userId))
        .map((p) => p.userId),
      suggestedClueGiverId: suggestNextClueGiver(state),
    };
    return { result, final: true };
  },

  view(state, userId): HueClueView {
    const isClueGiver = userId === state.clueGiverId;
    const clue = clueOf(state);
    const revealed = state.status === "revealed";
    return {
      phase: revealed ? "revealed" : clue ? "guess" : "clue",
      clueGiverId: state.clueGiverId ?? state.createdBy,
      isClueGiver,
      target: isClueGiver && !revealed ? (state.secret as HueClueSecret).target : null,
      clue,
      myGuess: cellOf(findSubmission(state, userId, "answer")?.payload),
      guessers: guessers(state).map((p) => ({
        userId: p.userId,
        submitted: Boolean(findSubmission(state, p.userId, "answer")),
      })),
      result: revealed ? (state.result as HueClueResult) : null,
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
    if (pending.length === 1) return { needsYou: false, line: `Waiting for ${possessive(pending[0].name)} pick.` };
    if (pending.length === 0) return { needsYou: false, line: "Everyone is in." };
    return { needsYou: false, line: `Waiting for ${joinNames(pending.map((p) => p.name))}.` };
  },
};
