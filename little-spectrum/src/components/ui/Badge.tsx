import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, type ColorKey } from "@/lib/colors";

const badgeVariants = cva("inline-flex h-6 items-center gap-1 rounded-capsule px-2 text-caption font-semibold", {
  variants: {
    tone: {
      neutral: "bg-fill text-ink-2",
      ink: "bg-ink text-canvas",
      glass: "glass text-ink-2",
      coral: `${COLOR_CLASSES.coral.soft} ${COLOR_CLASSES.coral.ink}`,
      rose: `${COLOR_CLASSES.rose.soft} ${COLOR_CLASSES.rose.ink}`,
      violet: `${COLOR_CLASSES.violet.soft} ${COLOR_CLASSES.violet.ink}`,
      blue: `${COLOR_CLASSES.blue.soft} ${COLOR_CLASSES.blue.ink}`,
      amber: `${COLOR_CLASSES.amber.soft} ${COLOR_CLASSES.amber.ink}`,
      green: `${COLOR_CLASSES.green.soft} ${COLOR_CLASSES.green.ink}`,
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

type BadgeProps = VariantProps<typeof badgeVariants> & {
  tone?: ColorKey | "neutral" | "ink" | "glass";
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Badge({ tone = "neutral", icon, children, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)}>
      {icon}
      {children}
    </span>
  );
}
