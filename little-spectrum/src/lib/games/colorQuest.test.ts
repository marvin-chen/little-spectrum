import { describe, expect, it, vi } from "vitest";
import type { SessionState } from "./engine";

vi.mock("@/lib/photos/server", () => ({
  signedPhotoUrls: async (paths: string[]) => new Map(paths.map((p) => [p, `https://signed/${p}`])),
}));

const { colorQuest } = await import("./colorQuest");

function state(overrides: Partial<SessionState> = {}): SessionState {
  return {
    id: "s1",
    gardenId: "g1",
    game: "color-quest",
    status: "active",
    createdBy: "a",
    clueGiverId: null,
    prompt: { id: "smile", text: "Something that made you smile today." },
    round: 1,
    result: null,
    earlyReveal: false,
    createdAt: "",
    revealedAt: null,
    participants: [
      { userId: "a", name: "Ada", avatar: "sun:amber", predictsUserId: null },
      { userId: "b", name: "Bo", avatar: "cat:violet", predictsUserId: null },
    ],
    submissions: [],
    secret: null,
    photos: [
      { id: "p1", userId: "a", storagePath: "sessions/s1/a-p1.jpg", caption: null, width: 1200, height: 900, status: "ready", createdAt: "" },
      { id: "p2", userId: "b", storagePath: "sessions/s1/b-p2.jpg", caption: null, width: 900, height: 1200, status: "ready", createdAt: "" },
      { id: "p3", userId: "b", storagePath: "sessions/s1/b-p3.jpg", caption: null, width: 1, height: 1, status: "pending", createdAt: "" },
    ],
    ...overrides,
  };
}

describe("colorQuest engine", () => {
  it("accepts only the uploader's own ready photo", () => {
    const s = state();
    expect(colorQuest.validateSubmission(s, "a", { photoId: "p2" }).ok).toBe(false);
    expect(colorQuest.validateSubmission(s, "b", { photoId: "p3" }).ok).toBe(false);
    expect(colorQuest.validateSubmission(s, "a", { photoId: "p1", caption: "  a cat  " })).toEqual({
      ok: true,
      kind: "answer",
      payload: { photoId: "p1", caption: "a cat" },
    });
    expect(colorQuest.validateSubmission(s, "a", { photoId: "p1", caption: "x".repeat(201) }).ok).toBe(false);
  });

  it("keeps other photos private until reveal and signs urls after", async () => {
    const s = state({
      submissions: [
        { userId: "a", round: 1, kind: "answer", payload: { photoId: "p1", caption: null }, createdAt: "" },
        { userId: "b", round: 1, kind: "answer", payload: { photoId: "p2", caption: "hi" }, createdAt: "" },
      ],
    });
    const before = (await colorQuest.hydrateView!(s, "a", colorQuest.view(s, "a"))) as { myPhoto: { url: string }; gallery: unknown };
    expect(before.myPhoto.url).toBe("https://signed/sessions/s1/a-p1.jpg");
    expect(before.gallery).toBeNull();
    expect(JSON.stringify(before)).not.toContain("b-p2");

    const outcome = colorQuest.computeReveal(s, false);
    const revealed = state({ ...s, status: "revealed", result: outcome.result });
    const after = (await colorQuest.hydrateView!(revealed, "a", colorQuest.view(revealed, "a"))) as { gallery: Array<{ url: string | null; removed: boolean }> };
    expect(after.gallery).toHaveLength(2);
    expect(after.gallery[1].url).toBe("https://signed/sessions/s1/b-p2.jpg");
  });

  it("marks removed photos gracefully", () => {
    const s = state({
      status: "revealed",
      photos: [],
      result: { photos: [{ userId: "a", photoId: "p1", caption: "gone" }], missing: ["b"] },
    });
    const view = colorQuest.view(s, "b") as { gallery: Array<{ removed: boolean }>; missing: string[] };
    expect(view.gallery[0].removed).toBe(true);
    expect(view.missing).toEqual(["b"]);
  });
});
