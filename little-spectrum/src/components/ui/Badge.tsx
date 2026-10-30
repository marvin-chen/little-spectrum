import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, type ColorKey } from "@/lib/colors";

type BadgeProps = {
  tone?: ColorKey | "neutral" | "ink";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  const look =
    tone === "neutral"
      ? "bg-fill text-ink-2"
      : tone === "ink"
        ? "bg-ink text-ivory"
        : `${COLOR_CLASSES[tone].soft} ${COLOR_CLASSES[tone].ink}`;
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-capsule px-2 text-caption font-semibold tracking-wide",
        look,
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
