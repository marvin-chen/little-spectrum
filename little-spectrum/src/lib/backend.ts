// Thrown when the configured Supabase project cannot be reached, for example while it is paused.
export class BackendUnavailableError extends Error {
  constructor(message = "Could not reach the backend") {
    super(message);
    this.name = "BackendUnavailableError";
  }
}

export function isConnectionError(error: { message?: string; name?: string; status?: number } | null | undefined): boolean {
  if (!error) return false;
  const text = `${error.name ?? ""} ${error.message ?? ""}`.toLowerCase();
  return (
    error.status === 0 ||
    text.includes("fetch failed") ||
    text.includes("failed to fetch") ||
    text.includes("retryable") ||
    text.includes("econnrefused") ||
    text.includes("network") ||
    text.includes("timeout") ||
    text.includes("503") ||
    text.includes("paused")
  );
}

export function raiseIfUnavailable(error: { message?: string; name?: string; status?: number } | null | undefined): void {
  if (isConnectionError(error)) throw new BackendUnavailableError(error?.message);
}
