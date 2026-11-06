"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import { GamePlay } from "@/components/games/GamePlay";
import { GameActionsProvider, type GameActions } from "@/components/games/GameActions";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { SessionView } from "@/lib/games/sessionView";
import { localSubmission } from "@/lib/games/fixtures/localView";

const FAILURE = "Simulated request failed. Your input is kept. Try again.";

export function GamePreview({ initial, userId, mode, restartHref }: {
  initial: SessionView; userId: string; mode: string; restartHref: string;
}) {
  const router = useRouter();
  const [session, setSession] = useState(initial);
  const [failNext, setFailNext] = useState(false);
  const [hold, setHold] = useState(mode === "pending");
  const [pending, setPending] = useState(false);
  const release = useRef<(() => void) | null>(null);
  const mounted = useRef(true);
  const urls = useRef<string[]>([]);
  useEffect(() => {
    mounted.current = true;
    const previewUrls = urls.current;
    return () => {
      mounted.current = false;
      release.current?.();
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  async function run(change: () => void) {
    // Games call actions inside a transition. Show the release control immediately,
    // before that transition can wait on this intentionally unresolved promise.
    flushSync(() => setPending(true));
    const fail = failNext;
    setFailNext(false);
    if (hold) await new Promise<void>((resolve) => { release.current = resolve; });
    else await new Promise((resolve) => setTimeout(resolve, 450));
    release.current = null;
    if (!mounted.current) return { error: "Preview reset." };
    setPending(false);
    if (fail) return { error: FAILURE };
    change();
    return {};
  }

  const actions: GameActions = {
    initialError: mode === "error" ? FAILURE : undefined,
    finishPending: pending && hold ? () => { setHold(false); release.current?.(); } : undefined,
    submitAction: async (_garden, _id, input) => run(() => setSession((current) => localSubmission(current, userId, input as Record<string, unknown>))),
    playAgainAction: async () => run(() => router.push(restartHref)),
    deletePhotoAction: async () => run(() => setSession((current) => {
      const v = current.view as { myPhoto: { photoId: string } | null; gallery: Array<{ photoId: string }> | null };
      const mark = (photo: { photoId: string }) => photo.photoId === v.myPhoto?.photoId ? { ...photo, removed: true, url: null } : photo;
      return { ...current, view: { ...v, myPhoto: current.status === "active" ? null : v.myPhoto ? mark(v.myPhoto) : null, gallery: v.gallery?.map(mark) ?? null } };
    })),
    uploadPhoto: async (form) => run(() => {
      const url = URL.createObjectURL(form.get("file") as Blob);
      urls.current.push(url);
      const photo = { photoId: "local-preview-photo", userId, caption: String(form.get("caption") ?? ""), url, width: 800, height: 600, removed: false };
      setSession((current) => localSubmission(current, userId, { photo }));
    }),
  };

  return (
    <>
      <Card className="flex flex-col gap-3 p-4">
        <p className="text-footnote text-ink-2">Actions affect this preview only. Select a completed state to see friends’ answers.</p>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={failNext} disabled={pending} onChange={(e) => setFailNext(e.target.checked)} />Fail next action</label>
        <label className="flex min-h-11 items-center gap-2"><input type="checkbox" checked={hold} disabled={pending} onChange={(e) => setHold(e.target.checked)} />Hold next action pending</label>
        {pending && hold ? <Button onClick={() => { setHold(false); release.current?.(); }}>Finish pending action</Button> : null}
        <p role="status" className="text-footnote">{session.turn.line}</p>
      </Card>
      <section aria-label={session.status === "revealed" ? "Reveal preview" : "Play preview"}>
        <GameActionsProvider actions={actions}><GamePlay session={session} userId={userId} /></GameActionsProvider>
      </section>
      <details className="rounded-card bg-fill p-4"><summary className="cursor-pointer text-body font-medium">Viewer-safe fixture data</summary><pre className="mt-3 overflow-x-auto text-xs" data-testid="fixture-data">{JSON.stringify(session, null, 2)}</pre></details>
    </>
  );
}
