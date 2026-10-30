import { useId } from "react";
import type { GardenItemProps } from "./types";

const PALETTES = [
  { wing: "#ff7a59", wingDark: "#e0603f", lower: "#f2a93b", spot: "#fbf7f0" },
  { wing: "#8b6cf0", wingDark: "#6f52d1", lower: "#f26b8a", spot: "#fbf7f0" },
  { wing: "#4f8cff", wingDark: "#3a6fd6", lower: "#8b6cf0", spot: "#fbf7f0" },
];

export function Butterfly({ variant = 0, className, title }: GardenItemProps) {
  const titleId = useId();
  const p = PALETTES[Math.abs(variant) % 3];
  return (
    <svg viewBox="0 0 100 120" width="100%" height="100%" role="img" aria-labelledby={titleId} className={className}>
      <title id={titleId}>{title ?? "Butterfly"}</title>
      <path d="M58 112 C60 100 62 92 70 78 C66 94 63 104 63 112 Z" fill="#3f8f5f" />
      <path d="M36 112 C36 102 34 94 28 84 C32 96 32 104 31 112 Z" fill="#8bd1a0" />
      <path d="M48 112 C51 96 48 80 42 62 C46 80 54 96 56 112 Z" fill="#5fb37c" />
      <g transform="translate(46 54) rotate(-10)">
        <ellipse cx="-6" cy="4" rx="5" ry="4.5" fill={p.lower} transform="rotate(25 -6 4)" />
        <ellipse cx="6" cy="4" rx="5" ry="4.5" fill={p.lower} transform="rotate(-25 6 4)" />
        <ellipse cx="-7" cy="-4" rx="7.5" ry="6" fill={p.wing} transform="rotate(-20 -7 -4)" />
        <ellipse cx="7" cy="-4" rx="7.5" ry="6" fill={p.wingDark} transform="rotate(20 7 -4)" />
        <circle cx="-9" cy="-5" r="2" fill={p.spot} opacity="0.8" />
        <circle cx="9" cy="-5" r="2" fill={p.spot} opacity="0.6" />
        <circle cx="-7" cy="5" r="1.2" fill={p.spot} opacity="0.7" />
        <circle cx="7" cy="5" r="1.2" fill={p.spot} opacity="0.7" />
        <ellipse cx="0" cy="0" rx="1.8" ry="8" fill="#1f1b2e" />
        <circle cx="0" cy="-8.5" r="2" fill="#1f1b2e" />
        <path d="M-1 -10 Q-4 -15 -6 -16 M1 -10 Q4 -15 6 -16" stroke="#1f1b2e" strokeWidth="1" strokeLinecap="round" fill="none" />
        <circle cx="-6" cy="-16" r="0.9" fill="#1f1b2e" />
        <circle cx="6" cy="-16" r="0.9" fill="#1f1b2e" />
      </g>
    </svg>
  );
}
