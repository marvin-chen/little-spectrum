import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { GameMotif } from "@/components/games/motifs/GameMotif";
import { EarlyRevealButton } from "@/components/session/EarlyRevealButton";
import type { SessionView } from "@/lib/games/sessionView";
import { GAMES } from "@/lib/games";

// Route chrome only. GamePlay owns the shared interaction and support layout.
export function SessionFrame({
  gardenId,
  session,
  children,
}: {
  gardenId: string;
  session: SessionView;
  children: ReactNode;
}) {
  const game = GAMES[session.game];
  const active = session.status === "active";

  return (
    <div className="-mt-[max(0.5rem,var(--safe-top))] md:mt-0">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, var(--color-${game.color}-soft) 85%, white) 0%, rgba(245,241,234,0) 100%)`,
        }}
      />
      <header className="sticky top-0 z-20 -mx-4 flex h-[60px] items-center gap-2 px-3 pt-[var(--safe-top)] md:-mx-8 md:px-6">
        <Link
          href={`/g/${gardenId}`}
          aria-label="Back to home"
          transitionTypes={["nav-back"]}
          className="glass pressable flex size-10 items-center justify-center rounded-capsule text-ink"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-2 text-headline font-semibold text-ink">
          <ViewTransition name={`session-${session.id}`} share="morph" default="none">
            <GameMotif game={session.game} size={24} />
          </ViewTransition>
          <span className="truncate">{game.name}</span>
        </div>
        <div className="flex w-10 justify-end sm:w-auto">
          {active && session.isCreator ? (
            <EarlyRevealButton
              gardenId={gardenId}
              sessionId={session.id}
              check={session.earlyReveal_}
              game={session.game}
            />
          ) : null}
        </div>
      </header>

      {children}
    </div>
  );
}
