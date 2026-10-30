import { Avatar } from "@/components/ui/Avatar";
import { CountUp } from "@/components/ui/CountUp";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SessionView } from "@/lib/data/sessions";
import type { HueClueResult } from "@/lib/games/hueClue";
import { PALETTE } from "@/lib/games/hueCluePalette";
import { ColorGrid } from "./ColorGrid";

export function HueClueReveal({ session, result, userId, compact }: { session: SessionView; result: HueClueResult; userId: string; compact?: boolean }) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const avatarOf = (id: string) => session.participants.find((p) => p.userId === id)?.avatar ?? "sun:amber";
  const clueGiverName = nameOf(session.clueGiverId ?? session.createdBy);
  const target = PALETTE[result.target.row][result.target.col];
  return (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      <Card className={compact ? "p-4" : "p-5"}>
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{clueGiverName}&apos;s clue</p>
        <p className={cn("mt-1 font-display font-bold", compact ? "text-title-3" : "text-title-2")}>&ldquo;{result.clue}&rdquo;</p>
        <div className="mt-4">
          <ColorGrid
            label="Revealed color grid"
            selected={null}
            target={result.target}
            markers={result.guesses.map((g) => ({ userId: g.userId, col: g.col, row: g.row, avatar: avatarOf(g.userId), name: nameOf(g.userId), mine: g.userId === userId }))}
          />
        </div>
        <p className="mt-3 flex items-center gap-2 text-callout text-ink-2">
          <span className="size-5 rounded-[5px] ring-1 ring-line" style={{ backgroundColor: target.hex }} aria-hidden />
          <span>
            The target was <span className="font-semibold text-ink">{target.coord}</span>, {target.label.toLowerCase()}.
          </span>
        </p>
      </Card>
      <Card className={compact ? "p-4" : "p-5"}>
        <div className="flex items-baseline justify-between">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Shared score</p>
          <p className={cn("font-display font-bold text-violet-ink tabular-nums", compact ? "text-title-2" : "text-title-1")}>{result.shared === null ? "–" : <CountUp value={result.shared} />}</p>
        </div>
        <ul className="mt-2 divide-y divide-line">
          {result.guesses
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((g) => {
              const c = PALETTE[g.row][g.col];
              return (
                <li key={g.userId} className="flex items-center gap-3 py-2.5">
                  <Avatar avatar={avatarOf(g.userId)} name={nameOf(g.userId)} size="sm" />
                  <span className="min-w-0 flex-1 text-body">
                    {g.userId === userId ? "You" : nameOf(g.userId)}
                    <span className="text-ink-3">
                      {" "}
                      picked {c.coord}, {g.distance === 0 ? "spot on" : `${g.distance} away`}
                    </span>
                  </span>
                  <span className="size-5 shrink-0 rounded-[5px] ring-1 ring-line" style={{ backgroundColor: c.hex }} aria-hidden />
                  <span className="text-body font-semibold tabular-nums">{g.score}</span>
                </li>
              );
            })}
          {result.missing.map((id) => (
            <li key={id} className="flex items-center gap-3 py-2.5">
              <Avatar avatar={avatarOf(id)} name={nameOf(id)} size="sm" />
              <span className="flex-1 text-body text-ink-2">{id === userId ? "You" : nameOf(id)}</span>
              <Badge>Didn&apos;t play this round</Badge>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
