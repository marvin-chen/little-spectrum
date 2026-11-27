import {
  Cat,
  Cloud,
  Coffee,
  Flower2,
  Heart,
  Leaf,
  Moon,
  Music,
  Star,
  Sun,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { parseAvatar, type AvatarIcon } from "@/lib/avatars";
import { COLOR_CLASSES } from "@/lib/colors";

export const AVATAR_ICON_COMPONENTS: Record<AvatarIcon, LucideIcon> = {
  sun: Sun,
  leaf: Leaf,
  cloud: Cloud,
  star: Star,
  waves: Waves,
  moon: Moon,
  flower: Flower2,
  cat: Cat,
  zap: Zap,
  heart: Heart,
  music: Music,
  coffee: Coffee,
};

type AvatarProps = {
  avatar: string | null | undefined;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
};

const sizes = {
  xs: "size-6 [&_svg]:size-3.5",
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-5",
  lg: "size-14 [&_svg]:size-7",
  xl: "size-20 [&_svg]:size-10",
};

export function Avatar({ avatar, name, size = "md", className, ring }: AvatarProps) {
  const parsed = parseAvatar(avatar);
  const Icon = AVATAR_ICON_COMPONENTS[parsed.icon];
  const colors = COLOR_CLASSES[parsed.color];
  return (
    <span
      role="img"
      aria-label={name}
      title={name}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full",
        colors.soft,
        colors.ink,
        ring && "ring-2 ring-surface",
        sizes[size],
        className,
      )}
    >
      <Icon aria-hidden strokeWidth={2.25} />
    </span>
  );
}

export function AvatarStack({
  people,
  size = "sm",
  max = 5,
  className,
}: {
  people: Array<{ id: string; name: string; avatar: string | null }>;
  size?: "xs" | "sm" | "md";
  max?: number;
  className?: string;
}) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <span className={cn("inline-flex items-center", className)}>
      {shown.map((p, i) => (
        <Avatar key={p.id} avatar={p.avatar} name={p.name} size={size} ring className={i > 0 ? "-ml-2" : undefined} />
      ))}
      {extra > 0 ? (
        <span
          className={cn(
            "-ml-2 inline-flex items-center justify-center rounded-full bg-fill-2 text-caption font-semibold text-ink-2 ring-2 ring-surface",
            sizes[size],
          )}
        >
          +{extra}
        </span>
      ) : null}
    </span>
  );
}
