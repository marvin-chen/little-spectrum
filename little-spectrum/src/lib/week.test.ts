import { describe, expect, it } from "vitest";
import { addDays, formatWeekReset, streakWeeks, weekStartFor } from "./week";

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
