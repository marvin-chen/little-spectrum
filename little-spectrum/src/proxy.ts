import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

// Refreshes the Supabase auth cookies on navigation so server components see a valid session.
export async function proxy(request: NextRequest) {
  const env = getSupabaseEnv();
  let response = NextResponse.next({ request });
  if (!env) return response;

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  await supabase.auth.getClaims();

  // Remember the last garden visited so the landing page can return to it.
  const match = request.nextUrl.pathname.match(/^\/g\/([0-9a-f-]{36})(?:\/|$)/);
  if (match) {
    response.cookies.set("ls_garden", match[1], { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
