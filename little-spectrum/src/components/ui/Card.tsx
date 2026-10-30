import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-card bg-surface shadow-card ring-1 ring-line", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionLabel({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-2 flex items-end justify-between px-1", className)}>
      <h2 className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{children}</h2>
      {action}
    </div>
  );
}

export function Group({ className, children }: { className?: string; children: ReactNode }) {
  return <Card className={cn("overflow-hidden", className)}>{children}</Card>;
}

type RowBaseProps = {
  icon?: ReactNode;
  label: ReactNode;
  detail?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

function RowInner({ icon, label, detail, trailing, chevron }: RowBaseProps & { chevron?: boolean }) {
  return (
    <>
      {icon ? <span className="flex size-8 shrink-0 items-center justify-center">{icon}</span> : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body text-ink">{label}</span>
        {detail ? <span className="block text-footnote text-ink-3">{detail}</span> : null}
      </span>
      {trailing ? <span className="shrink-0 text-callout text-ink-3">{trailing}</span> : null}
      {chevron ? <ChevronRight className="size-5 shrink-0 text-ink-3" aria-hidden /> : null}
    </>
  );
}

const rowClass =
  "flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left not-last:border-b not-last:border-line";

export function Row(props: RowBaseProps) {
  return (
    <div className={cn(rowClass, props.className)}>
      <RowInner {...props} />
    </div>
  );
}

export function RowLink({ href, ...props }: RowBaseProps & { href: string }) {
  return (
    <Link href={href} className={cn(rowClass, "pressable hover:bg-fill", props.className)}>
      <RowInner {...props} chevron />
    </Link>
  );
}

export function RowButton({
  onClick,
  disabled,
  chevron = true,
  ...props
}: RowBaseProps & { onClick: () => void; disabled?: boolean; chevron?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(rowClass, "pressable hover:bg-fill disabled:opacity-50", props.className)}
    >
      <RowInner {...props} chevron={chevron} />
    </button>
  );
}
