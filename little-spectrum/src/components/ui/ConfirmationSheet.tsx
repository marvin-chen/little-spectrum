"use client";

import type { ReactNode } from "react";
import { Button } from "./Button";
import { Feedback } from "./Feedback";
import { Sheet } from "./Sheet";

export type ConfirmationSheetProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  pending?: boolean;
  destructive?: boolean;
  error?: string | null;
  children?: ReactNode;
};

export function ConfirmationSheet({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  pending = false,
  destructive = false,
  error,
  children,
}: ConfirmationSheetProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      dismissible={!pending}
      footer={
        <div className="flex flex-col gap-2">
          {error ? <Feedback tone="error">{error}</Feedback> : null}
          <Button full size="lg" variant={destructive ? "danger" : "prominent"} loading={pending} onClick={onConfirm}>
            {confirmLabel}
          </Button>
          <Button full variant="plain" disabled={pending} onClick={onClose}>
            {cancelLabel}
          </Button>
        </div>
      }
    >
      {children}
    </Sheet>
  );
}
