"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./Button";
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
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

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

  function startSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dismissible) return;
    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartY.current === null) return;
    const delta = event.clientY - dragStartY.current;
    setDragY(delta > 0 ? delta : delta * 0.15);
  }

  function endSwipe() {
    if (dragStartY.current === null) return;
    const shouldClose = dragY > 88;
    dragStartY.current = null;
    setDragY(0);
    if (shouldClose && dismissible) onClose();
  }

  return (
    <dialog
      ref={ref}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const dialog = event.currentTarget;
        const controls = Array.from(dialog.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [tabindex]',
        )).filter((element) => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) {
          event.preventDefault();
          dialog.focus();
        } else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) {
          event.preventDefault();
          first.focus();
        }
      }}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClose={() => {
        document.body.style.overflow = "";
        setDragY(0);
        if (open) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      style={dragY !== 0 ? { transform: `translateY(${dragY}px)` } : undefined}
      className={cn(
        "fixed inset-x-2 top-auto bottom-2 m-0 w-auto max-w-none max-h-[92dvh] overflow-hidden",
        "glass-strong rounded-sheet text-ink outline-none",
        "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-[min(30rem,calc(100%-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2",
        dragY === 0 && "transition-transform duration-300 ease-[var(--ease-spring)]",
        "open:anim-sheet",
      )}
    >
      {open ? (
        <div className={cn("flex max-h-[92dvh] flex-col", tone)}>
          <div
            onPointerDown={startSwipe}
            onPointerMove={moveSwipe}
            onPointerUp={endSwipe}
            onPointerCancel={endSwipe}
            style={{ touchAction: "none" }}
            className=" cursor-grab pt-2.5 pb-1 active:cursor-grabbing sm:hidden"
            aria-hidden
          >
            <div className="mx-auto h-[5px] w-9 rounded-full bg-ink/15" />
          </div>
          <div className="flex items-start gap-3 px-5 pt-2 pb-2 sm:pt-5">
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
              <IconButton label="Close" onClick={onClose} variant="plain"
                className="-mt-1 -mr-1 bg-fill text-ink-2 hover:bg-fill-2"
                icon={<X className="size-5" aria-hidden />} />
            ) : null}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
          {footer ? (
            <div className="border-t border-line px-5 pt-3 pb-[max(1rem,calc(var(--safe-bottom)+0.25rem))] sm:pb-5">
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
