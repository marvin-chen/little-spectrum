"use client";

import { useState, useTransition } from "react";
import { Check, ChevronRight, Users } from "lucide-react";
import { GameIcon } from "@/components/games/GameIcon";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { ShareButton } from "@/components/ui/ShareButton";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, COLOR_KEYS, COLOR_NAMES, type ColorKey } from "@/lib/colors";
import { GAMES, GAME_KEYS, isGameKey, type GameKey } from "@/lib/games";
import { startSessionAction } from "./actions";

type Member = { userId: string; name: string; avatar: string };

type Props = {
  gardenId: string;
  currentUserId: string;
  members: Member[];
  availability: Record<string, boolean>;
  inviteUrl: string | null;
  initialGame: string | null;
};

export function GamesCatalog({ gardenId, currentUserId, members, availability, inviteUrl, initialGame }: Props) {
  const [filter, setFilter] = useState<ColorKey | "all">("all");
  const [selected, setSelected] = useState<GameKey | null>(
    initialGame && isGameKey(initialGame) && availability[initialGame] ? initialGame : null,
  );
  const canPlay = members.length >= 2;
  const games = GAME_KEYS.filter((k) => filter === "all" || GAMES[k].color === filter);

  return (
    <div className="flex flex-col gap-5">
      {!canPlay && inviteUrl ? (
        <Card className="p-4">
          <p className="text-body font-semibold">Invite a friend to unlock games</p>
          <p className="mt-1 mb-3 text-footnote text-ink-2">Every game needs at least two people. Share the link and you are set.</p>
          <ShareButton url={inviteUrl} title="Join my garden on Little Spectrum" variant="tinted" accent="green" full />
        </Card>
      ) : null}

      <div role="group" aria-label="Filter by color" className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
          className={cn(
            "pressable flex h-10 shrink-0 items-center gap-2 rounded-capsule px-4 text-callout font-semibold ring-1",
            filter === "all" ? "bg-ink text-ivory ring-ink" : "bg-surface text-ink-2 ring-line",
          )}
        >
          All colors
        </button>
        {COLOR_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={cn(
              "pressable flex h-10 shrink-0 items-center gap-2 rounded-capsule px-4 text-callout font-semibold ring-1",
              filter === key ? `${COLOR_CLASSES[key].soft} ${COLOR_CLASSES[key].ink} ring-current` : "bg-surface text-ink-2 ring-line",
            )}
          >
            <span className={cn("size-3 rounded-full", COLOR_CLASSES[key].bg)} aria-hidden />
            {COLOR_NAMES[key]}
          </button>
        ))}
      </div>

      <ul className="grid gap-3">
        {games.map((key) => {
          const game = GAMES[key];
          const available = availability[key];
          return (
            <li key={key}>
              <button
                type="button"
                disabled={!available}
                onClick={() => setSelected(key)}
                className="pressable w-full rounded-card bg-surface p-4 text-left shadow-card ring-1 ring-line hover:bg-surface-2 disabled:opacity-60"
              >
                <span className="flex items-start gap-3">
                  <GameIcon game={key} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-title-3 font-semibold text-ink">{game.name}</span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-footnote font-semibold text-ink-2">{game.descriptor}</span>
                      <Badge tone={game.color}>{game.colorLabel}</Badge>
                    </span>
                    <span className="mt-1 block text-footnote text-ink-3">{game.blurb}</span>
                  </span>
                  <ChevronRight className="mt-3 size-5 shrink-0 text-ink-3" aria-hidden />
                </span>
                {!available ? <span className="mt-2 block text-caption font-semibold text-ink-3">Coming soon</span> : null}
              </button>
            </li>
          );
        })}
      </ul>

      {selected ? (
        <StartSheet
          game={selected}
          gardenId={gardenId}
          currentUserId={currentUserId}
          members={members}
          canPlay={canPlay}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}

function StartSheet({
  game,
  gardenId,
  currentUserId,
  members,
  canPlay,
  onClose,
}: {
  game: GameKey;
  gardenId: string;
  currentUserId: string;
  members: Member[];
  canPlay: boolean;
  onClose: () => void;
}) {
  const def = GAMES[game];
  const [picked, setPicked] = useState<Set<string>>(() => new Set(members.map((m) => m.userId)));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const everyone = picked.size === members.length;

  function toggle(id: string) {
    if (id === currentUserId) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function start() {
    setError(null);
    startTransition(async () => {
      const result = await startSessionAction(gardenId, game, [...picked]);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={def.name}
      description={def.descriptor}
      footer={
        <div className="flex flex-col gap-2">
          {error ? (
            <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
              {error}
            </p>
          ) : null}
          <Button size="lg" full accent={def.color} onClick={start} loading={pending} disabled={!canPlay || picked.size < 2}>
            {canPlay ? `Start with ${picked.size} ${picked.size === 1 ? "person" : "people"}` : "Invite a friend first"}
          </Button>
        </div>
      }
    >
      <ol className="mb-5 flex flex-col gap-2">
        {def.howTo.map((step, i) => (
          <li key={step} className="flex gap-3 text-callout text-ink-2">
            <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full text-caption font-bold", COLOR_CLASSES[def.color].soft, COLOR_CLASSES[def.color].ink)}>
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
      {def.kind === "clue" ? (
        <p className="mb-4 rounded-row bg-fill px-3 py-2 text-footnote text-ink-2">You start it, so you give the clue this round.</p>
      ) : null}

      <div className="mb-2 flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-footnote font-semibold text-ink-2">
          <Users className="size-4" aria-hidden /> Who plays
        </p>
        <button
          type="button"
          onClick={() => setPicked(new Set(members.map((m) => m.userId)))}
          disabled={everyone}
          className="pressable h-8 rounded-capsule px-3 text-footnote font-semibold text-blue-ink hover:bg-fill disabled:opacity-50"
        >
          Everyone
        </button>
      </div>
      <ul className="overflow-hidden rounded-card bg-surface ring-1 ring-line">
        {members.map((m) => {
          const on = picked.has(m.userId);
          const isMe = m.userId === currentUserId;
          return (
            <li key={m.userId} className="not-last:border-b not-last:border-line">
              <button
                type="button"
                role="checkbox"
                aria-checked={on}
                disabled={isMe}
                onClick={() => toggle(m.userId)}
                className="pressable flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left hover:bg-fill disabled:opacity-100"
              >
                <Avatar avatar={m.avatar} name={m.name} size="sm" />
                <span className="flex-1 text-body">
                  {m.name}
                  {isMe ? <span className="text-ink-3"> · You</span> : null}
                </span>
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full ring-1",
                    on ? "bg-ink text-ivory ring-ink" : "bg-surface ring-line-strong",
                  )}
                  aria-hidden
                >
                  {on ? <Check className="size-4" strokeWidth={3} /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}
