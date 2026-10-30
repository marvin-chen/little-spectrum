import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageTitleProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function PageTitle({ eyebrow, title, subtitle, action, className }: PageTitleProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4 pb-5 pt-2", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-title-1 font-bold text-ink">{title}</h1>
        {subtitle ? <p className="mt-1 text-callout text-ink-2">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}

export function CompactHeader({
  leading,
  title,
  trailing,
  tint,
}: {
  leading?: ReactNode;
  title: ReactNode;
  trailing?: ReactNode;
  tint?: string;
}) {
  return (
    <header
      className={cn(
        "glass sticky top-0 z-20 -mx-4 mb-4 flex h-14 items-center gap-2 border-b border-line px-2",
        "pt-[var(--safe-top)]",
        tint,
      )}
    >
      <div className="flex w-20 items-center">{leading}</div>
      <div className="min-w-0 flex-1 truncate text-center text-body font-semibold text-ink">{title}</div>
      <div className="flex w-20 items-center justify-end">{trailing}</div>
    </header>
  );
}
