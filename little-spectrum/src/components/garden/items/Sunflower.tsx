import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { petal: "#f2a93b", petalDark: "#d48c24", seed: "#7a5230", seedLight: "#96693f" },
  { petal: "#ff7a59", petalDark: "#e0603f", seed: "#6b4528", seedLight: "#8a5c38" },
  { petal: "#f5c84a", petalDark: "#e0a62a", seed: "#5c4a3a", seedLight: "#7a6350" },
];

const PETALS = Array.from({ length: 14 }, (_, i) => (i * 360) / 14);
const SEEDS = [
  [-5, -3],
  [0, -5],
  [5, -3],
  [-5, 3],
  [0, 5],
  [5, 3],
  [0, 0],
];

export function Sunflower({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Sunflower"}</title>
      <path d="M50 112 L50 54" stroke="#3f8f5f" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M50 90 C40 92 28 86 26 74 C38 72 48 80 50 90 Z" fill="#5fb37c" />
      <path d="M50 100 C60 102 72 96 74 84 C62 82 52 90 50 100 Z" fill="#3f8f5f" />
      <path d="M49 89 Q40 84 31 76" stroke="#3f8f5f" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
      {PETALS.map((a) => (
        <ellipse
          key={`b${a}`}
          cx="50"
          cy="23"
          rx="5"
          ry="10.5"
          fill={p.petalDark}
          transform={`rotate(${a + 12.8} 50 40)`}
        />
      ))}
      {PETALS.map((a) => (
        <ellipse key={`f${a}`} cx="50" cy="24" rx="4.6" ry="9.5" fill={p.petal} transform={`rotate(${a} 50 40)`} />
      ))}
      <circle cx="50" cy="40" r="12.5" fill={p.seed} />
      <circle cx="49" cy="39" r="10" fill={p.seedLight} />
      {SEEDS.map(([dx, dy]) => (
        <circle key={`${dx},${dy}`} cx={49 + dx} cy={39 + dy} r="1.4" fill={p.seed} />
      ))}
      <ellipse cx="44" cy="33" rx="3.5" ry="2" fill="#fbf7f0" opacity="0.35" transform="rotate(-40 44 33)" />
    </svg>
  );
}
