"use client";

import { useActionState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, TextInput } from "@/components/ui/Field";
import { requestMagicLink, verifyCode, type SignInState } from "./actions";

export function SignInForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestMagicLink, { error: initialError });
  const [codeState, codeAction, codePending] = useActionState<SignInState, FormData>(verifyCode, {});

  if (state.sent) {
    return (
      <Card className="anim-pop p-5">
        <MailCheck className="size-8 text-green-ink" aria-hidden />
        <p className="mt-3 text-title-3 font-bold">Check your email</p>
        <p className="mt-1 text-callout text-ink-2">
          A sign-in link is on its way to <span className="font-semibold text-ink">{state.sent}</span>. Open it on this device and you are back in your gardens.
        </p>
        <form action={codeAction} className="mt-5 flex flex-col gap-3">
          <input type="hidden" name="email" value={state.sent} />
          <input type="hidden" name="next" value={next} />
          <Field label="Or enter the code from the email" hint="Only some setups include a code. The link always works.">
            <TextInput name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="123456" maxLength={8} />
          </Field>
          {codeState.error ? (
            <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
              {codeState.error}
            </p>
          ) : null}
          <Button type="submit" variant="glass" loading={codePending}>
            Use code
          </Button>
        </form>
      </Card>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <Field label="Email">
        <TextInput name="email" type="email" autoComplete="email" inputMode="email" required placeholder="you@example.com" />
      </Field>
      {state.error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-3 text-callout text-danger">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" size="lg" full loading={pending}>
        Email me a sign-in link
      </Button>
    </form>
  );
}
