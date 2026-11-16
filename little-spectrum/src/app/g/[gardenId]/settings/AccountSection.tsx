"use client";

import { useActionState, useState, useTransition } from "react";
import { LogOut, MailCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Group, Row, RowButton } from "@/components/ui/Card";
import { Feedback } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";
import { Sheet } from "@/components/ui/Sheet";
import { attachEmailAction, signOutAction, type AccountState } from "./accountActions";

type Props = { gardenId: string; email: string | null; isAnonymous: boolean; justKept?: boolean };

export function AccountSection({ gardenId, email, isAnonymous, justKept }: Props) {
  const [open, setOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const [state, action, pending] = useActionState<AccountState, FormData>(
    async (prev, formData) => {
      const next = await attachEmailAction(gardenId, prev, formData);
      if (next.done) toast.success("Email attached to account");
      else if (next.pending) toast.success("Confirmation link sent", { description: `Check ${next.pending}` });
      return next;
    },
    {},
  );
  const [signingOut, startSignOut] = useTransition();
  const kept = !isAnonymous && email;

  return (
    <>
      <Group>
        {kept ? (
          <Row icon={<ShieldCheck className="size-5 text-green-ink" aria-hidden />} label="Account kept" detail={email} />
        ) : state.done ? (
          <Row icon={<ShieldCheck className="size-5 text-green-ink" aria-hidden />} label="Account kept" detail={state.done} />
        ) : state.pending ? (
          <Row icon={<MailCheck className="size-5 text-amber-ink" aria-hidden />} label="Confirm your email" detail={`We sent a link to ${state.pending}`} />
        ) : (
          <RowButton onClick={() => setOpen(true)} icon={<ShieldCheck className="size-5 text-ink-2" aria-hidden />} label="Keep this account" detail="Attach an email so your gardens survive a new phone" />
        )}
        {kept ? <RowButton onClick={() => setSignOutOpen(true)} icon={<LogOut className="size-5 text-ink-2" aria-hidden />} label="Sign out on this device" chevron={false} /> : null}
      </Group>
      <p className="mt-2 px-1 text-footnote text-ink-3">
        {kept || state.done
          ? "Sign in with that email on any device to find your gardens."
          : justKept
            ? "Your email is confirmed."
            : "Guest accounts live in this browser. Clearing browsing data signs you out for good unless you keep the account."}
      </p>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Keep this account"
        description="Add an email and you can sign in from any device. We only use it for sign-in links."
        footer={null}
      >
        {state.pending || state.done ? (
          <div className="flex flex-col gap-4">
            <p className="text-callout text-ink-2">
              {state.done ? `Done. ${state.done} is attached to this account.` : `Check ${state.pending} for a confirmation link and open it on this device.`}
            </p>
            <Button full onClick={() => setOpen(false)}>
              Got it
            </Button>
          </div>
        ) : (
          <form action={action} className="flex flex-col gap-4 pb-2">
            <Field label="Email">
              <TextInput name="email" type="email" autoComplete="email" inputMode="email" required placeholder="you@example.com" />
            </Field>
            {state.error ? (
              <Feedback tone="error">
                {state.error}
              </Feedback>
            ) : null}
            <Button type="submit" size="lg" full loading={pending}>
              Send confirmation
            </Button>
          </form>
        )}
      </Sheet>

      <Sheet
        open={signOutOpen}
        onClose={() => setSignOutOpen(false)}
        title="Sign out on this device?"
        description="Your gardens stay with your email. Sign back in any time with a link."
        footer={
          <div className="flex flex-col gap-2">
            <Button size="lg" full variant="danger" loading={signingOut} onClick={() => startSignOut(() => signOutAction())}>
              Sign out
            </Button>
            <Button variant="plain" full onClick={() => setSignOutOpen(false)}>
              Stay signed in
            </Button>
          </div>
        }
      >
        <p className="text-callout text-ink-2">Nothing is deleted.</p>
      </Sheet>
    </>
  );
}
