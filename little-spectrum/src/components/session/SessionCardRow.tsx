import Link from "next/link";
import { ViewTransition } from "react";
import { ChevronRight } from "lucide-react";
import { GameMotif } from "@/components/games/motifs/GameMotif";
import { AvatarStack } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES } from "@/lib/colors";
import type { SessionCard } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";

export function SessionCardRow({ card, gardenId, emphasize, index = 0 }: { card: SessionCard; gardenId: string; emphasize?: boolean; index?: number }) {
  const game = GAMES[card.game];
  return (
    <Link
      href={`/g/${gardenId}/play/${card.id}`}
      transitionTypes={["nav-forward"]}
      className="pressable anim-rise flex min-h-[64px] items-center gap-3 px-4 py-2.5 not-last:border-b not-last:border-line hover:bg-fill"
      style={{ "--i": index } as React.CSSProperties}
    >
      <ViewTransition name={`session-${card.id}`} share="morph" default="none">
        <GameMotif game={card.game} size={44} />
      </ViewTransition>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-headline font-semibold text-ink">{game.name}</span>
        <span className={cn("flex items-center gap-1.5 truncate text-footnote", emphasize ? COLOR_CLASSES[game.color].ink : "text-ink-2")}>
          {emphasize ? <span className={cn("size-1.5 shrink-0 rounded-full", COLOR_CLASSES[game.color].bg)} aria-hidden /> : null}
          {card.turn.line}
        </span>
      </span>
      <AvatarStack people={card.participants.map((p) => ({ id: p.userId, name: p.name, avatar: p.avatar }))} size="xs" max={3} />
      <ChevronRight className="size-5 shrink-0 text-ink-3/70" aria-hidden />
    </Link>
  );
}
