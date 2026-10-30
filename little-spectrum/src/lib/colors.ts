export type ColorKey = "coral" | "rose" | "violet" | "blue" | "amber" | "green";

export const COLOR_KEYS: ColorKey[] = ["coral", "rose", "violet", "blue", "amber", "green"];

export const COLOR_NAMES: Record<ColorKey, string> = {
  coral: "Coral",
  rose: "Rose",
  violet: "Violet",
  blue: "Blue",
  amber: "Amber",
  green: "Green",
};

export const COLOR_HEX: Record<ColorKey, string> = {
  coral: "#ff7a59",
  rose: "#f26b8a",
  violet: "#8b6cf0",
  blue: "#4f8cff",
  amber: "#f2a93b",
  green: "#4fb37a",
};

// Tailwind needs the full class names written out so they are generated.
export const COLOR_CLASSES: Record<
  ColorKey,
  { bg: string; bgDeep: string; soft: string; ink: string; text: string; border: string; ring: string }
> = {
  coral: {
    bg: "bg-coral",
    bgDeep: "bg-coral-deep",
    soft: "bg-coral-soft",
    ink: "text-coral-ink",
    text: "text-coral",
    border: "border-coral",
    ring: "ring-coral",
  },
  rose: {
    bg: "bg-rose",
    bgDeep: "bg-rose-deep",
    soft: "bg-rose-soft",
    ink: "text-rose-ink",
    text: "text-rose",
    border: "border-rose",
    ring: "ring-rose",
  },
  violet: {
    bg: "bg-violet",
    bgDeep: "bg-violet-deep",
    soft: "bg-violet-soft",
    ink: "text-violet-ink",
    text: "text-violet",
    border: "border-violet",
    ring: "ring-violet",
  },
  blue: {
    bg: "bg-blue",
    bgDeep: "bg-blue-deep",
    soft: "bg-blue-soft",
    ink: "text-blue-ink",
    text: "text-blue",
    border: "border-blue",
    ring: "ring-blue",
  },
  amber: {
    bg: "bg-amber",
    bgDeep: "bg-amber-deep",
    soft: "bg-amber-soft",
    ink: "text-amber-ink",
    text: "text-amber",
    border: "border-amber",
    ring: "ring-amber",
  },
  green: {
    bg: "bg-green",
    bgDeep: "bg-green-deep",
    soft: "bg-green-soft",
    ink: "text-green-ink",
    text: "text-green",
    border: "border-green",
    ring: "ring-green",
  },
};
