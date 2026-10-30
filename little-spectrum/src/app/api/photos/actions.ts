"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { loadState } from "@/lib/data/sessions";
import { removePhotoFiles } from "@/lib/photos/server";
import { createServiceClient } from "@/lib/supabase/server";

// Uploaders can remove their own photo. Before a reveal this also withdraws the submission.
export async function deletePhotoAction(gardenId: string, sessionId: string, photoId: string): Promise<{ error?: string }> {
  const user = await requireUser(`/g/${gardenId}/play/${sessionId}`);
  const state = await loadState(sessionId);
  if (!state) return { error: "Game not found." };
  const photo = state.photos.find((p) => p.id === photoId);
  if (!photo || photo.userId !== user.id) return { error: "That photo is not yours to delete." };
  const db = createServiceClient();
  await removePhotoFiles([photo.storagePath]);
  await db.from("photos").delete().eq("id", photoId);
  if (state.status === "active") {
    await db.from("submissions").delete().eq("session_id", sessionId).eq("user_id", user.id).eq("round", state.round);
  }
  revalidatePath(`/g/${gardenId}/play/${sessionId}`);
  revalidatePath(`/g/${gardenId}/memories`);
  return {};
}
