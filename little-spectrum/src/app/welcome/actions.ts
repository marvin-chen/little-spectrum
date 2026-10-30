"use server";

import { redirect } from "next/navigation";
import { updateProfile } from "@/lib/data/gardens";
import { isValidAvatar } from "@/lib/avatars";
import { cleanText } from "@/lib/games/engine";
import { safeNextPath } from "@/lib/paths";
import { createUserClient } from "@/lib/supabase/server";

export type ProfileFormState = { error?: string };

export async function saveProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const name = cleanText(formData.get("displayName"), 24);
  if (!name) return { error: "Pick a name between 1 and 24 characters." };
  const avatar = String(formData.get("avatar") ?? "");
  if (!isValidAvatar(avatar)) return { error: "Pick an avatar." };
  const next = safeNextPath(formData.get("next"), "/start");

  const supabase = await createUserClient();
  const { data } = await supabase.auth.getClaims();
  let userId = data?.claims?.sub;
  if (!userId) {
    const { data: signIn, error } = await supabase.auth.signInAnonymously();
    if (error || !signIn.user) {
      return {
        error: error?.message.toLowerCase().includes("anonymous")
          ? "Anonymous sign-ins are turned off in the Supabase project. Enable them under Authentication to continue."
          : "Could not start a guest session. The backend may be paused or unreachable. Please try again in a moment.",
      };
    }
    userId = signIn.user.id;
  }
  try {
    await updateProfile(userId, name, avatar);
  } catch {
    return { error: "Could not save your profile. Please try again." };
  }
  redirect(next);
}
