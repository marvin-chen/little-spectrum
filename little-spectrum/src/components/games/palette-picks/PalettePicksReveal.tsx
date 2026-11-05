import { Avatar } from "@/components/ui/Avatar";
import { CountUp } from "@/components/ui/CountUp";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SessionView } from "@/lib/games/sessionView";
import { joinNames } from "@/lib/games/engine";
import type { PalettePicksResult } from "@/lib/games/palettePicks";

type Props = {
  session: Pick<SessionView, "participants">;
  result: PalettePicksResult;
  items: string[];
  userId: string;
  compact?: boolean;
};

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th"];

export function PalettePicksReveal({ session, result, items, userId, compact = false }: Props) {
  const nameOf = (id: string) => (id === userId ? "You" : session.participants.find((p) => p.userId === id)?.name ?? "Someone");
  const avatarOf = (id: string) => session.participants.find((p) => p.userId === id)?.avatar ?? "sun:amber";
  const favorites = new Set(result.sharedFavorites);
  const splits = new Set(result.biggestDisagreements);
  const showPairs = result.pairs.length > 1 && result.mostSimilarPairs.length > 0;
  const pad = compact ? "p-4" : "p-5";

  return (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      <Card className={pad}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Overall similarity</p>
          {result.overallSimilarity !== null ? (
            <p className={cn("font-display font-bold text-amber-ink tabular-nums", compact ? "text-title-2" : "text-title-1")}>
              <CountUp value={result.overallSimilarity} />
            </p>
          ) : null}
        </div>
        {result.overallSimilarity === null ? (
          <p className="mt-1 text-callout text-ink-2">Not enough rankings to compare. One is a taste, two is a conversation.</p>
        ) : null}
        {showPairs ? (
          <div className={cn("border-t border-line", compact ? "mt-3 pt-3" : "mt-4 pt-4")}>
            <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">
              {result.mostSimilarPairs.length > 1 ? "Most in sync (tied)" : "Most in sync"}
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {result.mostSimilarPairs.map((pair) => (
                <li key={`${pair.a}-${pair.b}`} className="flex items-center gap-3">
                  <span className="inline-flex items-center">
                    <Avatar avatar={avatarOf(pair.a)} name={nameOf(pair.a)} size="sm" ring />
                    <Avatar avatar={avatarOf(pair.b)} name={nameOf(pair.b)} size="sm" ring className="-ml-2" />
                  </span>
                  <span className="flex-1 text-body">{joinNames([nameOf(pair.a), nameOf(pair.b)])}</span>
                  <span className="text-body font-semibold text-amber-ink tabular-nums">{pair.similarity}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {result.missing.length > 0 ? (
          <ul className={cn("border-t border-line", compact ? "mt-3 pt-3" : "mt-4 pt-4")}>
            {result.missing.map((id) => (
              <li key={id} className="flex items-center gap-3 py-1">
                <Avatar avatar={avatarOf(id)} name={nameOf(id)} size="sm" />
                <span className="flex-1 text-body text-ink-2">{nameOf(id)}</span>
                <Badge>Didn&apos;t play this round</Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <Card className={pad}>
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Group ranking</p>
        <ol className="mt-2 divide-y divide-line">
          {result.consensusOrder.map((item, position) => {
            const stats = result.averages.find((a) => a.item === item);
            return (
              <li key={item} className={cn("flex gap-3", compact ? "py-2.5" : "py-3")}>
                <span
                  className={cn(
                    "flex shrink-0 items-center justify-center rounded-full bg-amber font-bold text-white tabular-nums",
                    compact ? "size-6 text-caption" : "size-7 text-footnote",
                  )}
                  aria-hidden
                >
                  {position + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="sr-only">{ORDINALS[position]}</span>
                    <span className="text-body font-semibold">{items[item]}</span>
                    {stats ? <span className="text-footnote text-ink-3 tabular-nums">avg {stats.averageRank.toFixed(1)}</span> : null}
                    {favorites.has(item) ? <Badge tone="amber">Shared favorite</Badge> : null}
                    {splits.has(item) ? <Badge>Biggest split</Badge> : null}
                  </div>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {result.rankings.map((ranking) => {
                      const rank = ranking.order.indexOf(item) + 1;
                      const mine = ranking.userId === userId;
                      return (
                        <li
                          key={ranking.userId}
                          className={cn(
                            "inline-flex h-6 items-center gap-1 rounded-capsule pr-2 text-caption font-semibold tabular-nums",
                            mine ? "bg-amber-soft text-amber-ink" : "bg-fill text-ink-2",
                          )}
                          title={`${nameOf(ranking.userId)} put it ${ORDINALS[rank - 1]}`}
                        >
                          <Avatar avatar={avatarOf(ranking.userId)} name={nameOf(ranking.userId)} size="xs" />
                          <span aria-hidden>{rank}</span>
                          <span className="sr-only">{ORDINALS[rank - 1]}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </li>
            );
          })}
        </ol>
      </Card>
    </div>
  );
}
