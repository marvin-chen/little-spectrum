"use client";

import { useActionState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { joinAction, type JoinState } from "./actions";

export function JoinForm({ token, gardenName }: { token: string; gardenName: string }) {
  const [state, action, pending] = useActionState<JoinState, FormData>(() => joinAction(token), {});

  if (state.full) {
    return (
      <div className="flex flex-col gap-3">
        <p role="status" className="rounded-row bg-amber-soft px-4 py-3 text-callout text-amber-ink">
          {gardenName} filled up just now. Ask the creator to make room, or plant a garden of your own.
        </p>
        <ButtonLink href="/start" variant="secondary" full>
          Start your own garden
        </ButtonLink>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      {state.error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-3 text-callout text-danger">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" full loading={pending}>
        Join {gardenName}
      </Button>
    </form>
  );
}
