import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SessionView } from "@/lib/data/sessions";
import type { HueKnewResult } from "@/lib/games/hueKnew";
import { SpectrumScale, type ScaleMarker } from "./SpectrumScale";

type Props = {
  session: Pick<SessionView, "participants" | "clueGiverId" | "createdBy">;
  result: HueKnewResult;
  left: string;
  right: string;
  userId: string;
  compact?: boolean;
};

export function HueKnewReveal({ session, result, left, right, userId, compact }: Props) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const avatarOf = (id: string) => session.participants.find((p) => p.userId === id)?.avatar ?? "sun:amber";
  const clueGiverName = nameOf(session.clueGiverId ?? session.createdBy);
  const markers: ScaleMarker[] = [
    { id: "target", position: result.target, kind: "target", label: `Target ${result.target}` },
    ...result.guesses.map((g) => ({
      id: g.userId,
      position: g.guess,
      kind: g.userId === userId ? ("mine" as const) : ("guess" as const),
      label: String(g.guess),
      avatar: avatarOf(g.userId),
      name: nameOf(g.userId),
    })),
  ];
  return (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      <Card className={compact ? "p-4" : "p-5"}>
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{clueGiverName}&apos;s clue</p>
        <p className={cn("mt-1 font-display font-bold", compact ? "text-title-3" : "text-title-2")}>&ldquo;{result.clue}&rdquo;</p>
        <div className={compact ? "mt-4" : "mt-6"}>
          <SpectrumScale left={left} right={right} markers={markers} />
        </div>
      </Card>
      <Card className={compact ? "p-4" : "p-5"}>
        <div className="flex items-baseline justify-between">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Shared score</p>
          <p className={cn("font-display font-bold text-coral-ink tabular-nums", compact ? "text-title-2" : "text-title-1")}>{result.shared ?? "–"}</p>
        </div>
        <ul className="mt-2 divide-y divide-line">
          {result.guesses
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((g) => (
              <li key={g.userId} className="flex items-center gap-3 py-2.5">
                <Avatar avatar={avatarOf(g.userId)} name={nameOf(g.userId)} size="sm" />
                <span className="flex-1 text-body">
                  {g.userId === userId ? "You" : nameOf(g.userId)}
                  <span className="text-ink-3"> guessed {g.guess}</span>
                </span>
                <span className="text-body font-semibold tabular-nums">{g.score}</span>
              </li>
            ))}
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
