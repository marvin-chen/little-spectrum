import { describe, expect, it } from "vitest";
import { BackendUnavailableError, isConnectionError, raiseIfUnavailable } from "./backend";

describe("backend availability", () => {
  it("recognizes connection failures but not ordinary errors", () => {
    expect(isConnectionError({ name: "AuthRetryableFetchError", message: "fetch failed", status: 0 })).toBe(true);
    expect(isConnectionError({ message: "TypeError: fetch failed" })).toBe(true);
    expect(isConnectionError({ message: "connect ECONNREFUSED 127.0.0.1:9" })).toBe(true);
    expect(isConnectionError({ message: "duplicate key value violates unique constraint", status: 409 })).toBe(false);
    expect(isConnectionError(null)).toBe(false);
  });

  it("raises a typed error so the route can show a retry state", () => {
    expect(() => raiseIfUnavailable({ message: "fetch failed" })).toThrow(BackendUnavailableError);
    expect(() => raiseIfUnavailable({ message: "not found", status: 404 })).not.toThrow();
  });
});
