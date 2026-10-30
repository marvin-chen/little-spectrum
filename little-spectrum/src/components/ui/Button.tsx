import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, type ColorKey } from "@/lib/colors";

// iOS style capsules: prominent (filled), glass (translucent), tinted (soft fill), plain (text), danger.
export type ButtonVariant = "prominent" | "glass" | "tinted" | "plain" | "danger" | "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: ColorKey;
  full?: boolean;
  round?: boolean;
};

const PROMINENT: Record<ColorKey, string> = {
  coral: "bg-coral-deep text-white",
  rose: "bg-rose-deep text-white",
  violet: "bg-violet-deep text-white",
  blue: "bg-blue-deep text-white",
  amber: "bg-amber-deep text-white",
  green: "bg-green-deep text-white",
};

export function buttonClasses({ variant = "prominent", size = "md", accent, full, round }: ButtonStyleProps): string {
  const sizes: Record<ButtonSize, string> = {
    sm: round ? "size-9 text-footnote" : "h-9 px-3.5 text-footnote font-semibold gap-1.5",
    md: round ? "size-11 text-callout" : "h-11 px-5 text-callout font-semibold gap-2",
    lg: round ? "size-[52px] text-body" : "h-[52px] px-6 text-body font-semibold gap-2",
  };
  const resolved = variant === "primary" ? "prominent" : variant === "secondary" ? "glass" : variant === "ghost" ? "plain" : variant;
  let look = "";
  if (resolved === "prominent") {
    look = cn("lit", accent ? PROMINENT[accent] : "bg-ink text-canvas");
  } else if (resolved === "glass") {
    look = "glass text-ink hover:bg-white/80";
  } else if (resolved === "tinted") {
    look = accent ? `${COLOR_CLASSES[accent].soft} ${COLOR_CLASSES[accent].ink}` : "bg-fill-2 text-ink";
  } else if (resolved === "plain") {
    look = accent ? `bg-transparent ${COLOR_CLASSES[accent].ink} hover:bg-fill` : "bg-transparent text-tint hover:bg-fill";
  } else if (resolved === "danger") {
    look = "bg-danger-soft text-danger";
  }
  return cn(
    "pressable inline-flex shrink-0 items-center justify-center rounded-capsule select-none whitespace-nowrap",
    "disabled:opacity-45 disabled:cursor-not-allowed",
    sizes[size],
    look,
    full && "w-full",
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & { loading?: boolean; icon?: ReactNode };

export function Button({ variant, size, accent, full, round, loading, icon, className, children, disabled, type = "button", ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, accent, full, round }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
    </button>
  );
}

type ButtonLinkProps = ButtonStyleProps & {
  href: string;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  replace?: boolean;
  prefetch?: boolean;
  "aria-label"?: string;
};

export function ButtonLink({ href, variant, size, accent, full, round, className, children, icon, replace, prefetch, ...rest }: ButtonLinkProps) {
  return (
    <Link href={href} replace={replace} prefetch={prefetch} className={cn(buttonClasses({ variant, size, accent, full, round }), className)} {...rest}>
      {icon}
      {children}
    </Link>
  );
}
