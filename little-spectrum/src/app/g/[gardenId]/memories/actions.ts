"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveComment, toggleReaction } from "@/lib/data/memories";
import { throttle } from "@/lib/ratelimit";

export type MemoryActionState = { error?: string };

const THROTTLE_MESSAGE = "That is a lot of feelings. Give it a minute.";

export async function toggleReactionAction(gardenId: string, sessionId: string, emoji: string): Promise<MemoryActionState> {
  const user = await requireUser(`/g/${gardenId}/memories`);
  if (!throttle(`memories:${user.id}`, 60, 60 * 1000)) return { error: THROTTLE_MESSAGE };
  const result = await toggleReaction(user.id, sessionId, emoji);
  revalidatePath(`/g/${gardenId}/memories`);
  return result.ok ? {} : { error: result.error };
}

export async function saveCommentAction(gardenId: string, sessionId: string, body: string): Promise<MemoryActionState> {
  const user = await requireUser(`/g/${gardenId}/memories`);
  if (!throttle(`memories:${user.id}`, 60, 60 * 1000)) return { error: THROTTLE_MESSAGE };
  const result = await saveComment(user.id, sessionId, body);
  revalidatePath(`/g/${gardenId}/memories`);
  return result.ok ? {} : { error: result.error };
}
