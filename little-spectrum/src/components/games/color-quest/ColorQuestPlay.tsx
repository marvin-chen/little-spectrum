"use client";

import { inputClass } from "@/components/ui/Field";
import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, Images, RotateCcw, Trash2, Upload } from "lucide-react";
import { useGameActions } from "@/components/games/GameActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES } from "@/lib/colors";
import type { SessionView } from "@/lib/games/sessionView";
import { joinNames } from "@/lib/games/engine";
import type { ColorQuestView } from "@/lib/games/colorQuest";
import { MAX_CAPTION } from "@/lib/photos/limits";
import { prepareImage, UnsupportedImageError } from "@/lib/photos/client";
import { ColorQuestReveal } from "./ColorQuestReveal";
import { PhotoFigure } from "./PhotoFigure";

type Props = { gardenId: string; session: SessionView; game: ColorQuestView; userId: string };

export function ColorQuestPlay({ gardenId, session, game, userId }: Props) {
  const nameOf = (id: string) => session.participants.find((p) => p.userId === id)?.name ?? "Someone";

  if (game.phase === "revealed") {
    return (
      <div className="flex flex-col gap-4">
        <ColorQuestReveal session={session} game={game} userId={userId} />
        {game.myPhoto && !game.myPhoto.removed ? (
          <DeleteOwnPhoto gardenId={gardenId} sessionId={session.id} photoId={game.myPhoto.photoId} />
        ) : null}
        <PlayAgain gardenId={gardenId} sessionId={session.id} />
      </div>
    );
  }

  const waiting = session.participants
    .filter((p) => p.userId !== userId && !game.submitted.includes(p.userId))
    .map((p) => nameOf(p.userId));

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-5">
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">Today&apos;s prompt</p>
        <p className="mt-1 font-display text-title-2 font-bold">{game.prompt}</p>
        {game.featuredColor ? (
          <p className="mt-3 flex items-center gap-2 text-callout text-ink-2">
            <span className={cn("size-5 rounded-full", COLOR_CLASSES[game.featuredColor].bg)} aria-hidden />
            Today&apos;s featured color is <span className="font-semibold text-ink">{game.featuredColorName}</span>.
          </p>
        ) : null}
      </Card>
      {game.myPhoto ? (
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-title-3 font-semibold">Your photo is in</p>
            <Badge tone="green">Private until reveal</Badge>
          </div>
          <div className="mt-4 max-w-sm">
            <PhotoFigure photo={game.myPhoto} alt="Your photo" />
          </div>
          {game.myPhoto.caption ? <p className="mt-2 text-callout text-ink-2">{game.myPhoto.caption}</p> : null}
          <p className="mt-4 text-callout text-ink-2">
            {waiting.length > 0
              ? `Waiting for ${joinNames(waiting)}. Photos appear together once everyone is in.`
              : "Everyone is in. Revealing."}
          </p>
          <DeleteOwnPhoto gardenId={gardenId} sessionId={session.id} photoId={game.myPhoto.photoId} inline />
        </Card>
      ) : (
        <UploadCard gardenId={gardenId} sessionId={session.id} />
      )}
    </div>
  );
}

function UploadCard({ sessionId }: { gardenId: string; sessionId: string }) {
  const { uploadPhoto, finishPending, initialError } = useGameActions();
  const [file, setFile] = useState<{ blob: Blob; previewUrl: string; name: string } | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [busy, setBusy] = useState<"preparing" | "uploading" | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const libraryRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (file) URL.revokeObjectURL(file.previewUrl);
    };
  }, [file]);

  async function pick(input: HTMLInputElement) {
    const chosen = input.files?.[0];
    input.value = "";
    if (!chosen) return;
    setError(null);
    setBusy("preparing");
    try {
      const prepared = await prepareImage(chosen);
      setFile({ blob: prepared.blob, previewUrl: URL.createObjectURL(prepared.blob), name: chosen.name });
    } catch (e) {
      setError(
        e instanceof UnsupportedImageError ? e.message : "We could not read that image. Try a JPEG, PNG, or WebP.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function share() {
    if (!file) return;
    setError(null);
    setBusy("uploading");
    try {
      const form = new FormData();
      form.set("sessionId", sessionId);
      form.set("caption", caption);
      form.set("file", file.blob, "photo.jpg");
      const result = await uploadPhoto(form);
      if (result.error) {
        setError(result.error);
        return;
      }
      setFile(null);
    } catch {
      setError("You seem to be offline. Try again when you are back.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <Card className="p-5">
        <p className="text-title-3 font-semibold">Share one photo</p>
        <p className="mt-1 mb-4 text-callout text-ink-2">
          It stays private until everyone is in. Photos are resized on your device and location data is removed.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="tinted"
            accent="green"
            size="lg"
            icon={<Camera className="size-5" aria-hidden />}
            onClick={() => cameraRef.current?.click()}
            loading={busy === "preparing"}
          >
            Take a photo
          </Button>
          <Button
            variant="tinted"
            accent="green"
            size="lg"
            icon={<Images className="size-5" aria-hidden />}
            onClick={() => libraryRef.current?.click()}
            loading={busy === "preparing"}
          >
            Choose a photo
          </Button>
        </div>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          aria-label="Take a photo"
          onChange={(e) => pick(e.currentTarget)}
        />
        <input
          ref={libraryRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="sr-only"
          aria-label="Choose a photo"
          onChange={(e) => pick(e.currentTarget)}
        />
        {error && !file ? (
          <p role="alert" className="mt-3 rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
            {error}
          </p>
        ) : null}
      </Card>

      <Sheet
        open={file !== null}
        onClose={() => {
          if (busy !== "uploading") setFile(null);
        }}
        title="Ready to share?"
        description="One photo per round. Once it is in, it stays in."
        dismissible={busy !== "uploading"}
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
              onClick={share}
              loading={busy === "uploading"}
              icon={<Upload className="size-4" aria-hidden />}
            >
              Share photo
            </Button>
            {finishPending ? <Button onClick={finishPending}>Finish pending action</Button> : null}
          </div>
        }
      >
        {file ? (
          <div className="flex flex-col gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.previewUrl}
              alt="Preview of your photo"
              className="max-h-[40dvh] w-full rounded-row bg-fill object-contain"
            />
            <label className="block">
              <span className="mb-1 block text-footnote font-semibold text-ink-2">Caption (optional)</span>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, MAX_CAPTION))}
                maxLength={MAX_CAPTION}
                rows={2}
                placeholder="A few words about it"
                className={cn(inputClass, "h-auto resize-none py-3")}
              />
              <span className="mt-1 block text-right text-caption text-ink-3 tabular-nums">
                {caption.length}/{MAX_CAPTION}
              </span>
            </label>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}

function DeleteOwnPhoto({
  gardenId,
  sessionId,
  photoId,
  inline,
}: {
  gardenId: string;
  sessionId: string;
  photoId: string;
  inline?: boolean;
}) {
  const { deletePhotoAction, finishPending, initialError } = useGameActions();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();
  const button = (
    <Button
      variant={inline ? "plain" : "danger"}
      size={inline ? "sm" : "md"}
      icon={<Trash2 className="size-4" aria-hidden />}
      onClick={() => setOpen(true)}
      className={cn("h-auto! min-h-11 max-w-full whitespace-normal! py-3", inline && "mt-3 -ml-3 text-danger")}
    >
      Delete my photo
    </Button>
  );
  return (
    <>
      {inline ? (
        button
      ) : (
        <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-footnote text-ink-2">
            You can remove your photo at any time. The round keeps a note that it was removed.
          </p>
          <span className="min-w-0 max-w-full">{button}</span>
        </Card>
      )}
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Delete your photo?"
        description="The file and its record are removed for good. This cannot be undone."
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
              variant="danger"
              loading={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deletePhotoAction(gardenId, sessionId, photoId);
                  if (result.error) setError(result.error);
                  else setOpen(false);
                })
              }
            >
              Delete photo
            </Button>
            {finishPending ? <Button onClick={finishPending}>Finish pending action</Button> : null}
            <Button variant="plain" full onClick={() => setOpen(false)}>
              Keep it
            </Button>
          </div>
        }
      >
        <p className="text-callout text-ink-2">
          If the round is still open you can share a different photo afterwards.
        </p>
      </Sheet>
    </>
  );
}

function PlayAgain({ gardenId, sessionId }: { gardenId: string; sessionId: string }) {
  const { playAgainAction, initialError } = useGameActions();
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [pending, startTransition] = useTransition();
  return (
    <Card className="flex flex-col gap-3 p-5">
      <p className="text-callout text-ink-2">Saved as a memory. Up for another prompt?</p>
      {error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
          {error}
        </p>
      ) : null}
      <Button
        variant="tinted"
        accent="green"
        size="lg"
        full
        className="h-auto! whitespace-normal! py-3"
        loading={pending}
        icon={<RotateCcw className="size-4" aria-hidden />}
        onClick={() =>
          startTransition(async () => {
            const result = await playAgainAction(gardenId, sessionId);
            if (result?.error) setError(result.error);
          })
        }
      >
        Share another photo
      </Button>
    </Card>
  );
}
