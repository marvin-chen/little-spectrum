"use client";

import { useState, useTransition } from "react";
import { Link2Off, RefreshCw, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { ShareButton } from "@/components/ui/ShareButton";
import { expandGardenAction, rotateInviteAction } from "./actions";

export function InviteManager({
  gardenId,
  inviteUrl,
  gardenName,
  isCreator,
  full,
  spotsLeft,
}: {
  gardenId: string;
  inviteUrl: string | null;
  gardenName: string;
  isCreator: boolean;
  full: boolean;
  spotsLeft: number;
}) {
  const [confirm, setConfirm] = useState<"revoke" | "rotate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(revokeOnly: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await rotateInviteAction(gardenId, revokeOnly);
      if (result.error) setError(result.error);
      else setConfirm(null);
    });
  }

  return (
    <Card className="p-4">
      {full ? (
        <p className="text-callout text-ink-2">This garden is full. {isCreator ? "Make room below if you want more friends in." : "Ask the creator to make room for more friends."}</p>
      ) : inviteUrl ? (
        <>
          <p className="text-callout text-ink-2">
            Anyone with this link can join. {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left.
          </p>
          <p className="mt-2 mb-3 break-all rounded-row bg-fill px-3 py-2 text-footnote text-ink-2 select-all">{inviteUrl}</p>
          <ShareButton url={inviteUrl} title={`Join ${gardenName} on Little Spectrum`} text="Come play little games and grow a garden with me." full />
        </>
      ) : (
        <p className="text-callout text-ink-2">Invites are paused. {isCreator ? "Make a new link when you are ready." : "The creator can make a new link."}</p>
      )}

      {isCreator ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="glass" size="sm" icon={<RefreshCw className="size-4" aria-hidden />} onClick={() => setConfirm("rotate")}>
            {inviteUrl ? "New link" : "Make a link"}
          </Button>
          {inviteUrl ? (
            <Button variant="glass" size="sm" icon={<Link2Off className="size-4" aria-hidden />} onClick={() => setConfirm("revoke")}>
              Pause invites
            </Button>
          ) : null}
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
          {error}
        </p>
      ) : null}

      <Sheet
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm === "revoke" ? "Pause invites?" : "Make a new link?"}
        description={
          confirm === "revoke"
            ? "The current link stops working right away. Members stay. You can make a new link any time."
            : "The old link stops working and a fresh one takes its place. Members stay."
        }
        footer={
          <div className="flex flex-col gap-2">
            <Button size="lg" full variant={confirm === "revoke" ? "danger" : "prominent"} loading={pending} onClick={() => run(confirm === "revoke")}>
              {confirm === "revoke" ? "Pause invites" : "Make a new link"}
            </Button>
            <Button variant="plain" full onClick={() => setConfirm(null)}>
              Cancel
            </Button>
          </div>
        }
      >
        <p className="text-callout text-ink-2">Anyone who already joined keeps their spot and their history.</p>
      </Sheet>
    </Card>
  );
}

export function ExpandGarden({ gardenId }: { gardenId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  return (
    <>
      <Button className="mt-3" variant="tinted" accent="green" full icon={<UsersRound className="size-4" aria-hidden />} onClick={() => setOpen(true)}>
        Make room for more friends
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Grow to eight people?"
        description="Your garden keeps everything: history, growth, and memories. It just gets room for up to eight friends."
        footer={
          <div className="flex flex-col gap-2">
            {error ? (
              <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
                {error}
              </p>
            ) : null}
            <Button
              size="lg"
              full
              accent="green"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await expandGardenAction(gardenId);
                  if (result.error) setError(result.error);
                  else setOpen(false);
                })
              }
            >
              Make room
            </Button>
            <Button variant="plain" full onClick={() => setOpen(false)}>
              Not now
            </Button>
          </div>
        }
      >
        <p className="text-callout text-ink-2">This cannot be shrunk back, but nobody has to join.</p>
      </Sheet>
    </>
  );
}
