import { describe, expect, it } from "vitest";
import { safeNextPath } from "./paths";

describe("safeNextPath", () => {
  it("keeps paths on this site with their query and hash", () => {
    expect(safeNextPath("/g/abc/play/def?x=1#top", "/")).toBe("/g/abc/play/def?x=1#top");
    expect(safeNextPath("/%2F/evil.com", "/")).toBe("/%2F/evil.com");
  });

  it.each([
    ["scheme-relative", "//evil.com"],
    ["backslash", "/\\evil.com"],
    ["tab", "/\t/evil.com"],
    ["newline", "/\n/evil.com"],
    ["carriage return", "/\r/evil.com"],
    ["absolute url", "https://evil.com"],
    ["no leading slash", "evil.com"],
    ["script url", "javascript:alert(1)"],
  ])("falls back for a %s path", (_name, value) => {
    expect(safeNextPath(value, "/start")).toBe("/start");
  });

  it("falls back when the value is not a string", () => {
    expect(safeNextPath(null, "/start")).toBe("/start");
    expect(safeNextPath(["/g"], "/start")).toBe("/start");
  });

  it("never lets the redirect leave the site", () => {
    const origin = "https://little.example";
    for (const value of ["/\t/evil.com", "/\u0000/evil.com", "/ /evil.com", "/\\/evil.com", "///evil.com"]) {
      expect(new URL(safeNextPath(value, "/"), origin).origin).toBe(origin);
    }
  });
});
