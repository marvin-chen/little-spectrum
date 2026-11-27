import { afterEach, describe, expect, it, vi } from "vitest";
import { throttle } from "./ratelimit";

describe("throttle", () => {
  afterEach(() => vi.useRealTimers());

  it("blocks calls past the limit inside the window", () => {
    vi.useFakeTimers();
    expect([1, 2, 3].map(() => throttle("limit", 2, 1000))).toEqual([true, true, false]);
  });

  it("allows calls again once the window has passed", () => {
    vi.useFakeTimers();
    throttle("window", 1, 1000);
    expect(throttle("window", 1, 1000)).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(throttle("window", 1, 1000)).toBe(true);
  });

  it("counts each key on its own", () => {
    vi.useFakeTimers();
    throttle("first", 1, 1000);
    expect(throttle("first", 1, 1000)).toBe(false);
    expect(throttle("second", 1, 1000)).toBe(true);
  });

  it("keeps live keys while it sweeps expired ones", () => {
    vi.useFakeTimers();
    throttle("live", 1, 60_000);
    for (let i = 0; i < 5000; i += 1) throttle(`old-${i}`, 1, 1000);
    vi.advanceTimersByTime(1000);
    // Creating a new bucket past 5000 entries triggers the sweep.
    throttle("sweep", 1, 1000);
    expect(throttle("live", 1, 60_000)).toBe(false);
  });
});
