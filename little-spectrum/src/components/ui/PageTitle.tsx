import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PageTitleProps = {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  className?: string;
};

// Large title with an optional glass toolbar group on the trailing edge.
export function PageTitle({ eyebrow, title, subtitle, action, className }: PageTitleProps) {
  return (
    <header className={cn("flex items-start justify-between gap-4 pt-3 pb-5", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="mb-1 text-footnote font-semibold text-ink-3">{eyebrow}</p> : null}
        <h1 className="font-display text-large-title font-bold text-ink">{title}</h1>
        {subtitle ? <p className="mt-1.5 text-callout text-ink-2">{subtitle}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 items-center gap-2 pt-0.5">{action}</div> : null}
    </header>
  );
}

// Glass circular toolbar button, the iOS 26 top-right control.
export function ToolbarGroup({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("glass flex h-11 items-center gap-0.5 rounded-capsule p-1", className)}>{children}</div>;
}

export function CompactHeader({ leading, title, trailing, tint }: { leading?: ReactNode; title: ReactNode; trailing?: ReactNode; tint?: string }) {
  return (
    <header className={cn("sticky top-0 z-20 -mx-4 mb-3 flex h-[60px] items-center gap-2 px-3 pt-[var(--safe-top)] md:-mx-8 md:px-6", tint)}>
      <div className="flex w-24 items-center">{leading}</div>
      <div className="min-w-0 flex-1 truncate text-center text-headline font-semibold text-ink">{title}</div>
      <div className="flex w-24 items-center justify-end">{trailing}</div>
    </header>
  );
}
