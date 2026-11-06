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

// Live participant status and presence, plus instant refresh when the session changes.
export function LivePlayers({ sessionId, active, userId, userName, participants, submitted }: Props) {
  const { online } = useLiveChannel({
    channel: `session:${sessionId}`,
    table: "sessions",
    filter: `id=eq.${sessionId}`,
    presence: { userId, name: userName },
    fallbackMs: active ? 4000 : 30000,
  });
  return <SessionPlayers {...{ active, userId, participants, submitted, online }} />;
}

// Pure presentation is also used by previews, with no subscription or polling.
export function SessionPlayers({ active, userId, participants, submitted, online = new Set<string>() }: Pick<Props, "active" | "userId" | "participants" | "submitted"> & { online?: Set<string> }) {
  const done = new Set(submitted);
  return (
    <ul className="flex flex-col gap-3" aria-label="Players">
      {participants.map((p) => {
        const here = online.has(p.userId) && p.userId !== userId;
        const state = !active ? "Round finished" : done.has(p.userId) ? "Submitted" : "Pending";
        return (
          <li key={p.userId} className="flex min-w-0 items-center gap-3">
            <Avatar avatar={p.avatar} name={p.name} size="sm" ring />
            <div className="min-w-0 flex-1">
              <p className="text-callout font-semibold">{p.name}{p.userId === userId ? " (you)" : ""}</p>
              <p className={cn("text-footnote", state === "Submitted" ? "text-green-ink" : "text-ink-2")}>{state}{here ? " · Here now" : ""}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
