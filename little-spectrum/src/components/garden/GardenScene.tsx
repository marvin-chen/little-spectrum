import { getGardenItem } from "@/components/garden/items";
import { themeFor } from "@/lib/themes";

export type PlacedItem = { id: string; itemKey: string; variant: number; ordinal: number };

type Slot = { x: number; baseline: number; scale: number };

// Deterministic slots, filled in order. Front row first so early items feel close.
const SLOTS: Slot[] = [
  { x: 205, baseline: 182, scale: 1 },
  { x: 120, baseline: 184, scale: 0.95 },
  { x: 290, baseline: 184, scale: 0.95 },
  { x: 60, baseline: 178, scale: 0.85 },
  { x: 350, baseline: 178, scale: 0.85 },
  { x: 165, baseline: 160, scale: 0.75 },
  { x: 250, baseline: 160, scale: 0.75 },
  { x: 95, baseline: 158, scale: 0.7 },
  { x: 320, baseline: 158, scale: 0.7 },
  { x: 25, baseline: 170, scale: 0.7 },
  { x: 380, baseline: 170, scale: 0.7 },
  { x: 205, baseline: 142, scale: 0.6 },
  { x: 135, baseline: 140, scale: 0.55 },
  { x: 275, baseline: 140, scale: 0.55 },
  { x: 60, baseline: 146, scale: 0.55 },
  { x: 350, baseline: 146, scale: 0.55 },
  { x: 180, baseline: 192, scale: 0.6 },
  { x: 240, baseline: 192, scale: 0.6 },
  { x: 100, baseline: 196, scale: 0.55 },
  { x: 310, baseline: 196, scale: 0.55 },
  { x: 30, baseline: 194, scale: 0.5 },
  { x: 375, baseline: 194, scale: 0.5 },
  { x: 150, baseline: 128, scale: 0.45 },
  { x: 260, baseline: 128, scale: 0.45 },
];

const FOOTPRINT_WIDTH = { small: 44, medium: 60, large: 78 };

export function slotFor(ordinal: number): Slot {
  return SLOTS[(ordinal - 1) % SLOTS.length];
}

type Props = {
  theme: string;
  items: PlacedItem[];
  compact?: boolean;
  className?: string;
  selectable?: boolean;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
};

export function GardenScene({ theme, items, compact, className, selectable, onSelect, selectedId }: Props) {
  const t = themeFor(theme);
  const sorted = [...items].sort((a, b) => slotFor(a.ordinal).baseline - slotFor(b.ordinal).baseline);
  return (
    <svg
      viewBox={compact ? "0 30 400 180" : "0 0 400 210"}
      className={className}
      role="img"
      aria-label={items.length === 0 ? "An empty garden, ready to grow" : `A garden with ${items.length} ${items.length === 1 ? "item" : "items"}`}
    >
      <defs>
        <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.skyTop} />
          <stop offset="1" stopColor={t.skyBottom} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="210" fill="url(#ls-sky)" />
      <circle cx="330" cy="52" r="22" fill={t.sun} opacity="0.9" />
      <ellipse cx="90" cy="150" rx="190" ry="48" fill={t.hillBack} />
      <ellipse cx="330" cy="158" rx="170" ry="42" fill={t.hillFront} />
      <rect x="0" y="170" width="400" height="40" fill={t.ground} />
      <ellipse cx="200" cy="172" rx="240" ry="14" fill={t.ground} />
      {items.length === 0 ? (
        <g aria-hidden>
          <ellipse cx="200" cy="182" rx="26" ry="6" fill="rgba(0,0,0,0.08)" />
          <path d="M194 182 q6 -14 12 0" stroke="#5a8f6a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      ) : null}
      {sorted.map((item) => {
        const def = getGardenItem(item.itemKey);
        if (!def) return null;
        const slot = slotFor(item.ordinal);
        const width = FOOTPRINT_WIDTH[def.footprint] * slot.scale;
        const height = width * 1.2;
        const x = slot.x - width / 2;
        const y = slot.baseline - height * (112 / 120);
        const Item = def.Component;
        const selected = selectedId === item.id;
        const content = (
          <svg x={x} y={y} width={width} height={height} viewBox="0 0 100 120" overflow="visible">
            {selected ? <ellipse cx="50" cy="112" rx="46" ry="9" fill="rgba(31,27,46,0.18)" /> : null}
            <Item variant={item.variant} title={def.name} />
          </svg>
        );
        if (!selectable) return <g key={item.id}>{content}</g>;
        return (
          <g
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`${def.name}, earned ${item.ordinal === 1 ? "first" : `as item ${item.ordinal}`}`}
            onClick={() => onSelect?.(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(item.id);
              }
            }}
            className="cursor-pointer outline-none focus-visible:[&>svg]:drop-shadow-[0_0_4px_rgba(79,140,255,0.9)]"
          >
            {content}
          </g>
        );
      })}
    </svg>
  );
}
