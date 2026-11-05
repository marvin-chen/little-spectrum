"use client";

import { inputClass } from "@/components/ui/Field";
import { useState, useTransition } from "react";
import { Lock, RotateCcw, Sparkles } from "lucide-react";
import { playAgainAction, submitAction } from "@/app/g/[gardenId]/play/[sessionId]/actions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { SessionView } from "@/lib/games/sessionView";
import { joinNames } from "@/lib/games/engine";
import { MAX_CLUE_CHARS, MAX_CLUE_WORDS, type Cell, type HueClueView } from "@/lib/games/hueClue";
import { PALETTE } from "@/lib/games/hueCluePalette";
import { ColorGrid, Swatch } from "./ColorGrid";
import { HueClueReveal } from "./HueClueReveal";

type Props = { gardenId: string; session: SessionView; game: HueClueView; userId: string };

export function HueCluePlay({ gardenId, session, game, userId }: Props) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const clueGiverName = nameOf(game.clueGiverId);

  if (game.phase === "revealed" && game.result) {
    const suggestedIsMe = game.result.suggestedClueGiverId === userId;
    return (
      <div className="flex flex-col gap-4">
        <HueClueReveal session={session} result={game.result} userId={userId} />
        <PlayAgain
          gardenId={gardenId}
          sessionId={session.id}
          line={suggestedIsMe ? "Next time, you give the clue." : `Next time, ${nameOf(game.result.suggestedClueGiverId)} could give the clue.`}
          primary={suggestedIsMe}
        />
      </div>
    );
  }

  if (game.isClueGiver) return <ClueGiverPanel gardenId={gardenId} session={session} game={game} />;

  if (game.phase === "clue") {
    return (
      <Card className="p-5">
        <p className="text-title-3 font-semibold">Waiting for {clueGiverName}&apos;s clue</p>
        <p className="mt-1 text-callout text-ink-2">{clueGiverName} has a secret square on this grid and is describing it in three words or fewer.</p>
        <div className="mt-5 opacity-70">
          <ColorGrid label="Color grid preview" selected={null} />
        </div>
      </Card>
    );
  }

  return <GuesserPanel gardenId={gardenId} session={session} game={game} userId={userId} />;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function ClueGiverPanel({ gardenId, session, game }: { gardenId: string; session: SessionView; game: HueClueView }) {
  const [clue, setClue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const words = wordCount(clue);
  const target = game.target;
  const targetCell = target ? PALETTE[target.row][target.col] : null;

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await submitAction(gardenId, session.id, { clue });
      if (result.error) setError(result.error);
    });
  }

  const waiting = game.guessers.filter((g) => !g.submitted).map((g) => nameOf(g.userId));

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Only you can see this</p>
        <p className="mt-1 text-title-3 font-semibold">
          Your secret square is <span className="text-violet-ink">{targetCell?.coord}</span>
        </p>
        <div className="mt-4">
          <ColorGrid label="Color grid with your target" selected={null} target={target} />
        </div>
        <Swatch cell={target} className="mt-4" />
      </Card>
      {game.clue ? (
        <Card className="p-5">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Your clue</p>
          <p className="mt-1 font-display text-title-2 font-bold">&ldquo;{game.clue}&rdquo;</p>
          <p className="mt-4 text-callout text-ink-2">
            {waiting.length > 0 ? `Waiting for ${joinNames(waiting)} to pick. The reveal happens on its own once everyone is in.` : "Everyone is in. Revealing."}
          </p>
        </Card>
      ) : (
        <Card className="p-5">
          <label className="block">
            <span className="text-title-3 font-semibold">Describe it in three words</span>
            <span className="mt-1 mb-3 block text-callout text-ink-2">Think objects, not color names. &ldquo;Ripe mango&rdquo; says more than &ldquo;orange.&rdquo;</span>
            <input
              value={clue}
              onChange={(e) => setClue(e.target.value.slice(0, MAX_CLUE_CHARS))}
              maxLength={MAX_CLUE_CHARS}
              placeholder="Your clue"
              autoComplete="off"
              enterKeyHint="send"
              onKeyDown={(e) => {
                if (e.key === "Enter" && clue.trim() && words <= MAX_CLUE_WORDS) send();
              }}
              className={inputClass}
            />
          </label>
          <div className="mt-2 flex items-center justify-between text-footnote text-ink-3">
            <span>Committed clues cannot be edited.</span>
            <span className={words > MAX_CLUE_WORDS ? "font-semibold text-danger" : undefined}>
              {words}/{MAX_CLUE_WORDS} words
            </span>
          </div>
          {error ? (
            <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
              {error}
            </p>
          ) : null}
          <Button className="mt-4" size="lg" full accent="violet" onClick={send} loading={pending} disabled={!clue.trim() || words > MAX_CLUE_WORDS} icon={<Lock className="size-4" aria-hidden />}>
            Send clue
          </Button>
        </Card>
      )}
    </div>
  );
}

function GuesserPanel({ gardenId, session, game, userId }: { gardenId: string; session: SessionView; game: HueClueView; userId: string }) {
  const [selected, setSelected] = useState<Cell | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";
  const clueGiverName = nameOf(game.clueGiverId);
  const waiting = game.guessers.filter((g) => g.userId !== userId && !g.submitted).map((g) => nameOf(g.userId));

  function confirm() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await submitAction(gardenId, session.id, selected);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{clueGiverName}&apos;s clue</p>
        <p className="mt-1 font-display text-title-2 font-bold">&ldquo;{game.clue}&rdquo;</p>
      </Card>
      {game.myGuess ? (
        <Card className="p-5">
          <p className="text-title-3 font-semibold">Your pick is locked in</p>
          <div className="mt-4">
            <ColorGrid label="Color grid with your pick" selected={game.myGuess} />
          </div>
          <Swatch cell={game.myGuess} className="mt-4" />
          <p className="mt-4 text-callout text-ink-2">
            {waiting.length > 0 ? `Waiting for ${joinNames(waiting)}. The reveal happens on its own once everyone is in.` : "Everyone is in. Revealing."}
          </p>
        </Card>
      ) : (
        <Card className="p-5">
          <p className="text-title-3 font-semibold">Find the square</p>
          <p className="mt-1 mb-4 text-callout text-ink-2">Tap a square to preview it, then confirm. Arrow keys work too.</p>
          <ColorGrid label="Color grid" selected={selected} onSelect={setSelected} />
          <Swatch cell={selected} className="mt-4" />
          {error ? (
            <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
              {error}
            </p>
          ) : null}
          <Button className="mt-4" size="lg" full accent="violet" onClick={confirm} loading={pending} disabled={!selected} icon={<Lock className="size-4" aria-hidden />}>
            {selected ? `Confirm ${PALETTE[selected.row][selected.col].coord}` : "Pick a square"}
          </Button>
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
        variant={primary ? "prominent" : "tinted"}
        accent="violet"
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
