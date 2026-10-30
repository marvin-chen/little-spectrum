// Client-safe reaction catalog. The database constrains emoji to these keys.
export const REACTION_EMOJI = [
  { key: "heart", glyph: "❤️", label: "Love it" },
  { key: "laugh", glyph: "😂", label: "Funny" },
  { key: "wow", glyph: "😮", label: "Wow" },
  { key: "clap", glyph: "👏", label: "Nice one" },
  { key: "sparkle", glyph: "✨", label: "Magic" },
] as const;

export type ReactionKey = (typeof REACTION_EMOJI)[number]["key"];

export function isReactionKey(value: unknown): value is ReactionKey {
  return typeof value === "string" && REACTION_EMOJI.some((r) => r.key === value);
}
