"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { removePhotoFiles } from "@/lib/photos/server";
import { createServiceClient } from "@/lib/supabase/server";

// Uploaders can remove their own photo. Before a reveal this also withdraws the submission.
// The database change is atomic and comes first, so a failed file removal only leaves an unreachable file.
export async function deletePhotoAction(
  gardenId: string,
  sessionId: string,
  photoId: string,
): Promise<{ error?: string }> {
  const user = await requireUser(`/g/${gardenId}/play/${sessionId}`);
  const { data: path, error } = await createServiceClient().rpc("delete_photo", {
    p_user: user.id,
    p_session: sessionId,
    p_photo: photoId,
  });
  if (error) {
    if (error.message.includes("photo_not_found")) return { error: "That photo is not yours to delete." };
    if (error.message.includes("session_not_found")) return { error: "Game not found." };
    return { error: "Could not delete that photo. Please try again." };
  }
  await removePhotoFiles([path as string]);
  revalidatePath(`/g/${gardenId}/play/${sessionId}`);
  revalidatePath(`/g/${gardenId}/memories`);
  return {};
}
