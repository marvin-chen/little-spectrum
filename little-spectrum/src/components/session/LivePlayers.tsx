"use client";

import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import { useLiveChannel } from "./useLiveChannel";

type Player = { userId: string; name: string; avatar: string };

type Props = {
  sessionId: string;
  active: boolean;
  userId: string;
  userName: string;
  participants: Player[];
  submitted: string[];
};

// Avatar row with submission state and a live "here now" ring, plus instant refresh when the session changes.
export function LivePlayers({ sessionId, active, userId, userName, participants, submitted }: Props) {
  const { online } = useLiveChannel({
    channel: `session:${sessionId}`,
    table: "sessions",
    filter: `id=eq.${sessionId}`,
    presence: { userId, name: userName },
    fallbackMs: active ? 4000 : 30000,
  });
  const done = new Set(submitted);
  return (
    <ul className="flex items-center gap-2" aria-label="Players">
      {participants.map((p) => {
        const here = online.has(p.userId) && p.userId !== userId;
        const isDone = done.has(p.userId);
        const label = [p.userId === userId ? `${p.name} (you)` : p.name, isDone ? "in" : active ? "pending" : null, here ? "here now" : null].filter(Boolean).join(", ");
        return (
          <li key={p.userId} className="relative">
            <Avatar avatar={p.avatar} name={label} size="sm" ring className={cn("transition-shadow", here && "ring-2 ring-green shadow-[0_0_0_4px_rgba(79,179,122,0.25)]")} />
            {active ? <span aria-hidden className={cn("absolute -right-0.5 -bottom-0.5 size-3 rounded-full ring-2 ring-canvas", isDone ? "bg-green" : "bg-ink/20")} /> : null}
          </li>
        );
      })}
      {[...online].filter((id) => id !== userId && participants.some((p) => p.userId === id)).length > 0 ? (
        <li className="ml-1 text-caption font-semibold text-green-ink">here now</li>
      ) : null}
    </ul>
  );
}
