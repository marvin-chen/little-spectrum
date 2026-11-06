"use client";

import { inputClass } from "@/components/ui/Field";
import { useState, useTransition } from "react";
import { Lock, RotateCcw, Sparkles } from "lucide-react";
import { useGameActions } from "@/components/games/GameActions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { SessionView } from "@/lib/games/sessionView";
import { joinNames } from "@/lib/games/engine";
import { MAX_ATTEMPTS, MAX_WORD_LENGTH, type SameWavelengthView } from "@/lib/games/sameWavelength";
import { SameWavelengthReveal, SameWavelengthRoundTiles } from "./SameWavelengthReveal";

type Props = { gardenId: string; session: SessionView; game: SameWavelengthView; userId: string };

export function SameWavelengthPlay({ gardenId, session, game, userId }: Props) {
  const me = session.participants.find((p) => p.userId === userId);
  const revealed = game.phase === "revealed" && game.result;

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Category</p>
          {!revealed ? (
            <Badge tone="blue">
              Attempt {game.round} of {MAX_ATTEMPTS}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 font-display text-title-1 font-bold">{game.category}</p>
      </Card>

      {!revealed && game.previousRounds.length > 0 ? (
        <Card className="flex flex-col gap-5 p-5">
          <div>
            <p className="text-title-3 font-semibold">Earlier attempts</p>
            <p className="mt-1 text-callout text-ink-2">Try to match the room. Borrowing an earlier answer is fair game.</p>
          </div>
          {game.previousRounds.map((round) => (
            <section key={round.round}>
              <h3 className="mb-2 text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Attempt {round.round}</h3>
              <SameWavelengthRoundTiles round={round} participants={session.participants} userId={userId} />
            </section>
          ))}
        </Card>
      ) : null}

      {revealed && game.result ? (
        <>
          <SameWavelengthReveal session={session} result={game.result} userId={userId} />
          <PlayAgain
            gardenId={gardenId}
            sessionId={session.id}
            line={
              game.result.outcome === "all"
                ? "That was uncanny. See if it holds up on a new category."
                : game.result.outcome === "some"
                  ? "Close enough to try again. A fresh category awaits."
                  : "Every category is a new chance to read each other's minds."
            }
          />
        </>
      ) : game.phase === "waiting" && game.myWord !== null ? (
        <WaitingPanel session={session} game={game} userId={userId} myAvatar={me?.avatar ?? "sun:amber"} myName={me?.name ?? "You"} />
      ) : (
        <AnswerPanel gardenId={gardenId} sessionId={session.id} game={game} />
      )}
    </div>
  );
}

function AnswerPanel({ gardenId, sessionId, game }: { gardenId: string; sessionId: string; game: SameWavelengthView }) {
  const { submitAction, initialError } = useGameActions();
  const [word, setWord] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();

  function lockIn() {
    setError(null);
    startTransition(async () => {
      const result = await submitAction(gardenId, sessionId, { word });
      if (result.error) setError(result.error);
    });
  }

  return (
    <Card className="p-5">
      <label className="block">
        <span className="text-title-3 font-semibold">{game.round === 1 ? "What comes to mind?" : "Go again"}</span>
        <span className="mt-1 mb-3 block text-callout text-ink-2">
          One word or a short phrase. Exact matches only, so keep it simple.
        </span>
        <input
          value={word}
          onChange={(e) => setWord(e.target.value.slice(0, MAX_WORD_LENGTH))}
          maxLength={MAX_WORD_LENGTH}
          placeholder="Your answer"
          autoComplete="off"
          autoCapitalize="none"
          enterKeyHint="done"
          onKeyDown={(e) => {
            if (e.key === "Enter" && word.trim()) lockIn();
          }}
          className={inputClass}
        />
      </label>
      <div className="mt-2 flex items-center justify-between text-footnote text-ink-3">
        <span>{game.attemptsLeft === 0 ? "Last attempt. Make it count." : "Locked answers cannot be edited."}</span>
        <span className="tabular-nums">
          {word.length}/{MAX_WORD_LENGTH}
        </span>
      </div>
      {error ? (
        <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
          {error}
        </p>
      ) : null}
      <Button className="mt-4" size="lg" full accent="blue" onClick={lockIn} loading={pending} disabled={!word.trim()} icon={<Lock className="size-4" aria-hidden />}>
        Lock in
      </Button>
    </Card>
  );
}

function WaitingPanel({
  session,
  game,
  userId,
  myAvatar,
  myName,
}: {
  session: SessionView;
  game: SameWavelengthView;
  userId: string;
  myAvatar: string;
  myName: string;
}) {
  const submitted = new Set(game.submitted);
  const waiting = session.participants.filter((p) => p.userId !== userId && !submitted.has(p.userId)).map((p) => p.name);
  return (
    <Card className="p-5">
      <p className="text-title-3 font-semibold">Your answer is locked in</p>
      <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-capsule bg-blue-soft py-1 pl-1 pr-3 text-callout font-semibold text-blue-ink">
        <Avatar avatar={myAvatar} name={`${myName} (you)`} size="xs" />
        <span className="truncate">{game.myWord}</span>
      </div>
      <p className="mt-4 text-callout text-ink-2">
        {waiting.length > 0
          ? `Waiting for ${joinNames(waiting)}. The reveal happens on its own once everyone is in.`
          : "Everyone is in. Revealing."}
      </p>
      {game.attemptsLeft > 0 ? (
        <p className="mt-1 text-footnote text-ink-3">
          If it is not a full match, everyone gets another go. {game.attemptsLeft === 1 ? "One attempt left after this." : `${game.attemptsLeft} attempts left after this.`}
        </p>
      ) : null}
    </Card>
  );
}

function PlayAgain({ gardenId, sessionId, line }: { gardenId: string; sessionId: string; line: string }) {
  const { playAgainAction, initialError } = useGameActions();
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();
  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="flex items-center gap-2 text-callout text-ink-2">
        <Sparkles className="size-4 text-blue" aria-hidden />
        {line}
      </p>
      {error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
          {error}
        </p>
      ) : null}
      <Button
        variant="prominent"
        accent="blue"
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
        Play another category
      </Button>
    </Card>
  );
}
