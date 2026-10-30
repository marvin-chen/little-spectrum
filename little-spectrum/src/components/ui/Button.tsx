import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, type ColorKey } from "@/lib/colors";

export type ButtonVariant = "primary" | "secondary" | "tinted" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonStyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  accent?: ColorKey;
  full?: boolean;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  accent,
  full,
}: ButtonStyleProps): string {
  const sizes: Record<ButtonSize, string> = {
    sm: "h-9 px-3.5 text-footnote font-semibold gap-1.5",
    md: "h-11 px-5 text-callout font-semibold gap-2",
    lg: "h-[52px] px-6 text-body font-semibold gap-2",
  };
  let look = "";
  if (variant === "primary") {
    look = accent
      ? `${COLOR_CLASSES[accent].bg} text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset]`
      : "bg-ink text-ivory";
  } else if (variant === "secondary") {
    look = "bg-fill text-ink hover:bg-fill-2";
  } else if (variant === "tinted") {
    look = accent
      ? `${COLOR_CLASSES[accent].soft} ${COLOR_CLASSES[accent].ink}`
      : "bg-amber-soft text-amber-ink";
  } else if (variant === "ghost") {
    look = "bg-transparent text-ink hover:bg-fill";
  } else if (variant === "danger") {
    look = "bg-danger-soft text-danger";
  }
  return cn(
    "pressable inline-flex items-center justify-center rounded-capsule select-none whitespace-nowrap",
    "disabled:opacity-50 disabled:cursor-not-allowed",
    sizes[size],
    look,
    full && "w-full",
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & { loading?: boolean; icon?: ReactNode };

export function Button({
  variant,
  size,
  accent,
  full,
  loading,
  icon,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonClasses({ variant, size, accent, full }), className)}
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
};

export function ButtonLink({
  href,
  variant,
  size,
  accent,
  full,
  className,
  children,
  icon,
  replace,
  prefetch,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      replace={replace}
      prefetch={prefetch}
      className={cn(buttonClasses({ variant, size, accent, full }), className)}
    >
      {icon}
      {children}
    </Link>
  );
}
