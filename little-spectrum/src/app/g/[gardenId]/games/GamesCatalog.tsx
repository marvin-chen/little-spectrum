"use client";

import { useState, useTransition } from "react";
import { Check, ChevronRight, Users } from "lucide-react";
import { GameMotif, GameStageArt } from "@/components/games/motifs/GameMotif";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Group, SectionLabel } from "@/components/ui/Card";
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
  featured: GameKey;
};

export function GamesCatalog({ gardenId, currentUserId, members, availability, inviteUrl, initialGame, featured }: Props) {
  const [filter, setFilter] = useState<ColorKey | "all">("all");
  const [selected, setSelected] = useState<GameKey | null>(initialGame && isGameKey(initialGame) && availability[initialGame] ? initialGame : null);
  const canPlay = members.length >= 2;
  const visible = GAME_KEYS.filter((k) => filter === "all" || GAMES[k].color === filter);
  const showFeatured = filter === "all" || GAMES[featured].color === filter;
  const rest = visible.filter((k) => !(showFeatured && k === featured));
  const featuredDef = GAMES[featured];

  return (
    <div className="flex flex-col gap-6">
      {!canPlay && inviteUrl ? (
        <div className="anim-rise rounded-group bg-surface p-5 shadow-card ring-1 ring-line">
          <p className="text-headline font-semibold">Invite a friend to unlock games</p>
          <p className="mt-1 mb-3 text-footnote text-ink-2">Every game needs at least two people.</p>
          <p className="mb-3 break-all rounded-row bg-fill px-3 py-2 text-footnote text-ink-2 select-all">{inviteUrl}</p>
          <ShareButton url={inviteUrl} variant="tinted" accent="green" full />
        </div>
      ) : null}

      <div role="group" aria-label="Filter by color" className="hide-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:overflow-visible md:px-0">
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
          className={cn("pressable flex h-9 shrink-0 items-center rounded-capsule px-3.5 text-footnote font-semibold", filter === "all" ? "bg-ink text-canvas" : "glass text-ink-2")}
        >
          All colors
        </button>
        {COLOR_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className={cn("pressable flex h-9 shrink-0 items-center gap-1.5 rounded-capsule pr-3.5 pl-2.5 text-footnote font-semibold", filter === key ? `${COLOR_CLASSES[key].soft} ${COLOR_CLASSES[key].ink}` : "glass text-ink-2")}
          >
            <span className={cn("size-2.5 rounded-full", COLOR_CLASSES[key].bg)} aria-hidden />
            {COLOR_NAMES[key]}
          </button>
        ))}
      </div>

      {showFeatured ? (
        <section>
          <SectionLabel muted>Tonight&apos;s pick</SectionLabel>
          <button
            type="button"
            onClick={() => setSelected(featured)}
            className={cn("pressable anim-rise relative block w-full overflow-hidden rounded-group text-left shadow-card ring-1 ring-line", COLOR_CLASSES[featuredDef.color].soft)}
          >
            <GameStageArt game={featured} className="pointer-events-none absolute -top-2 right-0 h-32 w-auto opacity-90" />
            <span className="relative flex flex-col gap-4 p-5">
              <GameMotif game={featured} size={72} />
              <span>
                <span className="block font-display text-title-2 font-bold text-ink">{featuredDef.name}</span>
                <span className={cn("block text-callout font-semibold", COLOR_CLASSES[featuredDef.color].ink)}>{featuredDef.descriptor}</span>
                <span className="mt-1.5 block max-w-md text-callout text-ink-2">{featuredDef.blurb}</span>
              </span>
              <span className="flex items-center gap-2 text-footnote font-semibold text-ink-2">
                <Users className="size-4" aria-hidden />
                {featuredDef.kind === "clue" ? "2 to 8 players, you give the clue" : "2 to 8 players"}
                <ChevronRight className="ml-auto size-5 text-ink-3/70" aria-hidden />
              </span>
            </span>
          </button>
        </section>
      ) : null}

      {rest.length > 0 ? (
        <section>
          <SectionLabel muted>{showFeatured ? "More games" : "Games"}</SectionLabel>
          <Group>
            {rest.map((key, i) => {
              const game = GAMES[key];
              return (
                <button
                  key={key}
                  type="button"
                  disabled={!availability[key]}
                  onClick={() => setSelected(key)}
                  className="pressable anim-rise flex min-h-[72px] w-full items-center gap-3.5 px-4 py-3 text-left not-last:border-b not-last:border-line hover:bg-fill disabled:opacity-60"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <GameMotif game={key} size={52} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-headline font-semibold text-ink">{game.name}</span>
                    <span className="block truncate text-footnote text-ink-2">{game.descriptor}</span>
                    <span className="mt-0.5 block truncate text-caption text-ink-3">{game.kind === "clue" ? "Clue game" : "Everyone answers"} · 2 to 8</span>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-ink-3/70" aria-hidden />
                </button>
              );
            })}
          </Group>
        </section>
      ) : null}

      {selected ? <StartSheet game={selected} gardenId={gardenId} currentUserId={currentUserId} members={members} canPlay={canPlay} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

function StartSheet({ game, gardenId, currentUserId, members, canPlay, onClose }: { game: GameKey; gardenId: string; currentUserId: string; members: Member[]; canPlay: boolean; onClose: () => void }) {
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
      <div className="mb-4 flex items-start gap-3">
        <GameMotif game={game} size={56} />
        <ol className="flex flex-col gap-1.5 pt-0.5">
          {def.howTo.map((step, i) => (
            <li key={step} className="flex gap-2 text-callout text-ink-2">
              <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-caption font-bold", COLOR_CLASSES[def.color].soft, COLOR_CLASSES[def.color].ink)}>{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
      {def.kind === "clue" ? <p className="mb-4 rounded-row bg-fill px-3 py-2 text-footnote text-ink-2">You start it, so you give the clue this round.</p> : null}

      <div className="mb-2 flex items-center justify-between px-1">
        <p className="text-footnote font-semibold text-ink-2">Who plays</p>
        <button type="button" onClick={() => setPicked(new Set(members.map((m) => m.userId)))} disabled={everyone} className="pressable h-8 rounded-capsule px-2 text-footnote font-semibold text-tint hover:bg-fill disabled:opacity-50">
          Everyone
        </button>
      </div>
      <ul className="overflow-hidden rounded-group bg-surface ring-1 ring-line">
        {members.map((m) => {
          const on = picked.has(m.userId);
          const isMe = m.userId === currentUserId;
          return (
            <li key={m.userId} className="not-last:border-b not-last:border-line">
              <button type="button" role="checkbox" aria-checked={on} disabled={isMe} onClick={() => toggle(m.userId)} className="pressable flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left hover:bg-fill disabled:opacity-100">
                <Avatar avatar={m.avatar} name={m.name} size="sm" />
                <span className="flex-1 truncate text-body">
                  {m.name}
                  {isMe ? <span className="text-ink-3"> · You</span> : null}
                </span>
                <span className={cn("flex size-6 items-center justify-center rounded-full ring-1 transition-colors", on ? "bg-tint text-white ring-tint" : "bg-surface ring-line-strong")} aria-hidden>
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
