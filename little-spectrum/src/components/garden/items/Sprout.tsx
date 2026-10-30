import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { leaf: "#5fb37c", leafDark: "#3f8f5f", stem: "#4fb37a", soil: "#b8865b", soilDark: "#96693f", bud: null },
  { leaf: "#8bd1a0", leafDark: "#5fb37c", stem: "#5fb37c", soil: "#b8865b", soilDark: "#96693f", bud: "#f2a93b" },
  { leaf: "#4fb37a", leafDark: "#3f8f5f", stem: "#3f8f5f", soil: "#a3744c", soilDark: "#86592f", bud: "#ff7a59" },
];

export function Sprout({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Sprout"}</title>
      <path d="M28 112 Q50 95 72 112 Z" fill={p.soilDark} />
      <path d="M28 112 Q46 96 66 112 Z" fill={p.soil} />
      <ellipse cx="42" cy="107" rx="7" ry="2.2" fill="#fbf7f0" opacity="0.35" />
      <path d="M50 110 C51 100 49 92 50 84" stroke={p.stem} strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M50 84 C40 84 30 76 32 64 C44 66 50 74 50 84 Z" fill={p.leaf} />
      <path d="M50 84 C60 84 70 76 68 64 C56 66 50 74 50 84 Z" fill={p.leafDark} />
      <path d="M49 83 Q43 77 36 68" stroke={p.leafDark} strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.6" />
      <path d="M51 83 Q57 77 64 68" stroke="#2f6f49" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
      <ellipse cx="39" cy="72" rx="3.5" ry="1.8" fill="#fbf7f0" opacity="0.55" transform="rotate(-40 39 72)" />
      {p.bud ? <circle cx="50" cy="82" r="3" fill={p.bud} /> : null}
    </svg>
  );
}
