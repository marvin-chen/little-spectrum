export type ThemeKey = "meadow" | "sunset" | "lagoon" | "orchard" | "dusk" | "citrus";

export type Theme = {
  key: ThemeKey;
  name: string;
  blurb: string;
  skyTop: string;
  skyBottom: string;
  hillBack: string;
  hillFront: string;
  ground: string;
  sun: string;
  // Chrome tint derived from the theme: accent, a soft fill, and an ink that passes contrast on it.
  tint: string;
  tintSoft: string;
  tintInk: string;
};

export const THEMES: Record<ThemeKey, Theme> = {
  meadow: {
    key: "meadow",
    name: "Meadow",
    blurb: "Soft blue sky, fresh green grass.",
    skyTop: "#dbeeff",
    skyBottom: "#f6fbff",
    hillBack: "#bfe3c8",
    hillFront: "#9ad3a9",
    ground: "#79c08c",
    sun: "#ffd66b",
    tint: "#3f8f5f",
    tintSoft: "#dcf3e5",
    tintInk: "#1e6b40",
  },
  sunset: {
    key: "sunset",
    name: "Sunset",
    blurb: "Peach sky with a golden glow.",
    skyTop: "#ffd9c7",
    skyBottom: "#fff3e6",
    hillBack: "#e9c4a6",
    hillFront: "#d3a98a",
    ground: "#b58a68",
    sun: "#ff9a6b",
    tint: "#e2552f",
    tintSoft: "#ffe6dd",
    tintInk: "#a0351a",
  },
  lagoon: {
    key: "lagoon",
    name: "Lagoon",
    blurb: "Cool teal water and sandy edges.",
    skyTop: "#d6f3f1",
    skyBottom: "#f3fcfb",
    hillBack: "#a9dfdb",
    hillFront: "#7fcbc6",
    ground: "#e7d8b4",
    sun: "#ffe08a",
    tint: "#1f8f8a",
    tintSoft: "#d8f1ef",
    tintInk: "#146863",
  },
  orchard: {
    key: "orchard",
    name: "Orchard",
    blurb: "Lavender dusk over warm fields.",
    skyTop: "#e8e0fb",
    skyBottom: "#faf6ff",
    hillBack: "#cbbfe9",
    hillFront: "#b7a6df",
    ground: "#8fb27a",
    sun: "#ffc98a",
    tint: "#6a48d8",
    tintSoft: "#ebe5fd",
    tintInk: "#5233b4",
  },
  dusk: {
    key: "dusk",
    name: "Dusk",
    blurb: "Indigo sky with a rosy horizon.",
    skyTop: "#c9c6f2",
    skyBottom: "#f6e3ee",
    hillBack: "#a89fd6",
    hillFront: "#8c82c6",
    ground: "#6f77a8",
    sun: "#ffb1c9",
    tint: "#d2446a",
    tintSoft: "#fde3ea",
    tintInk: "#9f2748",
  },
  citrus: {
    key: "citrus",
    name: "Citrus",
    blurb: "Bright lime hills under a lemon sun.",
    skyTop: "#e4f4ff",
    skyBottom: "#fbfbe6",
    hillBack: "#cfe49a",
    hillFront: "#b5d66e",
    ground: "#95bf4a",
    sun: "#ffe066",
    tint: "#d8880f",
    tintSoft: "#fdecc9",
    tintInk: "#845502",
  },
};

export function mix(hex: string, other: string, amount: number): string {
  const a = hex.replace("#", "");
  const b = other.replace("#", "");
  const to = (i: number) => {
    const x = parseInt(a.slice(i, i + 2), 16);
    const y = parseInt(b.slice(i, i + 2), 16);
    return Math.round(x + (y - x) * amount)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${to(0)}${to(2)}${to(4)}`;
}

// Sky colors shift with the hour in the garden's timezone: paler mornings, warm evenings, deep nights.
export function skyFor(theme: Theme, hour: number): { top: string; bottom: string; sun: string; night: boolean } {
  if (hour >= 21 || hour < 5) return { top: mix(theme.skyTop, "#2b2f55", 0.55), bottom: mix(theme.skyBottom, "#3a3f6b", 0.35), sun: "#f4f1e6", night: true };
  if (hour >= 18) return { top: mix(theme.skyTop, "#ffb088", 0.35), bottom: mix(theme.skyBottom, "#ffd3b0", 0.3), sun: "#ff9a6b", night: false };
  if (hour < 8) return { top: mix(theme.skyTop, "#ffffff", 0.25), bottom: mix(theme.skyBottom, "#fff4d6", 0.3), sun: "#ffe08a", night: false };
  return { top: theme.skyTop, bottom: theme.skyBottom, sun: theme.sun, night: false };
}

export function hourIn(timezone: string, at = new Date()): number {
  try {
    return Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(at)) % 24;
  } catch {
    return 12;
  }
}

export function themeFor(key: string): Theme {
  return THEMES[(key as ThemeKey) in THEMES ? (key as ThemeKey) : "meadow"];
}
