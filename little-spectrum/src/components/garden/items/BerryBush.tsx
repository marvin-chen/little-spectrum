import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { leaf: "#5fb37c", leafDark: "#3f8f5f", berry: "#f26b8a", berryDark: "#d14f70" },
  { leaf: "#4fb37a", leafDark: "#3f8f5f", berry: "#8b6cf0", berryDark: "#6f52d1" },
  { leaf: "#8bd1a0", leafDark: "#5fb37c", berry: "#ff7a59", berryDark: "#e0603f" },
];

const BLOBS = [
  [50, 92, 20],
  [33, 100, 12],
  [67, 100, 12],
  [40, 84, 12],
  [60, 84, 12],
];
const BERRIES = [
  [40, 90],
  [58, 82],
  [50, 100],
  [34, 103],
  [67, 97],
  [62, 106],
  [46, 78],
];

export function BerryBush({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Berry bush"}</title>
      {BLOBS.map(([cx, cy, r]) => (
        <circle key={`d${cx}`} cx={cx + 2.5} cy={cy} r={r} fill={p.leafDark} />
      ))}
      {BLOBS.map(([cx, cy, r]) => (
        <circle key={`l${cx}`} cx={cx} cy={cy} r={r} fill={p.leaf} />
      ))}
      <ellipse cx="42" cy="79" rx="7" ry="3.5" fill="#fbf7f0" opacity="0.35" transform="rotate(-25 42 79)" />
      {BERRIES.map(([cx, cy]) => (
        <g key={`${cx},${cy}`}>
          <circle cx={cx} cy={cy} r="3.4" fill={p.berryDark} />
          <circle cx={cx - 0.6} cy={cy - 0.6} r="2.8" fill={p.berry} />
          <circle cx={cx - 1.3} cy={cy - 1.3} r="0.9" fill="#fbf7f0" opacity="0.8" />
        </g>
      ))}
    </svg>
  );
}
