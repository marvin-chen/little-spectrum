import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { AutoRefresh } from "@/components/session/AutoRefresh";
import { EarlyRevealButton } from "@/components/session/EarlyRevealButton";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { CompactHeader } from "@/components/ui/PageTitle";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES } from "@/lib/colors";
import type { SessionView } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";

export function SessionFrame({
  gardenId,
  session,
  userId,
  children,
}: {
  gardenId: string;
  session: SessionView;
  userId: string;
  children: ReactNode;
}) {
  const game = GAMES[session.game];
  const colors = COLOR_CLASSES[game.color];
  const active = session.status === "active";
  return (
    <div className="-mt-[max(0.75rem,var(--safe-top))] md:mt-0">
      <AutoRefresh enabled={active} />
      <CompactHeader
        leading={
          <Link href={`/g/${gardenId}`} className="pressable flex h-11 items-center gap-0.5 rounded-capsule pr-3 pl-1 text-callout font-semibold text-ink-2 hover:bg-fill">
            <ChevronLeft className="size-5" aria-hidden />
            Home
          </Link>
        }
        title={
          <span className="inline-flex items-center gap-2">
            <span className={cn("size-2.5 rounded-full", colors.bg)} aria-hidden />
            {game.name}
          </span>
        }
        trailing={
          active && session.isCreator ? (
            <EarlyRevealButton gardenId={gardenId} sessionId={session.id} check={session.earlyReveal_} game={session.game} />
          ) : null
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <ul className="flex items-center" aria-label="Players">
          {session.participants.map((p, i) => (
            <li key={p.userId} className={i > 0 ? "-ml-2" : undefined}>
              <Avatar avatar={p.avatar} name={p.userId === userId ? `${p.name} (you)` : p.name} size="sm" ring />
            </li>
          ))}
        </ul>
        <Badge tone={active ? (session.turn.needsYou ? game.color : "neutral") : "green"}>{session.turn.line}</Badge>
        {session.earlyReveal ? <Badge>Revealed early</Badge> : null}
      </div>
      {children}
    </div>
  );
}
