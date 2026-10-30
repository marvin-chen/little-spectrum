"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type Props = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
  disabled?: boolean;
  accentClass?: string;
};

export function Slider({ label, value, onChange, leftLabel, rightLabel, disabled, accentClass = "bg-coral" }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-1 -translate-x-1/2 rounded-capsule bg-ink px-2.5 py-1 text-footnote font-bold text-ivory tabular-nums"
          style={{ left: `calc(${value}% + ${(50 - value) * 0.44}px)` }}
        >
          {value}
        </div>
        <div aria-hidden className="absolute inset-x-0 top-9 h-3 rounded-full bg-gradient-to-r from-coral-soft via-amber-soft to-coral" />
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          disabled={disabled}
          aria-label={label}
          aria-valuetext={`${value} of 100, between ${leftLabel} and ${rightLabel}`}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "absolute inset-x-0 top-5 m-0 h-11 w-full cursor-pointer appearance-none bg-transparent outline-none",
            "[&::-webkit-slider-runnable-track]:h-11 [&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-webkit-slider-thumb]:-mt-0 [&::-webkit-slider-thumb]:size-11 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[6px] [&::-webkit-slider-thumb]:border-surface [&::-webkit-slider-thumb]:shadow-float",
            "[&::-moz-range-track]:h-11 [&::-moz-range-track]:bg-transparent",
            "[&::-moz-range-thumb]:size-9 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[6px] [&::-moz-range-thumb]:border-surface [&::-moz-range-thumb]:shadow-float",
            "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-blue/50",
            `[&::-webkit-slider-thumb]:${accentClass} [&::-moz-range-thumb]:${accentClass}`,
            "disabled:cursor-default disabled:opacity-60",
          )}
        />
      </div>
      <div className="flex justify-between text-footnote font-semibold text-ink-2">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  );
}
