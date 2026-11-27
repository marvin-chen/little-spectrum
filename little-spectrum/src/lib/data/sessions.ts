import "server-only";
import type { ParticipantRow, PhotoRow, ProfileRow, SessionRow, SubmissionRow } from "@/lib/db";
import { GAMES, type GameKey, isGameKey } from "@/lib/games";
import { pendingParticipants, type Participant, type SessionState, type TurnStatus } from "@/lib/games/engine";
import { getEngine, isGameAvailable } from "@/lib/games/registry";
import { createServiceClient } from "@/lib/supabase/server";
import { UUID_RE } from "./gardens";

import { projectSession, type SessionParticipant, type SessionView } from "@/lib/games/sessionView";
export type { SessionParticipant, SessionView } from "@/lib/games/sessionView";

export type SessionCard = {
  id: string;
  game: GameKey;
  status: "active" | "revealed";
  round: number;
  turn: TurnStatus;
  participants: SessionParticipant[];
  createdAt: string;
  revealedAt: string | null;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function toState(
  row: SessionRow,
  participants: ParticipantRow[],
  profiles: Map<string, ProfileRow>,
  submissions: SubmissionRow[],
  secret: unknown,
  photos: PhotoRow[],
): SessionState {
  return {
    id: row.id,
    gardenId: row.garden_id,
    game: row.game as GameKey,
    status: row.status,
    createdBy: row.created_by,
    clueGiverId: row.clue_giver_id,
    prompt: row.prompt,
    round: row.round,
    result: row.result,
    earlyReveal: row.early_reveal,
    createdAt: row.created_at,
    revealedAt: row.revealed_at,
    participants: participants.map((p) => ({
      userId: p.user_id,
      name: profiles.get(p.user_id)?.display_name ?? "Friend",
      avatar: profiles.get(p.user_id)?.avatar ?? "sun:amber",
      predictsUserId: p.predicts_user_id,
    })),
    submissions: submissions
      .slice()
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((s) => ({ userId: s.user_id, round: s.round, kind: s.kind, payload: s.payload, createdAt: s.created_at })),
    secret,
    photos: photos.map((p) => ({
      id: p.id,
      userId: p.user_id,
      storagePath: p.storage_path,
      caption: p.caption,
      width: p.width,
      height: p.height,
      status: p.status,
      createdAt: p.created_at,
    })),
  };
}

// Loads full states, including secrets and everyone's submissions. Callers must shape output per viewer.
export async function loadStates(sessionIds: string[]): Promise<SessionState[]> {
  if (sessionIds.length === 0) return [];
  const db = createServiceClient();
  const [{ data: sessions }, { data: participants }, { data: submissions }, { data: secrets }, { data: photos }] =
    await Promise.all([
      db.from("sessions").select("*").in("id", sessionIds),
      db.from("session_participants").select("*").in("session_id", sessionIds),
      db.from("submissions").select("*").in("session_id", sessionIds),
      db.from("session_secrets").select("session_id, payload").in("session_id", sessionIds),
      db.from("photos").select("*").in("session_id", sessionIds),
    ]);
  const participantRows = (participants ?? []) as ParticipantRow[];
  const userIds = [...new Set(participantRows.map((p) => p.user_id))];
  const { data: profiles } = userIds.length
    ? await db.from("profiles").select("id, display_name, avatar").in("id", userIds)
    : { data: [] };
  const profileBy = new Map(((profiles ?? []) as ProfileRow[]).map((p) => [p.id, p]));
  const secretBy = new Map((secrets ?? []).map((s) => [s.session_id as string, s.payload]));
  return ((sessions ?? []) as SessionRow[]).map((row) =>
    toState(
      row,
      participantRows.filter((p) => p.session_id === row.id),
      profileBy,
      ((submissions ?? []) as SubmissionRow[]).filter((s) => s.session_id === row.id),
      secretBy.get(row.id) ?? null,
      ((photos ?? []) as PhotoRow[]).filter((p) => p.session_id === row.id),
    ),
  );
}

export async function loadState(sessionId: string): Promise<SessionState | null> {
  if (!UUID_RE.test(sessionId)) return null;
  const [state] = await loadStates([sessionId]);
  return state ?? null;
}

export function isParticipant(state: SessionState, userId: string): boolean {
  return state.participants.some((p) => p.userId === userId);
}

function cardFor(state: SessionState, userId: string): SessionCard {
  const engine = getEngine(state.game);
  return {
    id: state.id,
    game: state.game,
    status: state.status,
    round: state.round,
    turn: engine.turnStatus(state, userId),
    participants: state.participants.map(({ userId, name, avatar }) => ({ userId, name, avatar })),
    createdAt: state.createdAt,
    revealedAt: state.revealedAt,
  };
}

export async function viewFor(state: SessionState, userId: string): Promise<SessionView> {
  return projectSession(getEngine(state.game), state, userId);
}

// Reveals the current round when every required submission is in. Safe to call repeatedly.
export async function ensureRevealed(state: SessionState): Promise<SessionState> {
  if (state.status !== "active") return state;
  const engine = getEngine(state.game);
  if (!engine.isRoundComplete(state)) return state;
  const outcome = await revealRound(state, false);
  return outcome ?? state;
}

async function revealRound(state: SessionState, early: boolean): Promise<SessionState | null> {
  const engine = getEngine(state.game);
  const db = createServiceClient();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { result, final } = engine.computeReveal(state, early);
    const expected = state.submissions.filter((s) => s.round === state.round).length;
    const { data, error } = await db.rpc("reveal_round", {
      p_session: state.id,
      p_round: state.round,
      p_result: result,
      p_final: final,
      p_early: early,
      p_expected_submissions: expected,
    });
    if (error) throw new Error(error.message);
    const status = (data as { status: string }).status;
    if (status !== "retry") return loadState(state.id);
    const fresh = await loadState(state.id);
    if (!fresh || fresh.status !== "active") return fresh;
    state = fresh;
  }
  return loadState(state.id);
}

export async function getSessionView(sessionId: string, userId: string): Promise<SessionView | null> {
  let state = await loadState(sessionId);
  if (!state || !isParticipant(state, userId)) return null;
  state = await ensureRevealed(state);
  return viewFor(state, userId);
}

export async function createSession(
  userId: string,
  gardenId: string,
  game: string,
  participantIds: string[],
): Promise<Result<string>> {
  if (!isGameKey(game) || !isGameAvailable(game)) return { ok: false, error: "That game is not available." };
  const unique = [...new Set(participantIds)];
  if (unique.length < 2) return { ok: false, error: "Pick at least two people." };
  if (!unique.includes(userId)) return { ok: false, error: "You need to be in the game you start." };
  const db = createServiceClient();
  const [{ data: profiles }, { data: recent }] = await Promise.all([
    db.from("profiles").select("id, display_name, avatar").in("id", unique),
    db
      .from("sessions")
      .select("prompt")
      .eq("garden_id", gardenId)
      .eq("game", game)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);
  const participants: Participant[] = unique.map((id) => {
    const p = ((profiles ?? []) as ProfileRow[]).find((x) => x.id === id);
    return { userId: id, name: p?.display_name ?? "Friend", avatar: p?.avatar ?? "sun:amber", predictsUserId: null };
  });
  const recentIds = (recent ?? [])
    .map((r) => (r.prompt as { id?: string } | null)?.id)
    .filter((id): id is string => typeof id === "string");
  const engine = getEngine(game);
  const pick = engine.pickPrompt(recentIds, participants, Math.random);
  const predictions = pick.predictions ?? {};
  const { data, error } = await db.rpc("create_session", {
    p_user: userId,
    p_garden: gardenId,
    p_game: game,
    p_participants: unique,
    p_prompt: pick.prompt,
    p_secret: pick.secret,
    p_clue_giver: GAMES[game].kind === "clue" ? userId : null,
    p_predictions: predictions,
  });
  if (error) {
    if (error.message.includes("participants_not_members")) return { ok: false, error: "Everyone must be a member." };
    if (error.message.includes("not_member")) return { ok: false, error: "You are not in this garden." };
    return { ok: false, error: "Could not start the game. Please try again." };
  }
  return { ok: true, value: data as string };
}

export async function submitAnswer(userId: string, sessionId: string, input: unknown): Promise<Result<SessionView>> {
  const state = await loadState(sessionId);
  if (!state || !isParticipant(state, userId)) return { ok: false, error: "This game is not yours to play." };
  if (state.status !== "active") return { ok: false, error: "This round is already revealed." };
  const engine = getEngine(state.game);
  const validation = engine.validateSubmission(state, userId, input);
  if (!validation.ok) return { ok: false, error: validation.error };
  const db = createServiceClient();
  const { data, error } = await db.rpc("submit_answer", {
    p_user: userId,
    p_session: sessionId,
    p_round: state.round,
    p_kind: validation.kind,
    p_payload: validation.payload,
  });
  if (error) return { ok: false, error: "Could not save that. Please try again." };
  const status = (data as { status: string }).status;
  if (status === "closed") return { ok: false, error: "This round is already revealed." };
  if (status === "stale_round") return { ok: false, error: "A new attempt started. Refresh to catch up." };
  const fresh = await loadState(sessionId);
  if (!fresh) return { ok: false, error: "Game not found." };
  const settled = await ensureRevealed(fresh);
  return { ok: true, value: await viewFor(settled, userId) };
}

export async function revealEarly(userId: string, sessionId: string): Promise<Result<SessionView>> {
  const state = await loadState(sessionId);
  if (!state || !isParticipant(state, userId)) return { ok: false, error: "This game is not yours to play." };
  if (state.createdBy !== userId) return { ok: false, error: "Only the person who started this can reveal early." };
  if (state.status !== "active") return { ok: true, value: await viewFor(state, userId) };
  const engine = getEngine(state.game);
  const check = engine.earlyRevealCheck(state);
  if (!check.ok) return { ok: false, error: check.reason };
  const settled = (await revealRound(state, true)) ?? state;
  return { ok: true, value: await viewFor(settled, userId) };
}

// Every active session plus the newest revealed ones, drawn from the player's latest `limit` sessions.
export async function listSessionCards(
  gardenId: string,
  userId: string,
  limit = 60,
  revealed = 4,
): Promise<SessionCard[]> {
  const db = createServiceClient();
  const { data: mine } = await db
    .from("sessions")
    .select("id, status, session_participants!inner(user_id)")
    .eq("garden_id", gardenId)
    .eq("session_participants.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (mine ?? []) as Array<{ id: string; status: string }>;
  const ids = [
    ...rows.filter((row) => row.status === "active"),
    ...rows.filter((row) => row.status === "revealed").slice(0, revealed),
  ].map((row) => row.id);
  const states = await loadStates(ids);
  const settled = await Promise.all(states.map((s) => ensureRevealed(s)));
  return settled
    .filter((s) => isGameAvailable(s.game))
    .map((s) => cardFor(s, userId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function pendingNames(state: SessionState): string[] {
  return pendingParticipants(state).map((p) => p.name);
}
