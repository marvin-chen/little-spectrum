"use client";

import { useState, useTransition } from "react";
import { Lock, RotateCcw, Sparkles } from "lucide-react";
import { playAgainAction, submitAction } from "@/app/g/[gardenId]/play/[sessionId]/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Slider } from "@/components/ui/Slider";
import type { SessionView } from "@/lib/data/sessions";
import { joinNames } from "@/lib/games/engine";
import { MAX_CLUE_LENGTH, type HueKnewView } from "@/lib/games/hueKnew";
import { SpectrumScale, type ScaleMarker } from "./SpectrumScale";

type Props = { gardenId: string; session: SessionView; game: HueKnewView; userId: string };

export function HueKnewPlay({ gardenId, session, game, userId }: Props) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const avatarOf = (id: string) => session.participants.find((p) => p.userId === id)?.avatar ?? "sun:amber";
  const clueGiverName = nameOf(game.clueGiverId);

  if (game.phase === "revealed" && game.result) {
    const result = game.result;
    const markers: ScaleMarker[] = [
      { id: "target", position: result.target, kind: "target", label: `Target ${result.target}` },
      ...result.guesses.map((g) => ({
        id: g.userId,
        position: g.guess,
        kind: g.userId === userId ? ("mine" as const) : ("guess" as const),
        label: String(g.guess),
        avatar: avatarOf(g.userId),
        name: nameOf(g.userId),
      })),
    ];
    const suggestedIsMe = result.suggestedClueGiverId === userId;
    return (
      <div className="flex flex-col gap-4">
        <Card className="p-5">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{clueGiverName}&apos;s clue</p>
          <p className="mt-1 font-display text-title-2 font-bold">&ldquo;{result.clue}&rdquo;</p>
          <div className="mt-6">
            <SpectrumScale left={game.left} right={game.right} markers={markers} />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Shared score</p>
            <p className="font-display text-title-1 font-bold text-coral-ink tabular-nums">{result.shared ?? "–"}</p>
          </div>
          <ul className="mt-2 divide-y divide-line">
            {result.guesses
              .slice()
              .sort((a, b) => b.score - a.score)
              .map((g) => (
                <li key={g.userId} className="flex items-center gap-3 py-2.5">
                  <Avatar avatar={avatarOf(g.userId)} name={nameOf(g.userId)} size="sm" />
                  <span className="flex-1 text-body">
                    {g.userId === userId ? "You" : nameOf(g.userId)}
                    <span className="text-ink-3"> guessed {g.guess}</span>
                  </span>
                  <span className="text-body font-semibold tabular-nums">{g.score}</span>
                </li>
              ))}
            {result.missing.map((id) => (
              <li key={id} className="flex items-center gap-3 py-2.5">
                <Avatar avatar={avatarOf(id)} name={nameOf(id)} size="sm" />
                <span className="flex-1 text-body text-ink-2">{id === userId ? "You" : nameOf(id)}</span>
                <Badge>Didn&apos;t play this round</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <PlayAgain
          gardenId={gardenId}
          sessionId={session.id}
          line={suggestedIsMe ? "Next time, you give the clue." : `Next time, ${nameOf(result.suggestedClueGiverId)} could give the clue.`}
          primary={suggestedIsMe}
        />
      </div>
    );
  }

  if (game.isClueGiver) {
    return <ClueGiverPanel gardenId={gardenId} session={session} game={game} />;
  }

  if (game.phase === "clue") {
    return (
      <Card className="p-5">
        <p className="text-title-3 font-semibold">Waiting for {clueGiverName}&apos;s clue</p>
        <p className="mt-1 text-callout text-ink-2">
          {clueGiverName} sees a secret spot on this scale and is writing a clue for it. You will guess next.
        </p>
        <div className="mt-6 opacity-70">
          <SpectrumScale left={game.left} right={game.right} markers={[]} />
        </div>
      </Card>
    );
  }

  return <GuesserPanel gardenId={gardenId} session={session} game={game} userId={userId} />;
}

function ClueGiverPanel({ gardenId, session, game }: { gardenId: string; session: SessionView; game: HueKnewView }) {
  const [clue, setClue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await submitAction(gardenId, session.id, { clue });
      if (result.error) setError(result.error);
    });
  }

  if (game.clue) {
    const waiting = game.guessers.filter((g) => !g.submitted).map((g) => nameOf(g.userId));
    return (
      <Card className="p-5">
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Your clue</p>
        <p className="mt-1 font-display text-title-2 font-bold">&ldquo;{game.clue}&rdquo;</p>
        <div className="mt-6">
          <SpectrumScale
            left={game.left}
            right={game.right}
            markers={game.target !== null ? [{ id: "t", position: game.target, kind: "target", label: `Target ${game.target}` }] : []}
          />
        </div>
        <p className="mt-5 text-callout text-ink-2">
          {waiting.length > 0 ? `Waiting for ${joinNames(waiting)} to guess. The reveal happens on its own once everyone is in.` : "Everyone is in. Revealing."}
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Only you can see this</p>
        <p className="mt-1 text-title-3 font-semibold">
          Your secret spot is <span className="text-coral-ink tabular-nums">{game.target}</span>
        </p>
        <div className="mt-6">
          <SpectrumScale
            left={game.left}
            right={game.right}
            markers={game.target !== null ? [{ id: "t", position: game.target, kind: "target", label: `Target ${game.target}` }] : []}
          />
        </div>
      </Card>
      <Card className="p-5">
        <label className="block">
          <span className="text-title-3 font-semibold">Write a clue</span>
          <span className="mt-1 mb-3 block text-callout text-ink-2">
            Point at the spot without naming the scale. &ldquo;Sunday pancakes&rdquo; beats &ldquo;very cozy.&rdquo;
          </span>
          <input
            value={clue}
            onChange={(e) => setClue(e.target.value.slice(0, MAX_CLUE_LENGTH))}
            maxLength={MAX_CLUE_LENGTH}
            placeholder="Your clue"
            autoComplete="off"
            enterKeyHint="send"
            onKeyDown={(e) => {
              if (e.key === "Enter" && clue.trim()) send();
            }}
            className="h-12 w-full rounded-row bg-fill px-4 text-body outline-none focus-visible:ring-2 focus-visible:ring-blue"
          />
        </label>
        <div className="mt-2 flex items-center justify-between text-footnote text-ink-3">
          <span>Committed clues cannot be edited.</span>
          <span className="tabular-nums">{clue.length}/{MAX_CLUE_LENGTH}</span>
        </div>
        {error ? (
          <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
            {error}
          </p>
        ) : null}
        <Button className="mt-4" size="lg" full accent="coral" onClick={send} loading={pending} disabled={!clue.trim()} icon={<Lock className="size-4" aria-hidden />}>
          Send clue
        </Button>
      </Card>
    </div>
  );
}

function GuesserPanel({ gardenId, session, game, userId }: { gardenId: string; session: SessionView; game: HueKnewView; userId: string }) {
  const [guess, setGuess] = useState(50);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const clueGiverName = nameOf(game.clueGiverId);

  function lockIn() {
    setError(null);
    startTransition(async () => {
      const result = await submitAction(gardenId, session.id, { guess });
      if (result.error) setError(result.error);
    });
  }

  const others = game.guessers.filter((g) => g.userId !== userId);
  const waiting = others.filter((g) => !g.submitted).map((g) => nameOf(g.userId));

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{clueGiverName}&apos;s clue</p>
        <p className="mt-1 font-display text-title-2 font-bold">&ldquo;{game.clue}&rdquo;</p>
      </Card>
      {game.myGuess === null ? (
        <Card className="p-5">
          <p className="text-title-3 font-semibold">Where does it land?</p>
          <p className="mt-1 mb-5 text-callout text-ink-2">Slide to the spot you think {clueGiverName} meant, then lock it in.</p>
          <Slider label="Your guess" value={guess} onChange={setGuess} leftLabel={game.left} rightLabel={game.right} />
          {error ? (
            <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
              {error}
            </p>
          ) : null}
          <Button className="mt-5" size="lg" full accent="coral" onClick={lockIn} loading={pending} icon={<Lock className="size-4" aria-hidden />}>
            Lock in {guess}
          </Button>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-title-3 font-semibold">Your guess is locked in</p>
          <div className="mt-5">
            <SpectrumScale left={game.left} right={game.right} markers={[{ id: "me", position: game.myGuess, kind: "mine", label: String(game.myGuess) }]} />
          </div>
          <p className="mt-4 text-callout text-ink-2">
            {waiting.length > 0 ? `Waiting for ${joinNames(waiting)}. The reveal happens on its own once everyone is in.` : "Everyone is in. Revealing."}
          </p>
        </Card>
      )}
    </div>
  );
}

function PlayAgain({ gardenId, sessionId, line, primary }: { gardenId: string; sessionId: string; line: string; primary: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="flex items-center gap-2 text-callout text-ink-2">
        <Sparkles className="size-4 text-amber" aria-hidden />
        {line}
      </p>
      {error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
          {error}
        </p>
      ) : null}
      <Button
        variant={primary ? "primary" : "tinted"}
        accent="coral"
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
        Play another round
      </Button>
    </Card>
  );
}
