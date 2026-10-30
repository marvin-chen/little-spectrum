import type { GameKey } from "@/lib/games";

export type Participant = { userId: string; name: string; avatar: string; predictsUserId: string | null };

export type Submission = {
  userId: string;
  round: number;
  kind: "clue" | "answer";
  payload: unknown;
  createdAt: string;
};

export type PhotoRef = {
  id: string;
  userId: string;
  storagePath: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  status: "pending" | "ready";
  createdAt: string;
};

export type SessionState = {
  id: string;
  gardenId: string;
  game: GameKey;
  status: "active" | "revealed";
  createdBy: string;
  clueGiverId: string | null;
  prompt: unknown;
  round: number;
  result: unknown;
  earlyReveal: boolean;
  createdAt: string;
  revealedAt: string | null;
  participants: Participant[];
  submissions: Submission[];
  secret: unknown;
  photos: PhotoRef[];
};

export type ValidationResult =
  | { ok: true; kind: "clue" | "answer"; payload: unknown }
  | { ok: false; error: string };

export type RevealOutcome = { result: unknown; final: boolean };

export type EarlyRevealCheck = { ok: boolean; reason: string; pending: string[] };

export type TurnStatus = { needsYou: boolean; line: string };

export type PromptPick = {
  promptId: string;
  prompt: unknown;
  secret: unknown | null;
  // Optional circular assignment, predictor user id to predicted user id.
  predictions?: Record<string, string>;
};

export interface GameEngine {
  key: GameKey;
  pickPrompt(recentPromptIds: string[], participants: Participant[], random: () => number): PromptPick;
  validateSubmission(state: SessionState, userId: string, input: unknown): ValidationResult;
  isRoundComplete(state: SessionState): boolean;
  earlyRevealCheck(state: SessionState): EarlyRevealCheck;
  computeReveal(state: SessionState, early: boolean): RevealOutcome;
  view(state: SessionState, userId: string): unknown;
  // Optional async step for views that need signed URLs or other lookups.
  hydrateView?(state: SessionState, userId: string, view: unknown): Promise<unknown>;
  turnStatus(state: SessionState, userId: string): TurnStatus;
}

// Shared helpers used by every game.

export function roundSubmissions(state: SessionState, round = state.round): Submission[] {
  return state.submissions.filter((s) => s.round === round);
}

export function findSubmission(
  state: SessionState,
  userId: string,
  kind: "clue" | "answer",
  round = state.round,
): Submission | undefined {
  return state.submissions.find((s) => s.userId === userId && s.kind === kind && s.round === round);
}

export function participant(state: SessionState, userId: string): Participant | undefined {
  return state.participants.find((p) => p.userId === userId);
}

export function nameOf(state: SessionState, userId: string): string {
  return participant(state, userId)?.name ?? "Someone";
}

export function possessive(name: string): string {
  return name.endsWith("s") ? `${name}'` : `${name}'s`;
}

export function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
}

const COUNT_WORDS = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];

export function countWord(n: number): string {
  return COUNT_WORDS[n] ?? String(n);
}

export function pickUnused<T extends { id: string }>(
  items: T[],
  recentIds: string[],
  random: () => number,
): T {
  const recent = new Set(recentIds);
  const fresh = items.filter((item) => !recent.has(item.id));
  const pool = fresh.length > 0 ? fresh : items;
  return pool[Math.floor(random() * pool.length)];
}

export type NounForms = { one: string; many: string; pluralSubject?: boolean };

// Status line for games where everyone answers at once.
export function simultaneousTurnStatus(state: SessionState, userId: string, noun: NounForms): TurnStatus {
  if (state.status === "revealed") return { needsYou: false, line: "The reveal is ready." };
  const submitted = new Set(roundSubmissions(state).map((s) => s.userId));
  const subject = noun.pluralSubject ? noun.many : noun.one;
  const verb = noun.pluralSubject ? "are" : "is";
  if (!submitted.has(userId)) {
    const prefix = state.round > 1 ? `Attempt ${state.round}. ` : "";
    return { needsYou: true, line: `${prefix}Your ${subject} ${verb} needed.` };
  }
  const pending = state.participants.filter((p) => !submitted.has(p.userId));
  if (pending.length === 1) {
    return { needsYou: false, line: `Waiting for ${possessive(pending[0].name)} ${subject}.` };
  }
  return {
    needsYou: false,
    line: `${countWord(submitted.size)} of ${countWord(state.participants.length).toLowerCase()} ${noun.many} are in.`,
  };
}

// Simultaneous games reveal early with at least two submitted players.
export function simultaneousEarlyRevealCheck(state: SessionState): EarlyRevealCheck {
  const pending = pendingParticipants(state).map((p) => p.userId);
  const submitted = state.participants.length - pending.length;
  if (submitted < 2) return { ok: false, reason: "At least two people need to answer before a reveal.", pending };
  return { ok: true, reason: "", pending };
}

export function allSubmitted(state: SessionState): boolean {
  return pendingParticipants(state).length === 0;
}

export function pendingParticipants(state: SessionState): Participant[] {
  const submitted = new Set(roundSubmissions(state).map((s) => s.userId));
  return state.participants.filter((p) => !submitted.has(p.userId));
}

export function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function cleanText(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length === 0 || text.length > max) return null;
  return text;
}
