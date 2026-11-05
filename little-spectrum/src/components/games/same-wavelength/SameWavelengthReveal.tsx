import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SessionParticipant, SessionView } from "@/lib/games/sessionView";
import { joinNames } from "@/lib/games/engine";
import type { SameWavelengthResult, SameWavelengthRound } from "@/lib/games/sameWavelength";

type Props = {
  session: Pick<SessionView, "participants">;
  result: SameWavelengthResult;
  userId: string;
  compact?: boolean;
};

function nameFor(participants: SessionParticipant[], id: string, userId: string): string {
  if (id === userId) return "you";
  return participants.find((p) => p.userId === id)?.name ?? "Someone";
}

function avatarFor(participants: SessionParticipant[], id: string): string {
  return participants.find((p) => p.userId === id)?.avatar ?? "sun:amber";
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function WordTile({
  participants,
  userId,
  id,
  word,
  matched,
  compact,
}: {
  participants: SessionParticipant[];
  userId: string;
  id: string;
  word: string | null;
  matched: boolean;
  compact?: boolean;
}) {
  const name = participants.find((p) => p.userId === id)?.name ?? "Someone";
  return (
    <li
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-capsule py-1 pl-1 pr-3 font-semibold",
        compact ? "text-footnote" : "text-callout",
        word === null
          ? "border border-dashed border-line-strong text-ink-3"
          : matched
            ? "bg-blue-soft text-blue-ink ring-2 ring-blue"
            : "bg-fill text-ink",
      )}
    >
      <Avatar avatar={avatarFor(participants, id)} name={id === userId ? `${name} (you)` : name} size="xs" />
      <span className="truncate">{word ?? "Didn't play this round"}</span>
    </li>
  );
}

// Word tiles for one revealed attempt, matched groups first.
export function SameWavelengthRoundTiles({
  round,
  participants,
  userId,
  compact,
}: {
  round: SameWavelengthRound;
  participants: SessionParticipant[];
  userId: string;
  compact?: boolean;
}) {
  const wordOf = (id: string) => round.answers.find((a) => a.userId === id)?.word ?? null;
  const grouped = new Set(round.groups.flat());
  const solo = round.answers.filter((a) => !grouped.has(a.userId));
  return (
    <div className={cn("flex flex-col", compact ? "gap-2" : "gap-3")}>
      {round.groups.map((group) => (
        <div key={group.join("+")}>
          <p className="mb-1.5 text-caption font-semibold uppercase tracking-[0.06em] text-blue-ink">
            {round.allMatched ? "Everyone matched" : `Matched x${group.length}`}
          </p>
          <ul className="flex flex-wrap gap-2">
            {group.map((id) => (
              <WordTile key={id} participants={participants} userId={userId} id={id} word={wordOf(id)} matched compact={compact} />
            ))}
          </ul>
        </div>
      ))}
      {solo.length > 0 || round.missing.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {solo.map((a) => (
            <WordTile key={a.userId} participants={participants} userId={userId} id={a.userId} word={a.word} matched={false} compact={compact} />
          ))}
          {round.missing.map((id) => (
            <WordTile key={id} participants={participants} userId={userId} id={id} word={null} matched={false} compact={compact} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function SameWavelengthReveal({ session, result, userId, compact }: Props) {
  const participants = session.participants;
  const last = result.rounds[result.rounds.length - 1];
  const largest = last?.groups[0] ?? [];
  const others = last?.groups.slice(1) ?? [];
  const names = (ids: string[]) => capitalize(joinNames(ids.map((id) => nameFor(participants, id, userId))));

  let headline: ReactNode;
  if (result.outcome === "all") {
    headline = (
      <div
        className={cn(
          "anim-pop lit flex items-center gap-3 rounded-card bg-gradient-to-br from-blue to-blue-deep text-white shadow-card",
          compact ? "px-4 py-3" : "px-5 py-6",
        )}
      >
        <span className={cn("flex shrink-0 items-center justify-center rounded-full bg-white/20", compact ? "size-9" : "size-12")} aria-hidden>
          <Sparkles className={compact ? "size-5" : "size-6"} />
        </span>
        <div className="min-w-0">
          <p className={cn("font-display font-bold", compact ? "text-title-3" : "text-title-2")}>Everyone on the same wavelength!</p>
          {!compact ? (
            <p className="mt-1 text-callout text-white/85">
              {last.round === 1 ? "On the very first try. Suspicious, honestly." : `It took ${last.round} attempts, and it still counts.`}
            </p>
          ) : null}
        </div>
      </div>
    );
  } else if (result.outcome === "some") {
    headline = (
      <Card className={cn("bg-blue-soft/60", compact ? "px-4 py-3" : "p-5")}>
        <p className={cn("font-semibold text-blue-ink", compact ? "text-callout" : "text-title-3")}>
          A match! {names(largest)} were on the same wavelength.
        </p>
        {!compact && others.length > 0 ? (
          <p className="mt-1 text-callout text-ink-2">So were {joinNames(others.map((g) => names(g)))}.</p>
        ) : null}
      </Card>
    );
  } else {
    headline = (
      <Card className={compact ? "px-4 py-3" : "p-5"}>
        <p className={cn("font-semibold", compact ? "text-callout" : "text-title-3")}>No match this time.</p>
        <p className={cn("text-ink-2", compact ? "text-footnote" : "mt-1 text-callout")}>Still a good set of answers.</p>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col", compact ? "gap-3" : "gap-4")}>
      {headline}
      <Card className={cn("flex flex-col", compact ? "gap-4 px-4 py-3" : "gap-5 p-5")}>
        {result.rounds.map((round) => (
          <section key={round.round}>
            <div className="mb-2 flex items-baseline justify-between">
              <h3 className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Attempt {round.round}</h3>
              {round.groups.length === 0 ? <span className="text-caption text-ink-3">No matches</span> : null}
            </div>
            <SameWavelengthRoundTiles round={round} participants={participants} userId={userId} compact={compact} />
          </section>
        ))}
      </Card>
    </div>
  );
}
