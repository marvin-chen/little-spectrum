"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, TextInput } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { cn } from "@/lib/cn";
import { THEMES, type ThemeKey } from "@/lib/themes";
import { createGardenAction, type CreateGardenState } from "./actions";

export function CreateGardenForm() {
  const [capacity, setCapacity] = useState<"2" | "8">("2");
  const [theme, setTheme] = useState<ThemeKey>("meadow");
  const [state, action, pending] = useActionState<CreateGardenState, FormData>(createGardenAction, {});

  function submit(formData: FormData) {
    let timezone = "UTC";
    try {
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    } catch {}
    formData.set("timezone", timezone);
    action(formData);
  }

  return (
    <form action={submit} className="flex flex-col gap-6">
      <input type="hidden" name="capacity" value={capacity} />
      <input type="hidden" name="theme" value={theme} />

      <div>
        <SegmentedControl
          label="Garden size"
          value={capacity}
          onChange={setCapacity}
          size="lg"
          options={[
            { value: "2", label: "Just us two" },
            { value: "8", label: "A group of friends" },
          ]}
        />
        <p className="mt-2 px-1 text-footnote text-ink-3">
          {capacity === "2"
            ? "Room for two. You can make space for up to eight later."
            : "Up to eight people, including you."}
        </p>
      </div>

      <Field label="Garden name">
        <TextInput
          name="name"
          maxLength={40}
          required
          placeholder={capacity === "2" ? "Our little patch" : "The Thursday crew"}
        />
      </Field>

      <fieldset>
        <legend className="mb-2 px-1 text-footnote font-semibold text-ink-2">Starting theme</legend>
        <div role="radiogroup" aria-label="Starting theme" className="grid grid-cols-2 gap-3">
          {Object.values(THEMES).map((t) => {
            const selected = t.key === theme;
            return (
              <button
                key={t.key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(t.key)}
                className={cn(
                  "pressable overflow-hidden rounded-tile bg-surface text-left shadow-card ring-1 ring-line",
                  selected && "ring-2 ring-ink",
                )}
              >
                <span
                  aria-hidden
                  className="block h-16"
                  style={{
                    background: `linear-gradient(180deg, ${t.skyTop} 0%, ${t.skyBottom} 55%, ${t.hillFront} 56%, ${t.ground} 100%)`,
                  }}
                />
                <span className="block px-3 py-2">
                  <span className="block text-callout font-semibold">{t.name}</span>
                  <span className="block text-caption text-ink-3">{t.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {state.error ? (
        <p role="alert" className="rounded-row bg-danger-soft px-4 py-3 text-callout text-danger">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" size="lg" full loading={pending}>
        Create garden
      </Button>
    </form>
  );
}
