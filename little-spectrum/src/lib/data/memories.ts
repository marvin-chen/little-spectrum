import "server-only";
import { type GameKey, isGameKey } from "@/lib/games";
import { cleanText } from "@/lib/games/engine";
import { isGameAvailable } from "@/lib/games/registry";
import { REACTION_EMOJI, isReactionKey, type ReactionKey } from "@/lib/reactions";
import { createServiceClient } from "@/lib/supabase/server";
import { isParticipant, loadState, loadStates, viewFor, type SessionView } from "./sessions";

export { REACTION_EMOJI, type ReactionKey };

export type MemoryReaction = { emoji: ReactionKey; userIds: string[] };

export type MemoryComment = { userId: string; body: string; updatedAt: string };

export type Memory = {
  session: SessionView;
  reactions: MemoryReaction[];
  comments: MemoryComment[];
};

// A revealed round the viewer was not part of. Carries no content, only that it happened.
export type ActivityEntry = { id: string; game: GameKey; revealedAt: string; participantCount: number };

type Outcome = { ok: true } | { ok: false; error: string };

export const MAX_COMMENT_LENGTH = 300;

export async function listMemories(
  gardenId: string,
  userId: string,
  game?: GameKey,
): Promise<{ memories: Memory[]; activity: ActivityEntry[] }> {
  const db = createServiceClient();
  let query = db
    .from("sessions")
    .select("id, game, revealed_at, created_at")
    .eq("garden_id", gardenId)
    .eq("status", "revealed")
    .order("revealed_at", { ascending: false })
    .limit(100);
  if (game) query = query.eq("game", game);
  const { data: rows } = await query;
  const revealed = (rows ?? [])
    .map((r) => ({
      id: r.id as string,
      game: r.game as string,
      revealedAt: (r.revealed_at as string | null) ?? (r.created_at as string),
    }))
    .filter((r): r is { id: string; game: GameKey; revealedAt: string } => isGameKey(r.game) && isGameAvailable(r.game));
  if (revealed.length === 0) return { memories: [], activity: [] };

  const ids = revealed.map((r) => r.id);
  const { data: participants } = await db.from("session_participants").select("session_id, user_id").in("session_id", ids);
  const countBy = new Map<string, number>();
  const mine = new Set<string>();
  for (const p of participants ?? []) {
    countBy.set(p.session_id, (countBy.get(p.session_id) ?? 0) + 1);
    if (p.user_id === userId) mine.add(p.session_id);
  }

  const activity: ActivityEntry[] = revealed
    .filter((r) => !mine.has(r.id))
    .map((r) => ({ id: r.id, game: r.game, revealedAt: r.revealedAt, participantCount: countBy.get(r.id) ?? 0 }));

  const mineIds = ids.filter((id) => mine.has(id));
  if (mineIds.length === 0) return { memories: [], activity };

  const [states, { data: reactions }, { data: comments }] = await Promise.all([
    loadStates(mineIds),
    db.from("reactions").select("session_id, user_id, emoji, created_at").in("session_id", mineIds).order("created_at", { ascending: true }),
    db.from("comments").select("session_id, user_id, body, updated_at").in("session_id", mineIds),
  ]);
  const stateBy = new Map(states.map((s) => [s.id, s]));
  const views = await Promise.all(
    mineIds
      .map((id) => stateBy.get(id))
      .filter((s) => s !== undefined)
      .map((s) => viewFor(s, userId)),
  );

  const memories: Memory[] = views.map((session) => ({
    session,
    reactions: REACTION_EMOJI.map((r) => ({
      emoji: r.key,
      userIds: (reactions ?? []).filter((row) => row.session_id === session.id && row.emoji === r.key).map((row) => row.user_id as string),
    })).filter((r) => r.userIds.length > 0),
    comments: (comments ?? [])
      .filter((row) => row.session_id === session.id)
      .map((row) => ({ userId: row.user_id as string, body: row.body as string, updatedAt: row.updated_at as string })),
  }));
  return { memories, activity };
}

async function authorizeRevealed(userId: string, sessionId: string): Promise<Outcome> {
  const state = await loadState(sessionId);
  if (!state || !isParticipant(state, userId)) return { ok: false, error: "This memory is not yours to touch." };
  if (state.status !== "revealed") return { ok: false, error: "Wait for the reveal first." };
  return { ok: true };
}

export async function toggleReaction(userId: string, sessionId: string, emoji: unknown): Promise<Outcome> {
  if (!isReactionKey(emoji)) return { ok: false, error: "That reaction is not on the menu." };
  const allowed = await authorizeRevealed(userId, sessionId);
  if (!allowed.ok) return allowed;
  const db = createServiceClient();
  const key = { session_id: sessionId, user_id: userId, emoji };
  const { data: removed, error: deleteError } = await db.from("reactions").delete().match(key).select("emoji");
  if (deleteError) return { ok: false, error: "Could not save that. Please try again." };
  if ((removed ?? []).length > 0) return { ok: true };
  const { error } = await db.from("reactions").insert(key);
  // A duplicate key means a parallel toggle already added it.
  if (error && error.code !== "23505") return { ok: false, error: "Could not save that. Please try again." };
  return { ok: true };
}

export async function saveComment(userId: string, sessionId: string, body: unknown): Promise<Outcome> {
  const allowed = await authorizeRevealed(userId, sessionId);
  if (!allowed.ok) return allowed;
  const db = createServiceClient();
  const trimmed = typeof body === "string" ? body.trim() : "";
  if (trimmed.length === 0) {
    const { error } = await db.from("comments").delete().match({ session_id: sessionId, user_id: userId });
    return error ? { ok: false, error: "Could not remove that. Please try again." } : { ok: true };
  }
  const text = cleanText(body, MAX_COMMENT_LENGTH);
  if (!text) return { ok: false, error: `Keep it under ${MAX_COMMENT_LENGTH} characters.` };
  const { error } = await db
    .from("comments")
    .upsert({ session_id: sessionId, user_id: userId, body: text, updated_at: new Date().toISOString() }, { onConflict: "session_id,user_id" });
  return error ? { ok: false, error: "Could not save that. Please try again." } : { ok: true };
}
