"use client";

import { useId, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export type SegmentOption<T extends string> = { value: T; label: string; description?: string };

type Props<T extends string> = {
  label: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "md" | "lg";
};

export function SegmentedControl<T extends string>({ label, options, value, onChange, className, size = "md" }: Props<T>) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = options.findIndex((o) => o.value === value);
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % options.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else return;
    event.preventDefault();
    onChange(options[next].value);
    containerRef.current?.querySelectorAll<HTMLButtonElement>("[role=radio]")[next]?.focus();
  }

  return (
    <div
      ref={containerRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("relative flex w-full rounded-[14px] bg-fill p-1", size === "lg" ? "h-12" : "h-10", className)}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            id={`${id}-${option.value}`}
            type="button"
            role="radio"
            data-key={option.value}
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              "pressable relative z-10 flex flex-1 items-center justify-center rounded-[11px] px-2 text-callout font-semibold transition-colors",
              selected ? "text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {selected ? (
              <motion.span
                layoutId={`${id}-pill`}
                aria-hidden
                transition={{ type: "spring", stiffness: 520, damping: 38, mass: 0.8 }}
                className="glass absolute inset-0 -z-10 rounded-[11px] bg-surface shadow-card"
              />
            ) : null}
            <span className="relative z-10">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
