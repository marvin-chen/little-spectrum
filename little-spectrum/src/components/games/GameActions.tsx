"use client";

import { createContext, useContext, type ReactNode } from "react";

type Result = { error?: string };
export type GameActions = {
  initialError?: string;
  finishPending?: () => void;
  submitAction: (gardenId: string, sessionId: string, input: unknown) => Promise<Result>;
  playAgainAction: (gardenId: string, sessionId: string) => Promise<Result>;
  deletePhotoAction: (gardenId: string, sessionId: string, photoId: string) => Promise<Result>;
  uploadPhoto: (form: FormData) => Promise<Result>;
};
const Context = createContext<GameActions | null>(null);

export function GameActionsProvider({ actions, children }: { actions: GameActions; children: ReactNode }) {
  return <Context.Provider value={actions}>{children}</Context.Provider>;
}

export function useGameActions(): GameActions {
  const actions = useContext(Context);
  if (!actions) throw new Error("Game screens require a GameActionsProvider.");
  return actions;
}
