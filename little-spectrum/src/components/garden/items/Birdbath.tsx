import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { stone: "#cfc9da", stoneDark: "#aea6c2", bird: "#ff7a59" },
  { stone: "#dcc9a9", stoneDark: "#bba58a", bird: "#4f8cff" },
  { stone: "#bccfd9", stoneDark: "#95adbb", bird: "#f2a93b" },
];

export function Birdbath({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Birdbath"}</title>
      <ellipse cx="50" cy="109" rx="16" ry="3" fill={p.stoneDark} />
      <path d="M36 109 Q36 103 42 102 L58 102 Q64 103 64 109 Z" fill={p.stone} />
      <path d="M44 102 Q45 90 44 74 L56 74 Q55 90 56 102 Z" fill={p.stone} />
      <path d="M52 74 L56 74 Q55 90 56 102 L52 102 Q53 90 52 74 Z" fill={p.stoneDark} />
      <path d="M24 64 Q26 80 50 82 Q74 80 76 64 Z" fill={p.stoneDark} />
      <path d="M24 64 Q26 78 46 80 Q68 78 70 64 Z" fill={p.stone} />
      <ellipse cx="50" cy="64" rx="27" ry="7" fill={p.stone} />
      <ellipse cx="50" cy="64" rx="23" ry="5" fill="#4f8cff" />
      <ellipse cx="46" cy="63" rx="12" ry="2.6" fill="#8fb8ff" opacity="0.8" />
      <ellipse cx="38" cy="62" rx="4" ry="1" fill="#fbf7f0" opacity="0.7" />
      <path d="M66 57 L63 54 L66.5 59 Z" fill={p.bird} />
      <ellipse cx="71" cy="58" rx="4.5" ry="3.3" fill={p.bird} />
      <circle cx="75" cy="55" r="2.6" fill={p.bird} />
      <path d="M77.2 54.6 L80 55.4 L77.2 56.2 Z" fill="#f2a93b" />
      <circle cx="75.6" cy="54.6" r="0.55" fill="#1f1b2e" />
      <ellipse cx="70" cy="58.5" rx="2.4" ry="1.4" fill="#fbf7f0" opacity="0.45" transform="rotate(-15 70 58.5)" />
      <ellipse cx="38" cy="70" rx="5" ry="2" fill="#fbf7f0" opacity="0.35" transform="rotate(20 38 70)" />
    </svg>
  );
}
