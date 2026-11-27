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

export const MEMORIES_PAGE_SIZE = 20;
const ACTIVITY_SIZE = 10;
// How many of the garden's newest rounds to scan for ones the viewer was not in.
const ACTIVITY_WINDOW = 40;

// Pass a `next` cursor back as `before` to get the following, older page.
export const REVEALED_AT_CURSOR = /^\d{4}-\d{2}-\d{2}T[\d:.]+(?:Z|[+-]\d{2}:\d{2})$/;

type Revealed = { id: string; game: string; revealed_at: string; session_participants: Array<{ user_id: string }> };

// The viewer's own revealed rounds, newest first. Rounds they were not in only show up as activity on the first page.
export async function listMemories(
  gardenId: string,
  userId: string,
  options: { game?: GameKey; before?: string } = {},
): Promise<{ memories: Memory[]; activity: ActivityEntry[]; next: string | null }> {
  const { game, before } = options;
  const db = createServiceClient();
  const revealedIn = (columns: string) => {
    const query = db.from("sessions").select(columns).eq("garden_id", gardenId).eq("status", "revealed");
    return game ? query.eq("game", game) : query;
  };
  let mineQuery = revealedIn("id, game, revealed_at, session_participants!inner(user_id)")
    .eq("session_participants.user_id", userId)
    .order("revealed_at", { ascending: false })
    .limit(MEMORIES_PAGE_SIZE + 1);
  if (before) mineQuery = mineQuery.lt("revealed_at", before);
  const [mine, recent] = await Promise.all([
    mineQuery,
    before
      ? { data: [], error: null }
      : revealedIn("id, game, revealed_at, session_participants(user_id)")
          .order("revealed_at", { ascending: false })
          .limit(ACTIVITY_WINDOW),
  ]);
  if (mine.error) throw new Error(mine.error.message);
  if (recent.error) throw new Error(recent.error.message);

  const shown = (rows: Revealed[]) => rows.filter((r) => isGameKey(r.game) && isGameAvailable(r.game));
  const activity: ActivityEntry[] = shown((recent.data ?? []) as unknown as Revealed[])
    .filter((r) => !r.session_participants.some((p) => p.user_id === userId))
    .slice(0, ACTIVITY_SIZE)
    .map((r) => ({
      id: r.id,
      game: r.game as GameKey,
      revealedAt: r.revealed_at,
      participantCount: r.session_participants.length,
    }));

  const rows = (mine.data ?? []) as unknown as Revealed[];
  const page = rows.slice(0, MEMORIES_PAGE_SIZE);
  const next = rows.length > MEMORIES_PAGE_SIZE ? page[page.length - 1].revealed_at : null;
  const mineIds = shown(page).map((r) => r.id);
  if (mineIds.length === 0) return { memories: [], activity, next };

  const [states, { data: reactions }, { data: comments }] = await Promise.all([
    loadStates(mineIds),
    db
      .from("reactions")
      .select("session_id, user_id, emoji, created_at")
      .in("session_id", mineIds)
      .order("created_at", { ascending: true }),
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
      userIds: (reactions ?? [])
        .filter((row) => row.session_id === session.id && row.emoji === r.key)
        .map((row) => row.user_id as string),
    })).filter((r) => r.userIds.length > 0),
    comments: (comments ?? [])
      .filter((row) => row.session_id === session.id)
      .map((row) => ({ userId: row.user_id as string, body: row.body as string, updatedAt: row.updated_at as string })),
  }));
  return { memories, activity, next };
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
    .upsert(
      { session_id: sessionId, user_id: userId, body: text, updated_at: new Date().toISOString() },
      { onConflict: "session_id,user_id" },
    );
  return error ? { ok: false, error: "Could not save that. Please try again." } : { ok: true };
}
