import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cva } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, type ColorKey } from "@/lib/colors";

// iOS style capsules: prominent (filled), glass (translucent), tinted (soft fill), plain (text), danger.
export type ButtonVariant = "prominent" | "glass" | "tinted" | "plain" | "danger";
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

const buttonBaseVariants = cva(
  "pressable inline-flex shrink-0 items-center justify-center rounded-capsule select-none whitespace-nowrap disabled:opacity-45 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        prominent: "lit",
        glass: "glass text-ink hover:bg-white/80",
        tinted: "",
        plain: "bg-transparent hover:bg-fill",
        danger: "bg-danger-soft text-danger",
      },
      size: {
        sm: "h-9 px-3.5 text-footnote font-semibold gap-1.5",
        md: "h-11 px-5 text-callout font-semibold gap-2",
        lg: "h-[52px] px-6 text-body font-semibold gap-2",
      },
      round: {
        true: "",
        false: "",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      { size: "sm", round: true, className: "size-9 p-0 font-normal gap-0" },
      { size: "md", round: true, className: "size-11 p-0 font-normal gap-0" },
      { size: "lg", round: true, className: "size-[52px] p-0 font-normal gap-0" },
    ],
    defaultVariants: {
      variant: "prominent",
      size: "md",
      round: false,
      full: false,
    },
  },
);

export function buttonClasses({ variant = "prominent", size = "md", accent, full, round }: ButtonStyleProps): string {
  const accentLook =
    variant === "prominent"
      ? accent
        ? PROMINENT[accent]
        : "bg-ink text-canvas"
      : variant === "tinted"
        ? accent
          ? `${COLOR_CLASSES[accent].soft} ${COLOR_CLASSES[accent].ink}`
          : "bg-fill-2 text-ink"
        : variant === "plain"
          ? accent
            ? COLOR_CLASSES[accent].ink
            : "text-tint"
          : undefined;

  return cn(buttonBaseVariants({ variant, size, round: Boolean(round), full: Boolean(full) }), accentLook);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonStyleProps & { loading?: boolean; icon?: ReactNode };

export function Button({
  variant,
  size,
  accent,
  full,
  round,
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

export function ButtonLink({
  href,
  variant,
  size,
  accent,
  full,
  round,
  className,
  children,
  icon,
  replace,
  prefetch,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      replace={replace}
      prefetch={prefetch}
      className={cn(buttonClasses({ variant, size, accent, full, round }), className)}
      {...rest}
    >
      {icon}
      {children}
    </Link>
  );
}

// Icon-only actions always have an accessible name and a 44px or larger target.
export type IconButtonProps = Omit<ButtonProps, "children" | "icon" | "round" | "size" | "aria-label"> & {
  label: string;
  icon: ReactNode;
  size?: "md" | "lg";
};

export function IconButton({ label, icon, size = "md", ...props }: IconButtonProps) {
  return <Button {...props} size={size} round aria-label={label} icon={icon} />;
}
