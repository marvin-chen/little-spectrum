"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { submitAction, playAgainAction } from "@/app/g/[gardenId]/play/[sessionId]/actions";
import { deletePhotoAction } from "@/app/api/photos/actions";
import { GameActionsProvider, type GameActions } from "./GameActions";

export function ProductionGameActions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const actions: GameActions = {
    async submitAction(gardenId, sessionId, input) {
      const result = await submitAction(gardenId, sessionId, input);
      if (!result.error) toast.success("Turn locked in");
      return result;
    },
    playAgainAction,
    async deletePhotoAction(gardenId, sessionId, photoId) {
      const result = await deletePhotoAction(gardenId, sessionId, photoId);
      if (!result.error) toast.success("Photo removed");
      return result;
    },
    async uploadPhoto(form) {
      const response = await fetch("/api/photos", { method: "POST", body: form });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) return { error: body.error ?? "Upload failed. Please try again." };
      toast.success("Photo shared");
      router.refresh();
      return {};
    },
  };
  return <GameActionsProvider actions={actions}>{children}</GameActionsProvider>;
}
