"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type SheetProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  tone?: string;
  dismissible?: boolean;
};

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  tone,
  dismissible = true,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClose={() => {
        document.body.style.overflow = "";
        if (open) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "fixed inset-x-0 top-auto bottom-0 m-0 w-full max-w-none max-h-[92dvh] overflow-hidden",
        "rounded-t-sheet bg-surface text-ink shadow-float outline-none",
        "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(30rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-sheet",
        "open:anim-sheet",
      )}
    >
      {open ? (
        <div className={cn("flex max-h-[92dvh] flex-col", tone)}>
          <div className="mx-auto mt-2 h-1.5 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden />
          <div className="flex items-start gap-3 px-5 pt-3 pb-2 sm:pt-5">
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-display text-title-2 font-bold">
                {title}
              </h2>
              {description ? (
                <p id={descriptionId} className="mt-1 text-callout text-ink-2">
                  {description}
                </p>
              ) : null}
            </div>
            {dismissible ? (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="pressable -mr-2 -mt-1 flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-fill"
              >
                <X className="size-5" aria-hidden />
              </button>
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
          {footer ? (
            <div className="border-t border-line bg-surface px-5 pt-3 pb-[max(1rem,var(--safe-bottom))] sm:pb-5">
              {footer}
            </div>
          ) : (
            <div className="pb-[var(--safe-bottom)]" />
          )}
        </div>
      ) : null}
    </dialog>
  );
}
