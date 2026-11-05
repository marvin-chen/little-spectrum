"use client";

import { useRef, useState, useTransition, type PointerEvent as ReactPointerEvent } from "react";
import { ChevronDown, ChevronUp, GripVertical, Lock, RotateCcw, Sparkles } from "lucide-react";
import { playAgainAction, submitAction } from "@/app/g/[gardenId]/play/[sessionId]/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SessionView } from "@/lib/games/sessionView";
import { joinNames } from "@/lib/games/engine";
import type { PalettePicksView } from "@/lib/games/palettePicks";
import { PalettePicksReveal } from "./PalettePicksReveal";

type Props = { gardenId: string; session: SessionView; game: PalettePicksView; userId: string };

const ORDINALS = ["first", "second", "third", "fourth", "fifth"];

export function PalettePicksPlay({ gardenId, session, game, userId }: Props) {
  if (game.phase === "revealed" && game.result) {
    return (
      <div className="flex flex-col gap-4">
        <Card className="p-5">
          <PromptHeading title={game.title} prompt={game.prompt} />
        </Card>
        <PalettePicksReveal session={session} result={game.result} items={game.items} userId={userId} />
        <PlayAgain gardenId={gardenId} sessionId={session.id} />
      </div>
    );
  }

  if (game.phase === "waiting" && game.myOrder) {
    const waiting = session.participants.filter((p) => p.userId !== userId && !game.submitted.includes(p.userId)).map((p) => p.name);
    return (
      <Card className="p-5">
        <PromptHeading title={game.title} prompt={game.prompt} />
        <p className="mt-5 text-title-3 font-semibold">Your ranking is locked in</p>
        <ol className="mt-3 flex flex-col gap-2">
          {game.myOrder.map((item, position) => (
            <li key={item} className="flex items-center gap-3 rounded-row bg-fill px-3 py-2.5">
              <PositionNumber position={position} />
              <span className="text-body font-medium">{game.items[item]}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-callout text-ink-2">
          {waiting.length > 0
            ? `Waiting for ${joinNames(waiting)}. The reveal happens on its own once everyone is in.`
            : "Everyone is in. Revealing."}
        </p>
      </Card>
    );
  }

  return <RankPanel gardenId={gardenId} session={session} game={game} />;
}

function PromptHeading({ title, prompt }: { title: string; prompt: string }) {
  return (
    <>
      <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{title}</p>
      <p className="mt-1 font-display text-title-2 font-bold">{prompt}</p>
    </>
  );
}

function PositionNumber({ position }: { position: number }) {
  return (
    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber text-footnote font-bold text-white tabular-nums">
      <span aria-hidden>{position + 1}</span>
      <span className="sr-only">{ORDINALS[position]}</span>
    </span>
  );
}

function moveIndex(list: number[], from: number, to: number): number[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function RankPanel({ gardenId, session, game }: { gardenId: string; session: SessionView; game: PalettePicksView }) {
  const [order, setOrder] = useState<number[]>(() => game.items.map((_, index) => index));
  const [dragging, setDragging] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const listRef = useRef<HTMLOListElement>(null);
  const buttonRefs = useRef(new Map<string, HTMLButtonElement>());

  function move(item: number, delta: -1 | 1) {
    const from = order.indexOf(item);
    const to = from + delta;
    if (to < 0 || to >= order.length) return;
    setOrder(moveIndex(order, from, to));
    setAnnouncement(`${game.items[item]} is now ${ORDINALS[to]}.`);
    // The pressed arrow disables at the ends, so hand focus to its sibling.
    if (to === 0 || to === order.length - 1) {
      const sibling = `${item}:${delta === -1 ? "down" : "up"}`;
      requestAnimationFrame(() => buttonRefs.current.get(sibling)?.focus());
    }
  }

  function startDrag(event: ReactPointerEvent<HTMLElement>, item: number) {
    if (pending) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(item);
  }

  function drag(event: ReactPointerEvent<HTMLElement>) {
    if (dragging === null || !listRef.current) return;
    const from = order.indexOf(dragging);
    const rows = Array.from(listRef.current.children) as HTMLElement[];
    const others = rows.filter((_, index) => index !== from);
    const to = others.filter((row) => {
      const rect = row.getBoundingClientRect();
      return rect.top + rect.height / 2 < event.clientY;
    }).length;
    if (to !== from) setOrder(moveIndex(order, from, to));
  }

  function endDrag() {
    if (dragging === null) return;
    setAnnouncement(`${game.items[dragging]} is now ${ORDINALS[order.indexOf(dragging)]}.`);
    setDragging(null);
  }

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await submitAction(gardenId, session.id, { order });
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <PromptHeading title={game.title} prompt={game.prompt} />
        <p className="mt-2 text-callout text-ink-2">First place goes on top. Drag the grip or tap the arrows to shuffle things around.</p>
        <ol ref={listRef} className="mt-5 flex select-none flex-col gap-2" aria-label="Your ranking">
          {order.map((item, position) => {
            const name = game.items[item];
            const isDragging = dragging === item;
            return (
              <li
                key={item}
                className={cn(
                  "flex items-center gap-2 rounded-row py-1.5 pr-1 pl-3 transition-[background-color,box-shadow] duration-150",
                  isDragging ? "bg-amber-soft shadow-float ring-2 ring-amber" : "bg-fill",
                )}
              >
                <PositionNumber position={position} />
                <span className="min-w-0 flex-1 text-body font-medium">{name}</span>
                <button
                  type="button"
                  ref={(el) => {
                    if (el) buttonRefs.current.set(`${item}:up`, el);
                    else buttonRefs.current.delete(`${item}:up`);
                  }}
                  aria-label={`Move ${name} up`}
                  disabled={position === 0 || pending}
                  onClick={() => move(item, -1)}
                  className="pressable flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-fill-2 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronUp className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  ref={(el) => {
                    if (el) buttonRefs.current.set(`${item}:down`, el);
                    else buttonRefs.current.delete(`${item}:down`);
                  }}
                  aria-label={`Move ${name} down`}
                  disabled={position === order.length - 1 || pending}
                  onClick={() => move(item, 1)}
                  className="pressable flex size-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-fill-2 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronDown className="size-5" aria-hidden />
                </button>
                <span
                  aria-hidden
                  onPointerDown={(event) => startDrag(event, item)}
                  onPointerMove={drag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  style={{ touchAction: "none" }}
                  className={cn(
                    "flex size-11 shrink-0 items-center justify-center rounded-full text-ink-3",
                    isDragging ? "cursor-grabbing text-amber-ink" : "cursor-grab",
                  )}
                >
                  <GripVertical className="size-5" />
                </span>
              </li>
            );
          })}
        </ol>
        <p aria-live="polite" className="sr-only">
          {announcement}
        </p>
        <p className="mt-4 text-footnote text-ink-3">Confirmed rankings cannot be edited.</p>
        {error ? (
          <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
            {error}
          </p>
        ) : null}
        <Button className="mt-4" size="lg" full accent="amber" onClick={confirm} loading={pending} icon={<Lock className="size-4" aria-hidden />}>
          Confirm ranking
        </Button>
      </Card>
    </div>
  );
}

function PlayAgain({ gardenId, sessionId }: { gardenId: string; sessionId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="flex items-center gap-2 text-callout text-ink-2">
        <Sparkles className="size-4 text-amber" aria-hidden />
        Same crew, five fresh things to sort out.
      </p>
      {error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
          {error}
        </p>
      ) : null}
      <Button
        accent="amber"
        size="lg"
        full
        loading={pending}
        icon={<RotateCcw className="size-4" aria-hidden />}
        onClick={() =>
          startTransition(async () => {
            const result = await playAgainAction(gardenId, sessionId);
            if (result?.error) setError(result.error);
          })
        }
      >
        Rank another set
      </Button>
    </Card>
  );
}
