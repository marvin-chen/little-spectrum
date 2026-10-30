export type ThemeKey = "meadow" | "sunset" | "lagoon" | "orchard";

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
  },
};

export function themeFor(key: string): Theme {
  return THEMES[(key as ThemeKey) in THEMES ? (key as ThemeKey) : "meadow"];
}
