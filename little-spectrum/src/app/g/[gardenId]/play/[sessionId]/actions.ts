"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSession, loadState, revealEarly, submitAnswer } from "@/lib/data/sessions";
import { throttle } from "@/lib/ratelimit";

export type PlayActionState = { error?: string };

export async function submitAction(gardenId: string, sessionId: string, input: unknown): Promise<PlayActionState> {
  const user = await requireUser(`/g/${gardenId}/play/${sessionId}`);
  if (!throttle(`submit:${user.id}`, 60, 60 * 1000)) return { error: "Too many submissions. Give it a minute." };
  const result = await submitAnswer(user.id, sessionId, input);
  revalidatePath(`/g/${gardenId}/play/${sessionId}`);
  if (!result.ok) return { error: result.error };
  return {};
}

export async function revealEarlyAction(gardenId: string, sessionId: string): Promise<PlayActionState> {
  const user = await requireUser(`/g/${gardenId}/play/${sessionId}`);
  const result = await revealEarly(user.id, sessionId);
  revalidatePath(`/g/${gardenId}/play/${sessionId}`);
  if (!result.ok) return { error: result.error };
  return {};
}

// Starts a fresh session with the same people. The caller becomes the clue giver for clue games.
export async function playAgainAction(gardenId: string, sessionId: string): Promise<PlayActionState> {
  const user = await requireUser(`/g/${gardenId}/play/${sessionId}`);
  const state = await loadState(sessionId);
  if (!state || !state.participants.some((p) => p.userId === user.id)) return { error: "This game is not yours to replay." };
  if (!throttle(`start:${user.id}`, 30, 60 * 60 * 1000)) return { error: "Slow down a little. Try again in a bit." };
  const result = await createSession(
    user.id,
    gardenId,
    state.game,
    state.participants.map((p) => p.userId),
  );
  if (!result.ok) return { error: result.error };
  redirect(`/g/${gardenId}/play/${result.value}`);
}
