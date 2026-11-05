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

export interface GameEngine<View = unknown> {
  key: GameKey;
  pickPrompt(recentPromptIds: string[], participants: Participant[], random: () => number): PromptPick;
  validateSubmission(state: SessionState, userId: string, input: unknown): ValidationResult;
  isRoundComplete(state: SessionState): boolean;
  earlyRevealCheck(state: SessionState): EarlyRevealCheck;
  computeReveal(state: SessionState, early: boolean): RevealOutcome;
  view(state: SessionState, userId: string): View;
  // Optional async step for views that need signed URLs or other lookups.
  hydrateView?(state: SessionState, userId: string, view: View): Promise<View>;
  turnStatus(state: SessionState, userId: string): TurnStatus;
}

