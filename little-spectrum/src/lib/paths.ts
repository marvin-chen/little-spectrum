const LOCAL = "http://local.invalid";

// The URL parser drops tabs and newlines and reads "\" as "/", so the check has to use the same parser the redirect does.
export function safeNextPath(value: unknown, fallback: string): string {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  const url = new URL(value, LOCAL);
  return url.origin === LOCAL ? url.pathname + url.search + url.hash : fallback;
}
