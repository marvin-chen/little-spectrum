"use client";

import { useState, useTransition } from "react";
import { Eye } from "lucide-react";
import { revealEarlyAction } from "@/app/g/[gardenId]/play/[sessionId]/actions";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import type { EarlyRevealCheck } from "@/lib/games/engine";
import { joinNames } from "@/lib/games/engine";
import type { GameKey } from "@/lib/games";

type Props = { gardenId: string; sessionId: string; check: EarlyRevealCheck & { pendingNames: string[] }; game: GameKey };

export function EarlyRevealButton({ gardenId, sessionId, check, game }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function confirm() {
    setError(null);
    startTransition(async () => {
      const result = await revealEarlyAction(gardenId, sessionId);
      if (result.error) setError(result.error);
      else setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="pressable flex h-11 items-center gap-1 rounded-capsule px-3 text-callout font-semibold text-ink-2 hover:bg-fill"
      >
        <Eye className="size-4" aria-hidden />
        Reveal
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Reveal available answers?"
        description="This ends the round for everyone. Anyone who has not answered is marked as not playing this round, with no penalty."
        footer={
          <div className="flex flex-col gap-2">
            {error ? (
              <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
                {error}
              </p>
            ) : null}
            <Button size="lg" full onClick={confirm} loading={pending} disabled={!check.ok}>
              Reveal available answers
            </Button>
            <Button variant="ghost" full onClick={() => setOpen(false)}>
              Keep waiting
            </Button>
          </div>
        }
      >
        {check.pendingNames.length > 0 ? (
          <p className="rounded-row bg-amber-soft px-4 py-3 text-callout text-amber-ink">
            Still waiting on {joinNames(check.pendingNames)}.
          </p>
        ) : (
          <p className="rounded-row bg-fill px-4 py-3 text-callout text-ink-2">Everyone is in.</p>
        )}
        {!check.ok ? <p className="mt-3 text-footnote text-ink-2">{check.reason}</p> : null}
        {game === "same-wavelength" ? (
          <p className="mt-3 text-footnote text-ink-2">Revealing early ends the whole session, with no further attempts.</p>
        ) : null}
      </Sheet>
    </>
  );
}
