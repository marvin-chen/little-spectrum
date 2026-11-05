import { GAMES } from "@/lib/games";
import type { GameEngine, SessionState } from "../contract";
import { projectSession } from "../sessionView";

export const FIXTURE_TIME = "2026-11-01T12:00:00.000Z";
const NAMES = ["Ada", "Bo", "Cy", "Dee", "Eli", "Fern", "Gus", "Harper with a longer display name"];

/** Synthetic server/test state. Never pass this object to a client component. */
export function createFixture(engine: GameEngine, players: 2 | 3 | 8 = 3): SessionState {
  const participants = NAMES.slice(0, players).map((name, i) => ({
    userId: `fixture-player-${i + 1}`, name, avatar: "sun:amber", predictsUserId: null as string | null,
  }));
  const pick = engine.pickPrompt([], participants, () => 0.37);
  for (const p of participants) p.predictsUserId = pick.predictions?.[p.userId] ?? null;
  return {
    id: `fixture-${engine.key}`, gardenId: "fixture-garden", game: engine.key,
    status: "active", createdBy: participants[0].userId,
    clueGiverId: GAMES[engine.key].kind === "clue" ? participants[0].userId : null,
    prompt: structuredClone(pick.prompt), secret: structuredClone(pick.secret),
    round: 1, result: null, earlyReveal: false, createdAt: FIXTURE_TIME, revealedAt: null,
    participants, submissions: [], photos: [],
  };
}

/** Uses real validation; returns an independent state so examples cannot contaminate each other. */
export function submitFixture(engine: GameEngine, state: SessionState, userId: string, input: unknown): SessionState {
  if (engine.key !== state.game) throw new Error("Fixture engine mismatch.");
  if (state.status !== "active") throw new Error("Fixture is already revealed.");
  if (!state.participants.some((p) => p.userId === userId)) throw new Error("Fixture participant required.");
  const next = structuredClone(state);
  const result = engine.validateSubmission(next, userId, input);
  if (!result.ok) throw new Error(result.error);
  if (next.submissions.some((s) => s.userId === userId && s.round === next.round && s.kind === result.kind)) {
    throw new Error("Fixture submission is already locked in.");
  }
  next.submissions.push({ userId, round: next.round, kind: result.kind, payload: result.payload, createdAt: FIXTURE_TIME });
  return next;
}

/** Models the result/round transition only; never performs writes or awards growth. */
export function revealFixture(engine: GameEngine, state: SessionState, early = false): SessionState {
  if (engine.key !== state.game) throw new Error("Fixture engine mismatch.");
  if (state.status !== "active") throw new Error("Fixture is already revealed.");
  const next = structuredClone(state);
  if (early ? !engine.earlyRevealCheck(next).ok : !engine.isRoundComplete(next)) {
    throw new Error("Fixture is not ready to reveal.");
  }
  const outcome = engine.computeReveal(next, early);
  next.result = outcome.result;
  next.earlyReveal = early;
  if (outcome.final) {
    next.status = "revealed";
    next.revealedAt = FIXTURE_TIME;
  } else next.round += 1;
  return next;
}

/** Safe preview props. Deliberately skips real storage/network hydration. */
export function previewFixture<View>(engine: GameEngine<View>, state: SessionState, userId: string) {
  return projectSession({ ...engine, hydrateView: undefined }, structuredClone(state), userId);
}
