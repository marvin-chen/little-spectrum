import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { cap: "#ff7a59", capDark: "#e0603f", stem: "#f4e9d8", stemDark: "#e2d2ba" },
  { cap: "#f26b8a", capDark: "#d14f70", stem: "#f4e9d8", stemDark: "#e2d2ba" },
  { cap: "#f2a93b", capDark: "#d48c24", stem: "#f7efe2", stemDark: "#e6d8c2" },
];

const MUSHROOMS = [
  { cx: 28, capY: 100, rx: 8, ry: 6, sw: 6, spots: [[-3, -2.5, 1.2]] },
  { cx: 66, capY: 94, rx: 12, ry: 9, sw: 8, spots: [[-4, -3, 2], [4, -5, 1.4]] },
  { cx: 44, capY: 84, rx: 18, ry: 14, sw: 11, spots: [[-7, -4, 2.6], [3, -9, 2], [7, -2, 1.6]] },
];

export function Mushrooms({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Mushroom cluster"}</title>
      {MUSHROOMS.map(({ cx, capY, rx, ry, sw, spots }) => (
        <g key={cx}>
          <rect x={cx - sw / 2} y={capY - 2} width={sw} height={114 - capY} rx={sw / 3} fill={p.stem} />
          <rect x={cx + sw / 2 - sw / 3} y={capY - 2} width={sw / 3} height={114 - capY} rx={sw / 6} fill={p.stemDark} />
          <path d={`M${cx - rx} ${capY} A${rx} ${ry} 0 0 1 ${cx + rx} ${capY} Z`} fill={p.capDark} />
          <path d={`M${cx - rx} ${capY} A${rx - 2} ${ry} 0 0 1 ${cx + rx - 4} ${capY} Z`} fill={p.cap} />
          <ellipse cx={cx} cy={capY} rx={rx} ry={1.8} fill={p.capDark} />
          {spots.map(([dx, dy, r]) => (
            <circle key={`${dx},${dy}`} cx={cx + dx} cy={capY + dy} r={r} fill="#fbf7f0" opacity="0.9" />
          ))}
          <ellipse cx={cx - rx * 0.45} cy={capY - ry * 0.75} rx={rx * 0.18} ry={ry * 0.1} fill="#fbf7f0" opacity="0.4" transform={`rotate(-30 ${cx - rx * 0.45} ${capY - ry * 0.75})`} />
        </g>
      ))}
    </svg>
  );
}
