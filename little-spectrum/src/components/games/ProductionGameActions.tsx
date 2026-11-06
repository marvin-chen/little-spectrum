"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { submitAction, playAgainAction } from "@/app/g/[gardenId]/play/[sessionId]/actions";
import { deletePhotoAction } from "@/app/api/photos/actions";
import { GameActionsProvider, type GameActions } from "./GameActions";

export function ProductionGameActions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const actions: GameActions = {
    submitAction, playAgainAction, deletePhotoAction,
    async uploadPhoto(form) {
      const response = await fetch("/api/photos", { method: "POST", body: form });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) return { error: body.error ?? "Upload failed. Please try again." };
      router.refresh();
      return {};
    },
  };
  return <GameActionsProvider actions={actions}>{children}</GameActionsProvider>;
}
