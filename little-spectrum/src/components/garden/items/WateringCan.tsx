import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { body: "#4f8cff", bodyDark: "#3a6fd6", drop: "#8fb8ff" },
  { body: "#4fb37a", bodyDark: "#3f8f5f", drop: "#4f8cff" },
  { body: "#ff7a59", bodyDark: "#e0603f", drop: "#4f8cff" },
];

export function WateringCan({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Watering can"}</title>
      <path d="M28 88 Q14 97 28 106" stroke={p.bodyDark} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M56 98 L82 72" stroke={p.bodyDark} strokeWidth="6" strokeLinecap="round" fill="none" />
      <ellipse cx="84" cy="70" rx="6" ry="4" fill={p.bodyDark} transform="rotate(45 84 70)" />
      <ellipse cx="84" cy="70" rx="4" ry="2.4" fill={p.body} transform="rotate(45 84 70)" />
      <rect x="26" y="80" width="34" height="32" rx="5" fill={p.body} />
      <path d="M48 80 L55 80 Q60 80 60 85 L60 107 Q60 112 55 112 L48 112 Z" fill={p.bodyDark} />
      <rect x="24" y="77" width="38" height="7" rx="3.5" fill={p.bodyDark} />
      <rect x="24" y="77" width="33" height="6" rx="3" fill={p.body} />
      <path d="M34 78 Q43 60 52 78" stroke={p.bodyDark} strokeWidth="4" strokeLinecap="round" fill="none" />
      <rect x="30" y="88" width="5" height="14" rx="2.5" fill="#fbf7f0" opacity="0.45" />
      <ellipse cx="90" cy="79" rx="1.6" ry="2.4" fill={p.drop} />
      <ellipse cx="94" cy="88" rx="1.6" ry="2.4" fill={p.drop} />
      <ellipse cx="92" cy="97" rx="1.6" ry="2.4" fill={p.drop} />
    </svg>
  );
}
