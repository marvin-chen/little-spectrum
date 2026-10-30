import type { ColorKey } from "./colors";

export const AVATAR_ICONS = [
  "sun",
  "leaf",
  "cloud",
  "star",
  "waves",
  "moon",
  "flower",
  "cat",
  "zap",
  "heart",
  "music",
  "coffee",
] as const;

export type AvatarIcon = (typeof AVATAR_ICONS)[number];

export type Avatar = { icon: AvatarIcon; color: ColorKey };

const COLORS: ColorKey[] = ["coral", "rose", "violet", "blue", "amber", "green"];

export function parseAvatar(value: string | null | undefined): Avatar {
  const [icon, color] = (value ?? "").split(":");
  return {
    icon: (AVATAR_ICONS as readonly string[]).includes(icon) ? (icon as AvatarIcon) : "sun",
    color: (COLORS as string[]).includes(color) ? (color as ColorKey) : "amber",
  };
}

export function serializeAvatar(avatar: Avatar): string {
  return `${avatar.icon}:${avatar.color}`;
}

export function isValidAvatar(value: string): boolean {
  const [icon, color, rest] = value.split(":");
  return (
    rest === undefined &&
    (AVATAR_ICONS as readonly string[]).includes(icon) &&
    (COLORS as string[]).includes(color)
  );
}
