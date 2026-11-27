import type { ColorKey } from "./colors";
import { GAME_KEYS, type GameKey } from "./games";

export const INVITE_LAYOUTS = ["poster", "postcard", "ticket"] as const;
export type InviteLayout = (typeof INVITE_LAYOUTS)[number];

export type InviteSticker = GameKey | "none";

export type InviteCard = {
  layout: InviteLayout;
  headline: string;
  note: string;
  showMembers: boolean;
  showGarden: boolean;
  sticker: InviteSticker;
  accent: ColorKey | "theme";
};

export const HEADLINE_MAX = 40;
export const NOTE_MAX = 140;

export const DEFAULT_INVITE_CARD: InviteCard = {
  layout: "poster",
  headline: "Come grow a garden with me",
  note: "Short games, a few times a week. No account needed.",
  showMembers: true,
  showGarden: true,
  sticker: "none",
  accent: "theme",
};

const ACCENTS = ["theme", "coral", "rose", "violet", "blue", "amber", "green"] as const;

function cleanLine(value: unknown, max: number, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  return text.slice(0, max);
}

// Accepts anything stored or submitted and returns a safe card.
export function parseInviteCard(input: unknown): InviteCard {
  const raw = (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
  const layout = (INVITE_LAYOUTS as readonly string[]).includes(String(raw.layout))
    ? (raw.layout as InviteLayout)
    : DEFAULT_INVITE_CARD.layout;
  const sticker =
    raw.sticker === "none" || (GAME_KEYS as string[]).includes(String(raw.sticker))
      ? (raw.sticker as InviteSticker)
      : "none";
  const accent = (ACCENTS as readonly string[]).includes(String(raw.accent))
    ? (raw.accent as InviteCard["accent"])
    : "theme";
  return {
    layout,
    headline: cleanLine(raw.headline, HEADLINE_MAX, DEFAULT_INVITE_CARD.headline),
    note: typeof raw.note === "string" ? cleanLine(raw.note, NOTE_MAX, "") : DEFAULT_INVITE_CARD.note,
    showMembers: raw.showMembers === undefined ? true : Boolean(raw.showMembers),
    showGarden: raw.showGarden === undefined ? true : Boolean(raw.showGarden),
    sticker,
    accent,
  };
}

export function inviteCardFromForm(form: FormData): InviteCard {
  return parseInviteCard({
    layout: form.get("layout"),
    headline: form.get("headline"),
    note: form.get("note") ?? "",
    showMembers: form.get("showMembers") === "on",
    showGarden: form.get("showGarden") === "on",
    sticker: form.get("sticker"),
    accent: form.get("accent"),
  });
}
