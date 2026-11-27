"use client";

import { useState, type ReactNode } from "react";
import { Check, Settings } from "lucide-react";
import { Button, IconButton } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChoiceGroup } from "@/components/ui/ChoiceGroup";
import { ConfirmationSheet } from "@/components/ui/ConfirmationSheet";
import { Feedback } from "@/components/ui/Feedback";
import { Field, TextInput } from "@/components/ui/Field";

function Example({
  id,
  title,
  guidance,
  code,
  children,
}: {
  id: string;
  title: string;
  guidance: string;
  code: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20">
      <h2 id={`${id}-title`} className="mb-2 text-title-2 font-bold">
        {title}
      </h2>
      <p className="mb-3 text-callout text-ink-2">{guidance}</p>
      <Card className="flex flex-col gap-4 p-4">{children}</Card>
      <pre className="mt-3 max-w-full overflow-x-auto rounded-control bg-fill p-4 text-footnote">
        <code>{code}</code>
      </pre>
    </section>
  );
}

export function ComponentExamples() {
  const [name, setName] = useState("");
  const [error, setError] = useState<string>();
  const [saved, setSaved] = useState(false);
  const [choice, setChoice] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [fail, setFail] = useState(false);
  const [confirmationError, setConfirmationError] = useState<string>();

  async function confirm() {
    setPending(true);
    setConfirmationError(undefined);
    // Demo-only latency; production callers use their action's pending state.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPending(false);
    if (fail) setConfirmationError("Example request failed. Try again or cancel.");
    else {
      setOpen(false);
      setConfirmed(true);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-group bg-surface p-5">
        <h2 className="text-title-2 font-bold">Build with shared components</h2>
        <p className="mt-2 text-callout text-ink-2">
          These examples use the same controls as the app. Import by component module. Keep data access in the feature;
          pass values and callbacks to UI. See UI.md for the complete contributor contract.
        </p>
        <nav
          aria-label="Component examples"
          className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-callout text-tint-ink underline"
        >
          <a href="#actions">Actions</a>
          <a href="#forms">Forms</a>
          <a href="#selection">Selection</a>
          <a href="#confirmation">Confirmation</a>
          <a href="#feedback">Feedback</a>
          <a href="#foundations">Foundations</a>
        </nav>
      </div>
      <Example
        id="actions"
        title="Actions and states"
        guidance="Use buttons for actions and ButtonLink for navigation. Keep action text while loading. IconButton requires a name and has a 44px target."
        code={
          'import { Button, IconButton } from "@/components/ui/Button";\n\n<Button loading={pending} type="submit">Save</Button>\n<IconButton label="Settings" icon={<Settings aria-hidden />} />'
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={<Check className="size-4" aria-hidden />}>Ready</Button>
          <Button loading>Saving</Button>
          <Button disabled>Unavailable</Button>
          <IconButton
            label="Example settings"
            variant="glass"
            icon={<Settings className="size-5" aria-hidden />}
            onClick={() => {
              setConfirmationError(undefined);
              setOpen(true);
            }}
          />
        </div>
      </Example>
      <Example
        id="forms"
        title="Forms and validation"
        guidance="Field connects a label, hint, and field-specific error to one input. Submit this empty form to inspect its error. Backend failures belong in Feedback."
        code={
          'import { Field, TextInput } from "@/components/ui/Field";\n\n<Field label="Name" hint="Up to 40 characters." error={error}>\n  <TextInput value={name} onChange={e => setName(e.target.value)} />\n</Field>'
        }
      >
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSaved(false);
            if (!name.trim()) setError("Enter a garden name.");
            else {
              setError(undefined);
              setSaved(true);
            }
          }}
        >
          <Field label="Example garden name" hint="Up to 40 characters." error={error}>
            <TextInput
              value={name}
              maxLength={40}
              onChange={(event) => {
                setName(event.target.value);
                setSaved(false);
              }}
            />
          </Field>
          <Field label="Read-only example">
            <TextInput readOnly value="Our garden" />
          </Field>
          <Field label="Disabled example">
            <TextInput disabled value="Not available yet" />
          </Field>
          <Button type="submit">Save example</Button>
          {saved ? <Feedback tone="success">Example saved.</Feedback> : null}
        </form>
      </Example>
      <Example
        id="selection"
        title="Answer selection"
        guidance="Use ChoiceGroup for a vertical list and SegmentedControl for short inline choices. Native radios support arrow keys and skip disabled options. Selection does not submit the answer."
        code={
          'import { ChoiceGroup } from "@/components/ui/ChoiceGroup";\n\n<ChoiceGroup label="Your pick" value={pick} onChange={setPick}\n  options={[{ value: "walk", label: "A walk" }]} />'
        }
      >
        <ChoiceGroup
          label="Example activity"
          value={choice}
          onChange={setChoice}
          options={[
            { value: "walk", label: "A walk outside" },
            { value: "trip", label: "A trip (unavailable)", disabled: true },
            { value: "film", label: "A film with friends and a very long conversation afterward" },
          ]}
        />
        <Button disabled={choice === null}>Lock in example</Button>
      </Example>
      <Example
        id="confirmation"
        title="Confirmation pattern"
        guidance="Describe the consequence and name the action. Pending requests block duplicate confirmation and dismissal. Errors stay inside the dialog; a successful caller closes it."
        code={
          'import { ConfirmationSheet } from "@/components/ui/ConfirmationSheet";\n\n<ConfirmationSheet open={open} onClose={close} onConfirm={save}\n  title="Save changes?" description="Your friends will see them."\n  confirmLabel="Save changes" pending={pending} error={error} />'
        }
      >
        <label className="flex min-h-11 items-center gap-3 text-callout">
          <input type="checkbox" checked={fail} onChange={(event) => setFail(event.target.checked)} />
          Simulate request failure
        </label>
        <Button
          variant="glass"
          onClick={() => {
            setConfirmationError(undefined);
            setOpen(true);
          }}
        >
          Open confirmation example
        </Button>
        {confirmed ? <Feedback tone="success">Example confirmed.</Feedback> : null}
        <ConfirmationSheet
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={confirm}
          title="Confirm example?"
          description="This only changes the preview. No garden data is saved."
          confirmLabel="Confirm example"
          pending={pending}
          error={confirmationError}
        >
          <p className="text-callout text-ink-2">Try Tab, Shift+Tab, and Escape. Focus returns to the opener.</p>
        </ConfirmationSheet>
      </Example>
      <Example
        id="feedback"
        title="Waiting and feedback"
        guidance="Use status for updates and alert for errors. Describe the next step. Keep loading, empty, and error states distinct."
        code={
          'import { Feedback } from "@/components/ui/Feedback";\n\n<Feedback>Waiting for Jamie’s answer.</Feedback>\n<Feedback tone="error">Could not save. Try again.</Feedback>'
        }
      >
        <Feedback>Two of three answers are in. Waiting for Jamie.</Feedback>
        <Feedback tone="success">Your answer is saved.</Feedback>
        <Feedback tone="error">Could not save your answer. Try again.</Feedback>
      </Example>
    </div>
  );
}
