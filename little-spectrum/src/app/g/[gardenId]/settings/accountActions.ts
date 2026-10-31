"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { throttle } from "@/lib/ratelimit";
import { getSiteUrl } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

export type AccountState = { pending?: string; done?: string; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Turns the guest account into a permanent one by attaching an email.
export async function attachEmailAction(gardenId: string, _prev: AccountState, formData: FormData): Promise<AccountState> {
  const user = await requireUser(`/g/${gardenId}/settings`);
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: "That does not look like an email address." };
  if (!throttle(`attach:${user.id}`, 4, 15 * 60 * 1000)) return { error: "A few emails were sent already. Check your inbox or wait a bit." };
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(`/g/${gardenId}/settings?kept=1`)}` },
  );
  if (error) {
    const text = error.message.toLowerCase();
    if (text.includes("already") || text.includes("registered")) return { error: "That email already belongs to another account. Sign in with it instead." };
    if (text.includes("rate limit") || text.includes("security purposes")) return { error: "Email sending is rate limited right now. Try again in a minute." };
    return { error: "Could not attach that email. Please try again." };
  }
  revalidatePath(`/g/${gardenId}/settings`);
  const confirmed = data.user?.email === email && !data.user?.new_email;
  return confirmed ? { done: email } : { pending: email };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createUserClient();
  await supabase.auth.signOut();
  redirect("/");
}
