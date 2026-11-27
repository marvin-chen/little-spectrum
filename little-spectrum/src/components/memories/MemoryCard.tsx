import { GameReveal } from "@/components/games/GameReveal";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { GameIcon } from "@/components/games/GameIcon";
import { AvatarStack } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatRevealedDate, type Memory } from "@/lib/data/memories";
import type { SessionView } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";
import type { ColorQuestView } from "@/lib/games/colorQuest";
import type { HueClueView } from "@/lib/games/hueClue";
import type { HueKnewView } from "@/lib/games/hueKnew";
import type { PalettePicksView } from "@/lib/games/palettePicks";
import type { SameWavelengthView } from "@/lib/games/sameWavelength";
import type { TrueColorsView } from "@/lib/games/trueColors";
import { MemoryFooter } from "./MemoryFooter";

const WAVELENGTH_OUTCOME = { all: "Everyone matched", some: "Some matched", none: "No match" } as const;

// Score badge text, or null for games without a headline number.
function scoreFor(session: SessionView): string | null {
  switch (session.game) {
    case "hue-knew":
    case "hue-clue": {
      const shared = (session.view as HueKnewView | HueClueView).result?.shared ?? null;
      return shared === null ? null : `Score ${shared}`;
    }
    case "true-colors": {
      const r = (session.view as TrueColorsView).result;
      return r && r.scorable > 0 ? `${r.correct} of ${r.scorable}` : null;
    }
    case "same-wavelength": {
      const r = (session.view as SameWavelengthView).result;
      return r ? WAVELENGTH_OUTCOME[r.outcome] : null;
    }
    case "palette-picks": {
      const similarity = (session.view as PalettePicksView).result?.overallSimilarity ?? null;
      return similarity === null ? null : `${similarity} alike`;
    }
    case "color-quest":
      return null;
  }
}

// One line of context for games whose compact reveal does not repeat the prompt.
function contextFor(session: SessionView): string | null {
  switch (session.game) {
    case "same-wavelength":
      return (session.view as SameWavelengthView).category;
    case "palette-picks":
      return (session.view as PalettePicksView).title;
    case "color-quest":
      return (session.view as ColorQuestView).prompt;
    default:
      return null;
  }
}

export function MemoryCard({ gardenId, memory, userId }: { gardenId: string; memory: Memory; userId: string }) {
  const { session } = memory;
  const game = GAMES[session.game];
  const date = formatRevealedDate(session.revealedAt ?? session.createdAt);
  const score = scoreFor(session);
  const context = contextFor(session);

  return (
    <article aria-label={`${game.name}, ${date}`} className="flex flex-col gap-3">
      <Link
        href={`/g/${gardenId}/play/${session.id}`}
        className="pressable -mx-2 flex min-h-14 items-center gap-3 rounded-row px-2 py-1.5 hover:bg-fill"
      >
        <GameIcon game={session.game} />
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="text-body font-semibold text-ink">{game.name}</h2>
            {score ? <Badge tone={game.color}>{score}</Badge> : null}
            {session.earlyReveal ? <Badge>Revealed early</Badge> : null}
          </span>
          <span className="block truncate text-footnote text-ink-2">
            {date}
            {context ? <span className="text-ink-3"> · {context}</span> : null}
          </span>
        </span>
        <AvatarStack
          people={session.participants.map((p) => ({ id: p.userId, name: p.name, avatar: p.avatar }))}
          size="xs"
          max={4}
        />
        <ChevronRight className="size-5 shrink-0 text-ink-3" aria-hidden />
      </Link>
      <GameReveal session={session} userId={userId} compact />
      <Card className="p-4">
        <MemoryFooter
          gardenId={gardenId}
          sessionId={session.id}
          userId={userId}
          participants={session.participants}
          reactions={memory.reactions}
          comments={memory.comments}
        />
      </Card>
    </article>
  );
}
