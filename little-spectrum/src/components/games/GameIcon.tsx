import { GameMotif } from "@/components/games/motifs/GameMotif";
import type { GameKey } from "@/lib/games";

// Thin wrapper kept for older call sites. Renders the game's motif tile.
export function GameIcon({ game, size = "md", className }: { game: GameKey; size?: "sm" | "md" | "lg"; className?: string }) {
  const px = { sm: 32, md: 44, lg: 56 }[size];
  return <GameMotif game={game} size={px} className={className} />;
}
