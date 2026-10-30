import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GameIcon } from "@/components/games/GameIcon";
import { AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import type { SessionCard } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";

export function SessionCardRow({ card, gardenId, emphasize }: { card: SessionCard; gardenId: string; emphasize?: boolean }) {
  const game = GAMES[card.game];
  return (
    <Link
      href={`/g/${gardenId}/play/${card.id}`}
      className={cn(
        "pressable flex min-h-16 items-center gap-3 px-4 py-3 not-last:border-b not-last:border-line hover:bg-fill",
      )}
    >
      <GameIcon game={card.game} />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-body font-semibold text-ink">{game.name}</span>
          {emphasize ? <Badge tone={game.color}>Your turn</Badge> : null}
        </span>
        <span className="block truncate text-footnote text-ink-2">{card.turn.line}</span>
      </span>
      <AvatarStack people={card.participants.map((p) => ({ id: p.userId, name: p.name, avatar: p.avatar }))} size="xs" max={4} />
      <ChevronRight className="size-5 shrink-0 text-ink-3" aria-hidden />
    </Link>
  );
}
