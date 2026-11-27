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
};

// Large thumb, gradient track, and a value bubble that rides along.
export function Slider({ label, value, onChange, leftLabel, rightLabel, disabled }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-[72px]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-capsule bg-ink px-2.5 py-1 text-footnote font-bold text-canvas tabular-nums shadow-float transition-transform duration-150"
          style={{ left: `calc(${value}% + ${(50 - value) * 0.48}px)` }}
        >
          {value}
        </div>
        <div
          aria-hidden
          className="absolute inset-x-0 top-11 h-3.5 rounded-full bg-gradient-to-r from-coral-soft via-amber to-coral-deep shadow-[inset_0_1px_2px_rgba(20,18,33,0.15)]"
        />
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
            "absolute inset-x-0 top-7 m-0 h-11 w-full cursor-pointer appearance-none bg-transparent outline-none",
            "[&::-webkit-slider-runnable-track]:h-11 [&::-webkit-slider-runnable-track]:bg-transparent",
            "[&::-webkit-slider-thumb]:size-11 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(20,18,33,0.25),inset_0_0_0_4px_rgba(255,255,255,1),inset_0_0_0_6px_#e2552f]",
            "[&::-moz-range-track]:h-11 [&::-moz-range-track]:bg-transparent",
            "[&::-moz-range-thumb]:size-10 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(20,18,33,0.25),inset_0_0_0_4px_rgba(255,255,255,1),inset_0_0_0_6px_#e2552f]",
            "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-tint/50",
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
