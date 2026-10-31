import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { raiseIfUnavailable } from "./backend";
import { createServiceClient, createUserClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";

export type CurrentUser = {
  id: string;
  displayName: string;
  avatar: string;
  email: string | null;
  isAnonymous: boolean;
};

// Returns the signed-in user with a profile, or null when signed out or still without a profile.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.getClaims();
  raiseIfUnavailable(error);
  const userId = data?.claims?.sub;
  if (!userId) return null;
  const { data: profile, error: profileError } = await createServiceClient()
    .from("profiles")
    .select("id, display_name, avatar")
    .eq("id", userId)
    .maybeSingle();
  raiseIfUnavailable(profileError);
  if (!profile) return null;
  const claims = data?.claims as { email?: string; is_anonymous?: boolean } | undefined;
  return {
    id: profile.id,
    displayName: profile.display_name,
    avatar: profile.avatar,
    email: claims?.email ? claims.email : null,
    isAnonymous: claims?.is_anonymous !== false,
  };
});

export async function requireUser(next: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/welcome?next=${encodeURIComponent(next)}`);
  return user;
}
