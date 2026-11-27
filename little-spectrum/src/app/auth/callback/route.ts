import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/paths";
import { createUserClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

// Lands magic links and email confirmations, then returns to the app.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"), "/");
  if (!isSupabaseConfigured()) return NextResponse.redirect(new URL("/", url.origin));
  const supabase = await createUserClient();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  let failed = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "email" | "magiclink" | "email_change" | "signup",
    });
    failed = Boolean(error);
  } else {
    failed = true;
  }
  if (failed) return NextResponse.redirect(new URL("/signin?error=link", url.origin));
  return NextResponse.redirect(new URL(next, url.origin));
}
