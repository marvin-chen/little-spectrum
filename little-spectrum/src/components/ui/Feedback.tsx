import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Feedback({
  children,
  tone = "info",
  className,
}: {
  children: ReactNode;
  tone?: "info" | "success" | "error";
  className?: string;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "rounded-row px-4 py-3 text-callout",
        tone === "error"
          ? "bg-danger-soft text-danger"
          : tone === "success"
            ? "bg-green-soft text-green-ink"
            : "bg-fill text-ink-2",
        className,
      )}
    >
      {children}
    </p>
  );
}
