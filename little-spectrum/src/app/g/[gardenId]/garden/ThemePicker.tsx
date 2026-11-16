"use client";

import { useState, useTransition } from "react";
import { Palette } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { THEMES, type ThemeKey } from "@/lib/themes";
import { updateThemeAction } from "./actions";

export function ThemePicker({ gardenId, current }: { gardenId: string; current: string }) {
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<ThemeKey>((current as ThemeKey) in THEMES ? (current as ThemeKey) : "meadow");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Change garden theme" className="glass pressable absolute top-3 right-3 flex size-10 items-center justify-center rounded-capsule text-ink">
        <Palette className="size-5" aria-hidden />
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Garden theme"
        description="Sky, hills, and the accent color across the garden. Keepsakes stay where they are."
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
              loading={pending}
              disabled={choice === current}
              onClick={() =>
                startTransition(async () => {
                  const result = await updateThemeAction(gardenId, choice);
                  if (result.error) setError(result.error);
                  else {
                    setOpen(false);
                    toast.success(`Theme set to ${THEMES[choice].name}`);
                  }
                })
              }
            >
              Use this theme
            </Button>
          </div>
        }
      >
        <div role="radiogroup" aria-label="Theme" className="grid grid-cols-2 gap-3">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.key}
              type="button"
              role="radio"
              aria-checked={choice === t.key}
              onClick={() => setChoice(t.key)}
              className={cn("pressable overflow-hidden rounded-tile bg-surface text-left shadow-card ring-1 ring-line", choice === t.key && "ring-2 ring-ink")}
            >
              <span aria-hidden className="block h-14" style={{ background: `linear-gradient(180deg, ${t.skyTop} 0%, ${t.skyBottom} 55%, ${t.hillFront} 56%, ${t.ground} 100%)` }} />
              <span className="flex items-center gap-2 px-3 py-2">
                <span className="size-3 rounded-full" style={{ background: t.tint }} aria-hidden />
                <span className="text-callout font-semibold">{t.name}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
