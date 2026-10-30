import { GameIcon } from "@/components/games/GameIcon";
import { AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import type { SessionCard } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";

// Mirrors SessionCardRow without the link, since demo sessions have nowhere to go.
export function DemoSessionRow({ card, emphasize }: { card: SessionCard; emphasize?: boolean }) {
  const game = GAMES[card.game];
  return (
    <div className="flex min-h-16 items-center gap-3 px-4 py-3 not-last:border-b not-last:border-line">
      <GameIcon game={card.game} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-body font-semibold text-ink">{game.name}</span>
          {emphasize ? <Badge tone={game.color}>Your turn</Badge> : <Badge>Demo</Badge>}
        </span>
        <span className="block truncate text-footnote text-ink-2">{card.turn.line}</span>
      </span>
      <AvatarStack people={card.participants.map((p) => ({ id: p.userId, name: p.name, avatar: p.avatar }))} size="xs" max={4} />
    </div>
  );
}
