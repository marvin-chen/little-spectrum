import type { GameKey } from "@/lib/games";
import type { EarlyRevealCheck, GameEngine, TurnStatus, SessionState } from "./contract";

export type SessionParticipant = { userId: string; name: string; avatar: string };

export type SessionView<View = unknown> = {
  id: string;
  gardenId: string;
  game: GameKey;
  status: "active" | "revealed";
  round: number;
  createdBy: string;
  clueGiverId: string | null;
  createdAt: string;
  revealedAt: string | null;
  earlyReveal: boolean;
  participants: SessionParticipant[];
  isCreator: boolean;
  turn: TurnStatus;
  earlyReveal_: EarlyRevealCheck & { pendingNames: string[] };
  view: View;
};

// Call only on the server for real sessions. Authentication and garden membership
// belong to the caller; participation is checked here before view or hydration.
export async function projectSession<View>(
  engine: GameEngine<View>,
  state: SessionState,
  userId: string,
): Promise<SessionView<View>> {
  if (engine.key !== state.game) throw new Error("Game engine does not match the session.");
  if (!state.participants.some((p) => p.userId === userId)) {
    throw new Error("Only participants can view this session.");
  }
  const check = engine.earlyRevealCheck(state);
  const base = engine.view(state, userId);
  const view = engine.hydrateView ? await engine.hydrateView(state, userId, base) : base;
  return {
    id: state.id,
    gardenId: state.gardenId,
    game: state.game,
    status: state.status,
    round: state.round,
    createdBy: state.createdBy,
    clueGiverId: state.clueGiverId,
    createdAt: state.createdAt,
    revealedAt: state.revealedAt,
    earlyReveal: state.earlyReveal,
    participants: state.participants.map(({ userId, name, avatar }) => ({ userId, name, avatar })),
    isCreator: state.createdBy === userId,
    turn: engine.turnStatus(state, userId),
    earlyReveal_: {
      ...check,
      pendingNames: check.pending.map((id) => state.participants.find((p) => p.userId === id)?.name ?? "Someone"),
    },
    view,
  };
}
