import { useId } from "react";
import { getGardenItem } from "@/components/garden/items";
import { mix, skyFor, themeFor } from "@/lib/themes";

export type PlacedItem = { id: string; itemKey: string; variant: number; ordinal: number };

type Slot = { x: number; baseline: number; scale: number };

// Deterministic slots, filled in order. Front row first so early items feel close.
const SLOTS: Slot[] = [
  { x: 205, baseline: 186, scale: 1 },
  { x: 118, baseline: 188, scale: 0.95 },
  { x: 292, baseline: 188, scale: 0.95 },
  { x: 58, baseline: 182, scale: 0.85 },
  { x: 352, baseline: 182, scale: 0.85 },
  { x: 165, baseline: 164, scale: 0.75 },
  { x: 250, baseline: 164, scale: 0.75 },
  { x: 95, baseline: 162, scale: 0.7 },
  { x: 320, baseline: 162, scale: 0.7 },
  { x: 25, baseline: 174, scale: 0.7 },
  { x: 382, baseline: 174, scale: 0.7 },
  { x: 205, baseline: 146, scale: 0.6 },
  { x: 135, baseline: 144, scale: 0.55 },
  { x: 275, baseline: 144, scale: 0.55 },
  { x: 60, baseline: 150, scale: 0.55 },
  { x: 350, baseline: 150, scale: 0.55 },
  { x: 180, baseline: 196, scale: 0.6 },
  { x: 240, baseline: 196, scale: 0.6 },
  { x: 100, baseline: 200, scale: 0.55 },
  { x: 310, baseline: 200, scale: 0.55 },
  { x: 30, baseline: 198, scale: 0.5 },
  { x: 375, baseline: 198, scale: 0.5 },
  { x: 150, baseline: 132, scale: 0.45 },
  { x: 260, baseline: 132, scale: 0.45 },
];

const FOOTPRINT_WIDTH = { small: 54, medium: 72, large: 92 };

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
  animate?: boolean;
  hour?: number;
};

export function GardenScene({ theme, items, compact, className, selectable, onSelect, selectedId, animate, hour = 12 }: Props) {
  const t = themeFor(theme);
  const sky = skyFor(t, hour);
  const shade = (hex: string) => (sky.night ? mix(hex, "#2b2f55", 0.3) : hex);
  const uid = useId();
  const skyId = `${uid}-sky`;
  const sunId = `${uid}-sun`;
  const groundId = `${uid}-ground`;
  const sorted = [...items].sort((a, b) => slotFor(a.ordinal).baseline - slotFor(b.ordinal).baseline);
  return (
    <svg
      viewBox={compact ? "0 54 400 160" : "0 18 400 196"}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={items.length === 0 ? "An empty garden, ready to grow" : `A garden with ${items.length} ${items.length === 1 ? "item" : "items"}`}
    >
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
        <radialGradient id={sunId} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={sky.sun} stopOpacity={sky.night ? 0.5 : 0.9} />
          <stop offset="0.55" stopColor={sky.sun} stopOpacity={sky.night ? 0.18 : 0.35} />
          <stop offset="1" stopColor={sky.sun} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={groundId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(t.ground)} />
          <stop offset="1" stopColor={shade(t.ground)} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="400" height="214" fill={`url(#${skyId})`} />
      <circle cx="322" cy="64" r="44" fill={`url(#${sunId})`} />
      <circle cx="322" cy="64" r="16" fill={sky.sun} />
      {sky.night ? (
        <g fill="#ffffff" opacity="0.8">
          <circle cx="60" cy="40" r="1.2" />
          <circle cx="130" cy="30" r="0.9" />
          <circle cx="200" cy="48" r="1.1" />
          <circle cx="250" cy="26" r="0.8" />
          <circle cx="90" cy="76" r="0.8" />
          <circle cx="170" cy="70" r="1" />
        </g>
      ) : null}
      <g fill="#ffffff" opacity={sky.night ? 0.12 : 0.55}>
        <ellipse cx="90" cy="62" rx="30" ry="9" />
        <ellipse cx="108" cy="56" rx="20" ry="10" />
        <ellipse cx="250" cy="42" rx="22" ry="7" />
        <ellipse cx="262" cy="38" rx="14" ry="7" />
      </g>
      <ellipse cx="80" cy="156" rx="200" ry="48" fill={shade(t.hillBack)} />
      <ellipse cx="340" cy="164" rx="180" ry="42" fill={shade(t.hillFront)} />
      <rect x="0" y="176" width="400" height="40" fill={`url(#${groundId})`} />
      <ellipse cx="200" cy="178" rx="250" ry="14" fill={shade(t.ground)} />
      <g opacity="0.18" fill="#ffffff">
        <ellipse cx="60" cy="196" rx="16" ry="2" />
        <ellipse cx="330" cy="204" rx="22" ry="2.5" />
        <ellipse cx="180" cy="206" rx="12" ry="2" />
      </g>
      {items.length === 0 ? (
        <g aria-hidden>
          <ellipse cx="200" cy="187" rx="22" ry="5" fill="rgba(20,18,33,0.10)" />
          <path d="M200 186 q0 -14 -8 -20" stroke="#4e8a62" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <path d="M200 186 q0 -10 8 -16" stroke="#5fa374" strokeWidth="2.2" fill="none" strokeLinecap="round" />
          <ellipse cx="190" cy="165" rx="6" ry="3.5" fill="#6cb77f" transform="rotate(-35 190 165)" />
          <ellipse cx="210" cy="169" rx="5" ry="3" fill="#8bd1a0" transform="rotate(35 210 169)" />
        </g>
      ) : null}
      {sorted.map((item, index) => {
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
          <g className={animate ? "anim-grow" : undefined} style={animate ? ({ "--i": index, transformOrigin: `${slot.x}px ${slot.baseline}px` } as React.CSSProperties) : undefined}>
            <ellipse cx={slot.x} cy={slot.baseline + 1} rx={width * 0.42} ry={width * 0.08} fill="rgba(20,18,33,0.12)" />
            {selected ? <ellipse cx={slot.x} cy={slot.baseline + 1} rx={width * 0.5} ry={width * 0.11} fill="none" stroke="#141221" strokeWidth="1.5" strokeDasharray="3 3" /> : null}
            <svg x={x} y={y} width={width} height={height} viewBox="0 0 100 120" overflow="visible">
              <Item variant={item.variant} title={def.name} />
            </svg>
          </g>
        );
        if (!selectable) return <g key={item.id}>{content}</g>;
        return (
          <g
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`${def.name}, item ${item.ordinal}`}
            onClick={() => onSelect?.(item.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect?.(item.id);
              }
            }}
            className="cursor-pointer outline-none focus-visible:[&>g>svg]:drop-shadow-[0_0_6px_rgba(59,130,246,0.9)]"
          >
            {content}
          </g>
        );
      })}
    </svg>
  );
}
