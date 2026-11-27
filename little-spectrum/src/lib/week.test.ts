import { afterEach, describe, expect, it, vi } from "vitest";
import { addDays, formatRevealedDate, formatWeekReset, streakWeeks, weekStartFor } from "./week";

describe("revealed dates", () => {
  afterEach(() => vi.useRealTimers());

  it("shows the day in the garden timezone", () => {
    vi.useFakeTimers({ now: new Date("2026-11-26T12:00:00Z") });
    // 6pm on Nov 10 in Los Angeles is already Nov 11 in UTC.
    expect(formatRevealedDate("2026-11-11T02:00:00Z", "America/Los_Angeles")).toBe("Nov 10");
    expect(formatRevealedDate("2026-11-11T02:00:00Z", "UTC")).toBe("Nov 11");
  });

  it("adds the year only for other years", () => {
    vi.useFakeTimers({ now: new Date("2026-11-26T12:00:00Z") });
    expect(formatRevealedDate("2026-06-15T12:00:00Z", "UTC")).toBe("Jun 15");
    expect(formatRevealedDate("2025-06-15T12:00:00Z", "UTC")).toBe("Jun 15, 2025");
  });

  it("compares years in the garden timezone", () => {
    // It is still Dec 31, 2025 in Los Angeles, but already 2026 in UTC.
    vi.useFakeTimers({ now: new Date("2026-01-01T03:00:00Z") });
    expect(formatRevealedDate("2025-12-31T20:00:00Z", "America/Los_Angeles")).toBe("Dec 31");
    expect(formatRevealedDate("2025-12-31T20:00:00Z", "UTC")).toBe("Dec 31, 2025");
  });
});

describe("week boundaries", () => {
  it("starts weeks on Monday in the garden timezone", () => {
    // Sunday 2026-10-25 23:30 in Los Angeles is still the week of Monday 2026-10-19.
    expect(weekStartFor(new Date("2026-10-26T06:30:00Z"), "America/Los_Angeles")).toBe("2026-10-19");
    // The same instant is already Monday 2026-10-26 in Tokyo.
    expect(weekStartFor(new Date("2026-10-26T06:30:00Z"), "Asia/Tokyo")).toBe("2026-10-26");
    expect(weekStartFor(new Date("2026-10-26T00:00:00Z"), "UTC")).toBe("2026-10-26");
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-10-26", 7)).toBe("2026-11-02");
    expect(addDays("2026-01-01", -7)).toBe("2025-12-25");
  });

  it("counts consecutive weeks and forgives the current week", () => {
    const weeks = new Set(["2026-10-05", "2026-10-12", "2026-10-19"]);
    expect(streakWeeks(weeks, "2026-10-19")).toBe(3);
    expect(streakWeeks(weeks, "2026-10-26")).toBe(3);
    expect(streakWeeks(weeks, "2026-11-02")).toBe(0);
    expect(streakWeeks(new Set(["2026-10-05", "2026-10-19"]), "2026-10-19")).toBe(1);
  });

  it("formats the reset day", () => {
    expect(formatWeekReset("2026-10-26", "UTC")).toBe("Monday, Nov 2");
  });
});
