import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export class NotConfiguredError extends Error {
  constructor() {
    super("Supabase is not configured");
  }
}

// Cookie-backed client that acts as the signed-in user. Reads go through row level security.
export async function createUserClient(): Promise<SupabaseClient> {
  const env = getSupabaseEnv();
  if (!env) throw new NotConfiguredError();
  const cookieStore = await cookies();
  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server components cannot set cookies. The proxy refreshes sessions instead.
        }
      },
    },
  });
}

let serviceClient: SupabaseClient | null = null;

// Privileged client for validated writes and secret handling. Never import this from client code.
export function createServiceClient(): SupabaseClient {
  const env = getSupabaseEnv();
  if (!env) throw new NotConfiguredError();
  if (!serviceClient) {
    serviceClient = createClient(env.url, env.secretKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return serviceClient;
}
