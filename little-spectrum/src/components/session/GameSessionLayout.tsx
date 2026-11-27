import { useId, type ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { LivePlayers, SessionPlayers } from "./LivePlayers";
import { GAMES } from "@/lib/games";
import { COLOR_CLASSES } from "@/lib/colors";
import { cn } from "@/lib/cn";
import type { SessionView } from "@/lib/games/sessionView";

/** Shared by every production game and isolated preview. Game screens own the interaction. */
export function GameSessionLayout({
  session,
  userId,
  live,
  children,
}: {
  session: SessionView;
  userId: string;
  live: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const game = GAMES[session.game];
  const active = session.status === "active";
  // Read only the participant-safe projection, never raw submissions or secrets.
  const view = session.view as {
    submitted?: string[];
    guessers?: Array<{ userId: string; submitted: boolean }>;
    clue?: string | null;
    clueGiverId?: string;
  } | null;
  const submitted = new Set(view?.submitted ?? []);
  for (const guesser of view?.guessers ?? []) if (guesser.submitted) submitted.add(guesser.userId);
  if (view?.clue && view.clueGiverId) submitted.add(view.clueGiverId);
  const players = {
    active,
    userId,
    participants: session.participants,
    submitted: [...submitted],
  };
  return (
    <div className="@container" data-testid="game-session-layout">
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 @4xl:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)]">
        <div className="flex min-w-0 flex-col gap-4 [overflow-wrap:anywhere]">
          <p
            className={cn(
              "text-callout font-semibold",
              active ? (session.turn.needsYou ? COLOR_CLASSES[game.color].ink : "text-ink-2") : "text-green-ink",
            )}
          >
            {session.turn.line}
            {session.earlyReveal ? <span className="font-normal text-ink-2"> · Revealed early</span> : null}
          </p>
          <section aria-label="Game interaction" className="min-w-0">
            {children}
          </section>
        </div>
        <aside aria-label="Round guide" className="flex min-w-0 flex-col gap-4 [overflow-wrap:anywhere]">
          <Card className="p-5">
            <h2 id={`${id}-instructions`} className="text-title-3 font-semibold">
              How to play
            </h2>
            <ol
              aria-labelledby={`${id}-instructions`}
              className="mt-3 list-decimal space-y-2 pl-5 text-callout text-ink-2"
            >
              {game.howTo.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-title-3 font-semibold">This round</h2>
            {live ? (
              <LivePlayers
                {...players}
                sessionId={session.id}
                userName={session.participants.find((p) => p.userId === userId)?.name ?? "You"}
              />
            ) : (
              <SessionPlayers {...players} />
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
