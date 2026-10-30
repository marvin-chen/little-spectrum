import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { leaf: "#5fb37c", leafDark: "#3f8f5f", bird: "#ff7a59", fruit: null },
  { leaf: "#4fb37a", leafDark: "#3f8f5f", bird: "#4f8cff", fruit: "#ff7a59" },
  { leaf: "#f7b3c4", leafDark: "#f26b8a", bird: "#f2a93b", fruit: null },
];

const CANOPY = [[34, 70, 14], [66, 70, 14], [50, 74, 16], [50, 58, 22]];
const FRUIT = [[38, 66], [58, 50], [64, 74], [46, 80]];

export function LittleTree({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Little tree"}</title>
      <path d="M42 112 Q46 104 46 78 L54 78 Q54 104 58 112 Z" fill="#b8865b" />
      <path d="M52 78 L54 78 Q54 104 58 112 L53 112 Q53 100 52 78 Z" fill="#96693f" />
      {CANOPY.map(([cx, cy, r]) => (
        <circle key={`d${cx},${cy}`} cx={cx + 2.5} cy={cy + 1.5} r={r} fill={p.leafDark} />
      ))}
      {CANOPY.map(([cx, cy, r]) => (
        <circle key={`l${cx},${cy}`} cx={cx} cy={cy} r={r} fill={p.leaf} />
      ))}
      <ellipse cx="40" cy="50" rx="7" ry="3.5" fill="#fbf7f0" opacity="0.4" transform="rotate(-30 40 50)" />
      {p.fruit
        ? FRUIT.map(([cx, cy]) => (
            <g key={`${cx},${cy}`}>
              <circle cx={cx} cy={cy} r="2.6" fill={p.fruit} />
              <circle cx={cx - 0.8} cy={cy - 0.8} r="0.7" fill="#fbf7f0" opacity="0.8" />
            </g>
          ))
        : null}
      <path d="M57 37 L54 34 L57.5 39 Z" fill={p.bird} />
      <ellipse cx="62" cy="38" rx="4.5" ry="3.3" fill={p.bird} />
      <circle cx="66" cy="35" r="2.6" fill={p.bird} />
      <path d="M68.2 34.6 L71 35.4 L68.2 36.2 Z" fill="#f2a93b" />
      <circle cx="66.6" cy="34.6" r="0.55" fill="#1f1b2e" />
      <ellipse cx="61" cy="38.5" rx="2.4" ry="1.4" fill="#fbf7f0" opacity="0.45" transform="rotate(-15 61 38.5)" />
    </svg>
  );
}
