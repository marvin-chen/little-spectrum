import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { stone: "#cfc9da", stoneDark: "#aea6c2", grass: "#5fb37c", grassDark: "#3f8f5f" },
  { stone: "#dcc9a9", stoneDark: "#bba58a", grass: "#4fb37a", grassDark: "#3f8f5f" },
  { stone: "#bccfd9", stoneDark: "#95adbb", grass: "#8bd1a0", grassDark: "#5fb37c" },
];

const STONES = [[24, 106, 14, 6], [52, 103, 12, 5.5], [78, 106, 12, 6]];
const TUFTS = [8, 38, 66, 92];

export function SteppingStones({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Stepping stones"}</title>
      {TUFTS.map((x, i) => (
        <path
          key={x}
          d={`M${x} 112 Q${x - 2} 105 ${x - 5} 100 M${x} 112 Q${x + 1} 104 ${x + 2} 98 M${x} 112 Q${x + 4} 107 ${x + 6} 103`}
          stroke={i % 2 === 0 ? p.grass : p.grassDark}
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      {STONES.map(([cx, cy, rx, ry]) => (
        <g key={cx}>
          <ellipse cx={cx + 1} cy={cy + 1.5} rx={rx} ry={ry} fill={p.stoneDark} />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={p.stone} />
          <ellipse cx={cx - rx * 0.3} cy={cy - ry * 0.35} rx={rx * 0.4} ry={ry * 0.3} fill="#fbf7f0" opacity="0.45" />
        </g>
      ))}
    </svg>
  );
}
