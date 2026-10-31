import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { GameMotif, GameStageArt } from "@/components/games/motifs/GameMotif";
import { EarlyRevealButton } from "@/components/session/EarlyRevealButton";
import { LivePlayers } from "@/components/session/LivePlayers";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES } from "@/lib/colors";
import type { SessionView } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";

// Shared chrome for every game: glass header, a tinted stage with the players and status, then the game.
export function SessionFrame({ gardenId, session, userId, children }: { gardenId: string; session: SessionView; userId: string; children: ReactNode }) {
  const game = GAMES[session.game];
  const colors = COLOR_CLASSES[game.color];
  const active = session.status === "active";
  const submitted = new Set<string>();
  const view = session.view as { submitted?: string[]; guessers?: Array<{ userId: string; submitted: boolean }>; clue?: string | null; clueGiverId?: string } | null;
  for (const id of view?.submitted ?? []) submitted.add(id);
  for (const g of view?.guessers ?? []) if (g.submitted) submitted.add(g.userId);
  if (view?.clue && view.clueGiverId) submitted.add(view.clueGiverId);

  return (
    <div className="-mt-[max(0.5rem,var(--safe-top))] md:mt-0">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80" style={{ background: `linear-gradient(180deg, color-mix(in srgb, var(--color-${game.color}-soft) 85%, white) 0%, rgba(245,241,234,0) 100%)` }} />
      <header className="sticky top-0 z-20 -mx-4 flex h-[60px] items-center gap-2 px-3 pt-[var(--safe-top)] md:-mx-8 md:px-6">
        <Link href={`/g/${gardenId}`} aria-label="Back to home" className="glass pressable flex size-10 items-center justify-center rounded-capsule text-ink">
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-headline font-semibold text-ink">
          <GameMotif game={session.game} size={24} />
          <span className="truncate">{game.name}</span>
        </div>
        <div className="flex w-10 justify-end sm:w-auto">{active && session.isCreator ? <EarlyRevealButton gardenId={gardenId} sessionId={session.id} check={session.earlyReveal_} game={session.game} /> : null}</div>
      </header>

      <section className="relative mb-4 overflow-hidden rounded-group">
        <GameStageArt game={session.game} className={cn("pointer-events-none absolute -top-3 -right-6 h-28 w-auto", session.participants.length > 5 && "hidden")} />
        <div className="relative flex flex-col gap-3 px-1 pt-2 pb-1">
          <LivePlayers
            sessionId={session.id}
            active={active}
            userId={userId}
            userName={session.participants.find((p) => p.userId === userId)?.name ?? "You"}
            participants={session.participants}
            submitted={[...submitted]}
          />
          <p className={cn("text-callout font-semibold", active ? (session.turn.needsYou ? colors.ink : "text-ink-2") : "text-green-ink")}>
            {session.turn.line}
            {session.earlyReveal ? <span className="font-normal text-ink-3"> · Revealed early</span> : null}
          </p>
        </div>
      </section>
      {children}
    </div>
  );
}
