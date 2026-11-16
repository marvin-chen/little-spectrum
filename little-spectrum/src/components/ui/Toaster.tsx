"use client";

import { Check, CircleAlert, Sparkles } from "lucide-react";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      duration={2800}
      gap={8}
      visibleToasts={2}
      swipeDirections={["top"]}
      offset={{ top: "max(0.75rem, var(--safe-top))" }}
      mobileOffset={{ top: "max(0.75rem, var(--safe-top))", left: "1rem", right: "1rem" }}
      icons={{
        success: <Check className="size-3.5" strokeWidth={2.75} aria-hidden />,
        error: <CircleAlert className="size-4" aria-hidden />,
        info: <Sparkles className="size-3.5" aria-hidden />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "glass-strong pointer-events-auto flex w-full items-center gap-3 rounded-capsule px-4 py-2.5 text-ink shadow-float ring-1 ring-line",
          content: "min-w-0 flex-1",
          title: "text-callout font-semibold text-ink leading-snug",
          description: "text-footnote text-ink-2 leading-snug",
          icon: "flex size-6 shrink-0 items-center justify-center rounded-full bg-fill text-ink",
          success: "[&_[data-icon]]:bg-green-soft [&_[data-icon]]:text-green-ink",
          error: "[&_[data-icon]]:bg-danger-soft [&_[data-icon]]:text-danger",
          info: "[&_[data-icon]]:bg-amber-soft [&_[data-icon]]:text-amber-ink",
        },
      }}
    />
  );
}
