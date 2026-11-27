"use server";

import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/paths";
import { throttle } from "@/lib/ratelimit";
import { getSiteUrl } from "@/lib/supabase/env";
import { createUserClient } from "@/lib/supabase/server";

export type SignInState = { sent?: string; error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function requestMagicLink(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const next = safeNextPath(formData.get("next"), "/");
  if (!EMAIL_RE.test(email)) return { error: "That does not look like an email address." };
  if (!throttle(`magic:${email}`, 4, 15 * 60 * 1000))
    return { error: "A few links were sent already. Check your inbox or wait a bit." };
  const supabase = await createUserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    const text = error.message.toLowerCase();
    if (text.includes("signups not allowed") || text.includes("not found")) {
      return { error: "No account uses that email yet. Keep a guest account from its Settings page first." };
    }
    if (text.includes("rate limit") || text.includes("security purposes")) {
      return { error: "Email sending is rate limited right now. Try again in a minute." };
    }
    return { error: "Could not send the link. Please try again." };
  }
  return { sent: email };
}

export async function verifyCode(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const token = String(formData.get("code") ?? "").replace(/\s+/g, "");
  const next = safeNextPath(formData.get("next"), "/");
  if (!/^\d{6,8}$/.test(token)) return { sent: email, error: "Enter the code from the email." };
  const supabase = await createUserClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { sent: email, error: "That code did not work. Codes expire after a few minutes." };
  redirect(next);
}
