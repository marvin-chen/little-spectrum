"use client";

import { useRef } from "react";
import { Star } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/cn";
import type { Cell } from "@/lib/games/hueClue";
import { HUE_CLUE_COLS, HUE_CLUE_ROWS, PALETTE, textOn } from "@/lib/games/hueCluePalette";

export type GridMarker = { userId: string; col: number; row: number; avatar: string; name: string; mine?: boolean };

type Props = {
  selected: Cell | null;
  onSelect?: (cell: Cell) => void;
  target?: Cell | null;
  markers?: GridMarker[];
  disabled?: boolean;
  label: string;
};

export function ColorGrid({ selected, onSelect, target, markers = [], disabled, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const interactive = Boolean(onSelect) && !disabled;
  const focusCell = selected ?? { col: 0, row: 0 };

  function move(from: Cell, dc: number, dr: number) {
    const next = { col: Math.min(HUE_CLUE_COLS - 1, Math.max(0, from.col + dc)), row: Math.min(HUE_CLUE_ROWS - 1, Math.max(0, from.row + dr)) };
    onSelect?.(next);
    requestAnimationFrame(() => {
      ref.current?.querySelector<HTMLButtonElement>(`[data-col="${next.col}"][data-row="${next.row}"]`)?.focus();
    });
  }

  return (
    <div ref={ref} role="grid" aria-label={label} className="grid gap-[3px] rounded-row bg-fill p-1.5" style={{ gridTemplateColumns: `repeat(${HUE_CLUE_COLS}, minmax(0, 1fr))` }}>
      {PALETTE.map((row, r) => (
        <div key={r} role="row" className="contents">
          {row.map((c) => {
            const isSelected = selected?.col === c.col && selected?.row === c.row;
            const isTarget = target?.col === c.col && target?.row === c.row;
            const here = markers.filter((m) => m.col === c.col && m.row === c.row);
            const isFocusable = focusCell.col === c.col && focusCell.row === c.row;
            return (
              <button
                key={c.coord}
                type="button"
                role="gridcell"
                data-col={c.col}
                data-row={c.row}
                aria-label={`${c.coord}, ${c.label}${isTarget ? ", target" : ""}${here.length ? `, ${here.map((m) => m.name).join(" and ")}` : ""}`}
                aria-selected={isSelected || undefined}
                tabIndex={interactive ? (isFocusable ? 0 : -1) : -1}
                disabled={!interactive}
                onClick={() => onSelect?.({ col: c.col, row: c.row })}
                onKeyDown={(e) => {
                  const map: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
                  if (map[e.key]) {
                    e.preventDefault();
                    move({ col: c.col, row: c.row }, ...map[e.key]);
                  }
                }}
                className={cn(
                  "relative aspect-square min-w-0 rounded-[5px] outline-none transition-transform duration-150",
                  interactive && "cursor-pointer hover:scale-110 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-blue",
                  isSelected && "z-10 scale-110 ring-[3px] ring-ink",
                  isTarget && "z-10 ring-[3px] ring-ink",
                  here.length > 0 && !isTarget && "z-10 ring-2 ring-surface",
                  !interactive && "cursor-default",
                )}
                style={{ backgroundColor: c.hex }}
              >
                {isTarget ? <Star className="absolute inset-0 m-auto size-3/5" style={{ color: textOn(c.row) }} fill="currentColor" aria-hidden /> : null}
                {here.length > 0 ? (
                  <span className="absolute -top-2 -right-2 flex" aria-hidden>
                    {here.slice(0, 2).map((m, i) => (
                      <Avatar key={m.userId} avatar={m.avatar} name={m.name} size="xs" ring className={cn("!size-5 [&_svg]:!size-3", i > 0 && "-ml-2", m.mine && "ring-ink")} />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function Swatch({ cell, size = "lg", className }: { cell: Cell | null; size?: "md" | "lg"; className?: string }) {
  const def = cell ? PALETTE[cell.row][cell.col] : null;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn("shrink-0 rounded-row ring-1 ring-line", size === "lg" ? "size-16" : "size-11")}
        style={{ backgroundColor: def?.hex ?? "transparent" }}
        aria-hidden
      />
      <span className="min-w-0">
        <span className="block text-body font-semibold">{def ? def.coord : "Nothing picked yet"}</span>
        <span className="block text-footnote text-ink-2">{def ? def.label : "Tap a square to preview it here."}</span>
      </span>
    </div>
  );
}
