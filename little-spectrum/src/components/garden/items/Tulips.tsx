import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES: [string, string][][] = [
  [["#ff7a59", "#e0603f"], ["#f2a93b", "#d48c24"], ["#f26b8a", "#d14f70"]],
  [["#f26b8a", "#d14f70"], ["#8b6cf0", "#6f52d1"], ["#ff7a59", "#e0603f"]],
  [["#8b6cf0", "#6f52d1"], ["#4f8cff", "#3a6fd6"], ["#f26b8a", "#d14f70"]],
];

const TULIPS = [
  { x: 31, base: 66 },
  { x: 69, base: 70 },
  { x: 50, base: 58 },
];

export function Tulips({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const palette = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Tulip trio"}</title>
      {TULIPS.map(({ x, base }, i) => {
        const [fill, shade] = palette[i];
        const h = 112 - base;
        const flip = i === 1 ? -1 : 1;
        return (
          <g key={i} transform={`translate(${x} ${base})`}>
            <path d={`M0 ${h} C-10 ${h - 8} -13 ${h - 22} -8 ${h - 36} C-2 ${h - 24} 0 ${h - 14} 0 ${h} Z`} fill="#5fb37c" transform={`scale(${flip} 1)`} />
            <path d={`M0 ${h} C3 ${h - 6} 4 ${h - 16} 2 ${h - 22} C-1 ${h - 16} -1 ${h - 8} 0 ${h} Z`} fill="#3f8f5f" transform={`scale(${-flip} 1)`} />
            <path d={`M0 ${h} L0 -2`} stroke="#4fb37a" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M-9 -12 Q-10 -20 -5 -24 L-2 -15 L0 -24 L2 -15 L5 -24 Q10 -20 9 -12 Q9 -1 0 0 Q-9 -1 -9 -12 Z" fill={fill} />
            <path d="M5 -24 Q10 -20 9 -12 Q9 -1 0 0 Q5 -4 5 -12 Z" fill={shade} />
            <ellipse cx="-4.5" cy="-14" rx="1.8" ry="4" fill="#fbf7f0" opacity="0.45" />
          </g>
        );
      })}
    </svg>
  );
}
