"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { useSlidingIndicator } from "./useSlidingIndicator";

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
  const { containerRef, rect } = useSlidingIndicator<HTMLDivElement>(value);

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
      <span
        aria-hidden
        className={cn("absolute top-1 bottom-1 rounded-[11px] bg-surface shadow-card", rect.ready && "transition-[transform,width] duration-[360ms] ease-[var(--ease-spring)]")}
        style={{ transform: `translateX(${rect.left}px)`, width: rect.width, opacity: rect.width ? 1 : 0 }}
      />
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
            className={cn("pressable relative z-10 flex flex-1 items-center justify-center rounded-[11px] px-2 text-callout font-semibold transition-colors", selected ? "text-ink" : "text-ink-2 hover:text-ink")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
