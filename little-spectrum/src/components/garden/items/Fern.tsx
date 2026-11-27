import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { leaf: "#5fb37c", leafDark: "#3f8f5f", leafLight: "#8bd1a0", stem: "#3f8f5f" },
  { leaf: "#8bd1a0", leafDark: "#5fb37c", leafLight: "#b9e6c6", stem: "#5fb37c" },
  { leaf: "#4fb37a", leafDark: "#2f6f49", leafLight: "#8bd1a0", stem: "#2f6f49" },
];

const FRONDS = [
  { angle: -58, len: 44, back: true },
  { angle: 58, len: 44, back: true },
  { angle: -30, len: 54, back: false },
  { angle: 30, len: 54, back: false },
  { angle: 0, len: 60, back: false },
];
const LEAFLETS = [1, 2, 3, 4, 5, 6, 7];

export function Fern({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Fern"}</title>
      {FRONDS.map(({ angle, len, back }) => (
        <g key={angle} transform={`translate(50 111) rotate(${angle})`}>
          <path d={`M0 0 L0 ${-len * 0.9}`} stroke={p.stem} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          {LEAFLETS.map((n) => {
            const y = (-len * n) / 8;
            const s = 1.05 - n * 0.1;
            const fill = back ? p.leafDark : n >= 6 ? p.leafLight : p.leaf;
            return (
              <g key={n}>
                <ellipse
                  cx={-5.5 * s}
                  cy={y}
                  rx={7.5 * s}
                  ry={3.2 * s}
                  fill={fill}
                  transform={`rotate(-40 ${-5.5 * s} ${y})`}
                />
                <ellipse
                  cx={5.5 * s}
                  cy={y}
                  rx={7.5 * s}
                  ry={3.2 * s}
                  fill={fill}
                  transform={`rotate(40 ${5.5 * s} ${y})`}
                />
              </g>
            );
          })}
          <ellipse cx="0" cy={-len + 2} rx="2.4" ry="4" fill={back ? p.leaf : p.leafLight} />
        </g>
      ))}
      <ellipse cx="50" cy="111" rx="6" ry="2.5" fill={p.stem} />
    </svg>
  );
}
