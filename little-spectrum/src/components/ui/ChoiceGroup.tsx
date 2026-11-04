"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, type ColorKey } from "@/lib/colors";

export type ChoiceOption<T extends string> = { value: T; label: string; disabled?: boolean };
export type ChoiceGroupProps<T extends string> = {
  label: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  accent?: ColorKey;
  disabled?: boolean;
};

// Native radios supply group navigation and form semantics without global DOM IDs.
export function ChoiceGroup<T extends string>({ label, options, value, onChange, accent = "rose", disabled }: ChoiceGroupProps<T>) {
  const name = useId();
  const colors = COLOR_CLASSES[accent];
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-col gap-2">
      {options.map((option) => (
        <label key={option.value} className="relative block">
          <input type="radio" name={name} value={option.value} checked={value === option.value}
            disabled={disabled || option.disabled} onChange={() => onChange(option.value)} className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed" />
          <span className={cn(
            "pressable flex min-h-11 w-full items-center gap-3 rounded-row px-4 py-2.5 text-left text-body",
            "peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-tint peer-disabled:opacity-45 peer-disabled:cursor-not-allowed",
            value === option.value ? cn(colors.soft, colors.ink, "ring-2 ring-current font-semibold") : "bg-fill text-ink hover:bg-fill-2",
          )}>
            <span className="flex-1">{option.label}</span>
            {value === option.value ? <Check className="size-5 shrink-0" aria-hidden /> : null}
          </span>
        </label>
      ))}
    </div>
  );
}
