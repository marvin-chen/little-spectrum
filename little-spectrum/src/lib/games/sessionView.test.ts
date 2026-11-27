import { describe, expect, it, vi } from "vitest";
import type { GameEngine, SessionState } from "./contract";
import { projectSession } from "./sessionView";

const state: SessionState = {
  id: "session",
  gardenId: "garden",
  game: "hue-knew",
  status: "active",
  round: 1,
  createdBy: "a",
  clueGiverId: "a",
  createdAt: "2026-11-01T00:00:00Z",
  revealedAt: null,
  earlyReveal: false,
  prompt: { internal: true },
  result: null,
  secret: { target: 73 },
  photos: [],
  submissions: [{ userId: "a", round: 1, kind: "clue", payload: "private", createdAt: "" }],
  participants: [
    { userId: "a", name: "Ada", avatar: "sun:amber", predictsUserId: "b" },
    { userId: "b", name: "Bo", avatar: "cat:violet", predictsUserId: "a" },
  ],
};

function engine(): GameEngine<{ visible: string }> {
  return {
    key: "hue-knew",
    pickPrompt: () => ({ promptId: "p", prompt: {}, secret: null }),
    validateSubmission: () => ({ ok: false, error: "invalid" }),
    isRoundComplete: () => false,
    computeReveal: () => ({ result: {}, final: true }),
    earlyRevealCheck: () => ({ ok: false, reason: "Waiting", pending: ["b"] }),
    turnStatus: () => ({ needsYou: true, line: "Your turn" }),
    view: vi.fn(() => ({ visible: "safe" })),
    hydrateView: vi.fn(async (_state, _user, view) => ({ ...view, visible: "hydrated" })),
  };
}

describe("shared session projection", () => {
  it("rejects outsiders and mismatched engines before shaping or hydrating", async () => {
    const e = engine();
    await expect(projectSession(e, state, "outsider")).rejects.toThrow("Only participants");
    await expect(projectSession(e, { ...state, game: "true-colors" }, "a")).rejects.toThrow("does not match");
    expect(e.view).not.toHaveBeenCalled();
    expect(e.hydrateView).not.toHaveBeenCalled();
  });

  it("exposes only the explicit envelope and the engine's hydrated view", async () => {
    const e = engine();
    const result = await projectSession(e, state, "b");
    expect(result.view.visible).toBe("hydrated");
    expect(result.isCreator).toBe(false);
    expect(result.earlyReveal_.pendingNames).toEqual(["Bo"]);
    expect(result.participants[0]).toEqual({ userId: "a", name: "Ada", avatar: "sun:amber" });
    for (const key of ["secret", "submissions", "photos", "prompt", "result"]) expect(result).not.toHaveProperty(key);
    expect(e.hydrateView).toHaveBeenCalledWith(state, "b", { visible: "safe" });
  });

  it("supports pure engines without hydration and propagates hydration failures", async () => {
    const e = engine();
    delete e.hydrateView;
    expect((await projectSession(e, state, "a")).view).toEqual({ visible: "safe" });
    e.hydrateView = async () => {
      throw new Error("storage unavailable");
    };
    await expect(projectSession(e, state, "a")).rejects.toThrow("storage unavailable");
  });
});
