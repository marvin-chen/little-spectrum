import { Camera, Grid3x3, ListOrdered, Radio, SlidersHorizontal, Sparkles, UserRoundSearch, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES } from "@/lib/colors";
import { GAMES, type GameKey } from "@/lib/games";

export const GAME_ICONS: Record<GameKey, LucideIcon> = {
  "hue-knew": SlidersHorizontal,
  "true-colors": UserRoundSearch,
  "hue-clue": Grid3x3,
  "same-wavelength": Radio,
  "palette-picks": ListOrdered,
  "color-quest": Camera,
};

export function GameIcon({ game, size = "md", className }: { game: GameKey; size?: "sm" | "md" | "lg"; className?: string }) {
  const Icon = GAME_ICONS[game] ?? Sparkles;
  const colors = COLOR_CLASSES[GAMES[game].color];
  const sizes = { sm: "size-8 rounded-[10px] [&_svg]:size-4", md: "size-11 rounded-row [&_svg]:size-5", lg: "size-14 rounded-card [&_svg]:size-7" };
  return (
    <span className={cn("flex shrink-0 items-center justify-center", colors.soft, colors.ink, sizes[size], className)} aria-hidden>
      <Icon strokeWidth={2.25} />
    </span>
  );
}
