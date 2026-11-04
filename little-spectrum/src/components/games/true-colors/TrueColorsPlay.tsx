"use client";

import { useState, useTransition } from "react";
import { Lock, RotateCcw, Sparkles, User, UserRoundSearch } from "lucide-react";
import { playAgainAction, submitAction } from "@/app/g/[gardenId]/play/[sessionId]/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { Feedback } from "@/components/ui/Feedback";
import type { SessionView } from "@/lib/data/sessions";
import { joinNames } from "@/lib/games/engine";
import type { TrueColorsView } from "@/lib/games/trueColors";
import { TrueColorsReveal } from "./TrueColorsReveal";

type Props = { gardenId: string; session: SessionView; game: TrueColorsView; userId: string };

export function TrueColorsPlay({ gardenId, session, game, userId }: Props) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const friendName = game.predictsUserId ? nameOf(game.predictsUserId) : "a friend";

  if (game.phase === "revealed" && game.result) {
    return (
      <div className="flex flex-col gap-4">
        <TrueColorsReveal
          session={session}
          prompt={{ text: game.question, options: game.options }}
          result={game.result}
          userId={userId}
        />
        <PlayAgain gardenId={gardenId} sessionId={session.id} />
      </div>
    );
  }

  if (game.phase === "waiting" && game.myAnswer !== null && game.myPrediction !== null) {
    const submitted = new Set(game.submitted);
    const waiting = session.participants.filter((p) => p.userId !== userId && !submitted.has(p.userId)).map((p) => p.name);
    return (
      <div className="flex flex-col gap-4">
        <QuestionCard question={game.question} />
        <Card className="p-5">
          <p className="text-title-3 font-semibold">Your picks are locked in</p>
          <ul className="mt-4 flex flex-col gap-2">
            <LockedPick icon={<User className="size-4" aria-hidden />} label="Your answer" value={game.options[game.myAnswer]} />
            <LockedPick
              icon={<UserRoundSearch className="size-4" aria-hidden />}
              label={`Your prediction for ${friendName}`}
              value={game.options[game.myPrediction]}
            />
          </ul>
          <p className="mt-4 text-callout text-ink-2">
            {waiting.length > 0
              ? `Waiting for ${joinNames(waiting)}. The reveal happens on its own once everyone is in.`
              : "Everyone is in. Revealing."}
          </p>
        </Card>
      </div>
    );
  }

  return <PicksPanel gardenId={gardenId} session={session} game={game} friendName={friendName} />;
}

function QuestionCard({ question }: { question: string }) {
  return (
    <Card className="p-5">
      <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">The question</p>
      <p className="mt-1 font-display text-title-2 font-bold">{question}</p>
    </Card>
  );
}

function LockedPick({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <li className="flex items-center gap-3 rounded-row bg-rose-soft px-4 py-3 text-rose-ink">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface/70">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-caption font-semibold uppercase tracking-wide opacity-80">{label}</span>
        <span className="block truncate text-body font-semibold">{value}</span>
      </span>
      <Lock className="size-4 shrink-0 opacity-70" aria-hidden />
    </li>
  );
}

function PicksPanel({
  gardenId,
  session,
  game,
  friendName,
}: {
  gardenId: string;
  session: SessionView;
  game: TrueColorsView;
  friendName: string;
}) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ready = answer !== null && prediction !== null;

  function lockIn() {
    if (!ready) return;
    setError(null);
    startTransition(async () => {
      const result = await submitAction(gardenId, session.id, { answer, prediction });
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <QuestionCard question={game.question} />

      <Card className="p-5">
        <section aria-labelledby="tc-answer-label">
          <SectionHeading id="tc-answer-label" icon={<User className="size-4" aria-hidden />} title="Your answer" line="What you would honestly pick." />
          <ChoiceGroup label="Your answer" options={game.options.map((label, i) => ({ value: String(i), label }))} value={answer === null ? null : String(answer)} onChange={(value) => setAnswer(Number(value))} disabled={pending} />
        </section>

        <div role="separator" className="my-6 flex items-center gap-3 text-caption font-semibold uppercase tracking-wide text-ink-3">
          <span className="h-px flex-1 bg-line-strong" />
          Now switch hats
          <span className="h-px flex-1 bg-line-strong" />
        </div>

        <section aria-labelledby="tc-prediction-label">
          <SectionHeading
            id="tc-prediction-label"
            icon={<UserRoundSearch className="size-4" aria-hidden />}
            title={`Your prediction for ${friendName}`}
            line={`Not what you want for ${friendName}, what ${friendName} would actually choose.`}
          />
          <ChoiceGroup label={`Your prediction for ${friendName}`} options={game.options.map((label, i) => ({ value: String(i), label }))} value={prediction === null ? null : String(prediction)} onChange={(value) => setPrediction(Number(value))} disabled={pending} />
        </section>

        {error ? (
          <Feedback tone="error" className="mt-4">
            {error}
          </Feedback>
        ) : null}
        <p className="mt-4 text-footnote text-ink-3">Both go in together. Locked picks cannot be edited.</p>
        <Button className="mt-3" size="lg" full accent="rose" onClick={lockIn} loading={pending} disabled={!ready} icon={<Lock className="size-4" aria-hidden />}>
          Lock in both
        </Button>
      </Card>
    </div>
  );
}

function SectionHeading({ id, icon, title, line }: { id: string; icon: React.ReactNode; title: string; line: string }) {
  return (
    <div className="mb-3">
      <h2 id={id} className="flex items-center gap-2 text-title-3 font-semibold">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-soft text-rose-ink">{icon}</span>
        {title}
      </h2>
      <p className="mt-1 text-callout text-ink-2">{line}</p>
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
        Same people, fresh question.
      </p>
      {error ? (
        <Feedback tone="error">
          {error}
        </Feedback>
      ) : null}
      <Button
        variant="tinted"
        accent="rose"
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
        Play another question
      </Button>
    </Card>
  );
}
