import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { assertTestBackend } from "../guard";

function loadEnv(): Record<string, string> {
  const env: Record<string, string> = { ...process.env } as Record<string, string>;
  try {
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (match && !env[match[1]]) env[match[1]] = match[2];
    }
  } catch {}
  return env;
}

const env = loadEnv();
export const URL = env.NEXT_PUBLIC_SUPABASE_URL;
assertTestBackend(URL);
export const PUBLISHABLE = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const SECRET = env.SUPABASE_SECRET_KEY ?? env.SUPABASE_SERVICE_ROLE_KEY;

export function service(): SupabaseClient {
  return createClient(URL, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
}

export type TestUser = { id: string; client: SupabaseClient; name: string };

export async function anonymousUser(name: string): Promise<TestUser> {
  const client = createClient(URL, PUBLISHABLE, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.signInAnonymously();
  if (error || !data.user) throw new Error(`sign in failed: ${error?.message}`);
  const { error: profileError } = await service()
    .from("profiles")
    .insert({ id: data.user.id, display_name: name, avatar: "sun:amber" });
  if (profileError) throw new Error(profileError.message);
  return { id: data.user.id, client, name };
}

export function token(): string {
  return Array.from({ length: 32 }, () => "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]).join(
    "",
  );
}

export async function createGarden(user: TestUser, capacity: 2 | 8, inviteToken = token()): Promise<string> {
  const { data, error } = await service().rpc("create_garden", {
    p_user: user.id,
    p_name: "Test garden",
    p_capacity: capacity,
    p_theme: "meadow",
    p_timezone: "America/Los_Angeles",
    p_token: inviteToken,
  });
  if (error) throw new Error(error.message);
  return data as string;
}
