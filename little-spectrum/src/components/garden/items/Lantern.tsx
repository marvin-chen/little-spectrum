import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { frame: "#1f1b2e", frameDark: "#0f0d18", post: "#b8865b", postDark: "#96693f" },
  { frame: "#b8865b", frameDark: "#96693f", post: "#1f1b2e", postDark: "#0f0d18" },
  { frame: "#8b6cf0", frameDark: "#6f52d1", post: "#b8865b", postDark: "#96693f" },
];

export function Lantern({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Garden lantern"}</title>
      <circle cx="50" cy="54" r="24" fill="#f2a93b" opacity="0.14" />
      <circle cx="50" cy="54" r="16" fill="#f2a93b" opacity="0.16" />
      <rect x="47" y="70" width="6" height="40" fill={p.post} />
      <rect x="51" y="70" width="2" height="40" fill={p.postDark} />
      <rect x="40" y="106" width="20" height="6" rx="3" fill={p.postDark} />
      <rect x="40" y="105" width="18" height="5" rx="2.5" fill={p.post} />
      <rect x="38" y="40" width="24" height="31" rx="4" fill={p.frameDark} />
      <rect x="38" y="40" width="21" height="31" rx="4" fill={p.frame} />
      <rect x="41" y="44" width="18" height="23" rx="2" fill="#fbd27a" />
      <rect x="50" y="44" width="9" height="23" rx="2" fill="#f7c35a" />
      <path d="M50 44 L50 67 M41 55 L59 55" stroke={p.frame} strokeWidth="1.5" />
      <ellipse cx="50" cy="57" rx="3.8" ry="5.5" fill="#f2a93b" />
      <ellipse cx="50" cy="59" rx="2" ry="3" fill="#fbf7f0" opacity="0.85" />
      <path d="M36 41 L50 31 L64 41 Z" fill={p.frame} />
      <path d="M50 31 L64 41 L56 41 Z" fill={p.frameDark} />
      <circle cx="50" cy="29" r="2.5" fill={p.frame} />
      <rect x="43" y="46" width="2.5" height="8" rx="1.25" fill="#fbf7f0" opacity="0.5" />
    </svg>
  );
}
