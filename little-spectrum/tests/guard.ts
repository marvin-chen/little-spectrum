// Refuses to run tests that create data against anything but a local or explicitly allowed backend.
export function assertTestBackend(url: string | undefined): void {
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set. Start `pnpm supabase start` and fill .env.local.");
  const local = /^https?:\/\/(127\.0\.0\.1|localhost|supabase_kong_[a-z0-9_-]+|host\.docker\.internal)(:\d+)?/i.test(
    url,
  );
  if (!local && process.env.ALLOW_REMOTE_TEST_DB !== "1") {
    throw new Error(
      `Refusing to run tests against ${url}. Use a local Supabase, or set ALLOW_REMOTE_TEST_DB=1 for a disposable project you own.`,
    );
  }
}
