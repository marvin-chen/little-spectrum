import { GardenScene } from "@/components/garden/GardenScene";
import { GameMotif } from "@/components/games/motifs/GameMotif";
import { Avatar } from "@/components/ui/Avatar";
import { BrandMark } from "@/components/shell/Brand";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, COLOR_HEX } from "@/lib/colors";
import type { InviteCard } from "@/lib/inviteCard";
import { hourIn, skyFor, themeFor } from "@/lib/themes";

export type InviteCardData = {
  gardenName: string;
  theme: string;
  timezone: string;
  creatorName: string;
  members: Array<{ id: string; name: string; avatar: string }>;
  capacity: number;
  card: InviteCard;
};

// The invite card as HTML. The same design is painted for the link preview image in opengraph-image.tsx.
export function InviteCardView({ data, className }: { data: InviteCardData; className?: string }) {
  const theme = themeFor(data.theme);
  const hour = hourIn(data.timezone);
  const sky = skyFor(theme, hour);
  const accentHex = data.card.accent === "theme" ? theme.tint : COLOR_HEX[data.card.accent];
  const accentInk = data.card.accent === "theme" ? theme.tintInk : undefined;
  const accentClass = data.card.accent === "theme" ? undefined : COLOR_CLASSES[data.card.accent].ink;
  const spotsLeft = Math.max(0, data.capacity - data.members.length);
  const { card } = data;

  const members = card.showMembers && data.members.length > 0 ? (
    <div className="flex items-center gap-2">
      <ul className="flex" aria-label="Members">
        {data.members.slice(0, 8).map((m, i) => (
          <li key={m.id} className={i > 0 ? "-ml-2" : undefined}>
            <Avatar avatar={m.avatar} name={m.name} size="sm" ring />
          </li>
        ))}
      </ul>
      <p className="text-footnote text-ink-2">
        {data.members.map((m) => m.name).slice(0, 3).join(", ")}
        {data.members.length > 3 ? ` and ${data.members.length - 3} more` : ""}
      </p>
    </div>
  ) : null;

  const sticker = card.sticker !== "none" ? <GameMotif game={card.sticker} size={44} className="drop-shadow-md" /> : null;

  if (card.layout === "ticket") {
    return (
      <div className={cn("overflow-hidden rounded-group bg-surface shadow-float ring-1 ring-line", className)}>
        <div className="flex">
          <div className="w-2.5 shrink-0" style={{ background: accentHex }} aria-hidden />
          <div className="min-w-0 flex-1 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-footnote font-semibold uppercase tracking-[0.08em]" style={{ color: accentInk ?? accentHex }}>
                Admit one · {data.gardenName}
              </p>
              {sticker}
            </div>
            <h2 className="mt-2 font-display text-title-1 font-bold text-ink">{card.headline}</h2>
            {card.note ? <p className="mt-2 text-callout text-ink-2">{card.note}</p> : null}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {members}
              <p className="text-footnote font-semibold text-ink-3">{spotsLeft === 0 ? "Full" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}</p>
            </div>
          </div>
        </div>
        <div className="relative border-t border-dashed border-line-strong px-5 py-3">
          <span aria-hidden className="absolute -top-2.5 -left-2.5 size-5 rounded-full bg-canvas" />
          <span aria-hidden className="absolute -top-2.5 -right-2.5 size-5 rounded-full bg-canvas" />
          <p className="flex items-center gap-2 text-caption font-semibold text-ink-3">
            <BrandMark size={16} /> From {data.creatorName} on Little Spectrum
          </p>
        </div>
      </div>
    );
  }

  if (card.layout === "postcard") {
    return (
      <div className={cn("overflow-hidden rounded-group bg-surface shadow-float ring-1 ring-line", className)}>
        <div className="grid sm:grid-cols-[1.1fr_1fr]">
          <div className="relative min-h-44">
            {card.showGarden ? <GardenScene theme={data.theme} items={[]} compact className="absolute inset-0 h-full w-full" hour={hour} /> : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${sky.top}, ${sky.bottom})` }} />}
            {sticker ? <div className="absolute top-3 left-3">{sticker}</div> : null}
          </div>
          <div className="flex flex-col justify-between gap-4 p-5">
            <div>
              <p className="text-footnote font-semibold text-ink-3">{data.gardenName}</p>
              <h2 className="mt-1 font-display text-title-2 font-bold text-ink">{card.headline}</h2>
              {card.note ? <p className="mt-2 text-callout text-ink-2">{card.note}</p> : null}
            </div>
            <div className="flex flex-col gap-2">
              {members}
              <p className="flex items-center gap-2 text-caption font-semibold" style={{ color: accentInk ?? accentHex }}>
                <BrandMark size={16} /> {spotsLeft === 0 ? "Full" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`} · from {data.creatorName}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden rounded-group shadow-float ring-1 ring-line", className)}>
      <div className="relative h-52">
        {card.showGarden ? <GardenScene theme={data.theme} items={[]} compact className="absolute inset-0 h-full w-full" hour={hour} /> : <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${sky.top}, ${sky.bottom})` }} />}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" aria-hidden />
        {sticker ? <div className="absolute top-4 right-4">{sticker}</div> : null}
        <p className="absolute top-4 left-5 flex items-center gap-2 text-footnote font-semibold text-ink/80">
          <BrandMark size={18} /> Little Spectrum
        </p>
      </div>
      <div className="-mt-6 bg-surface px-5 pt-0 pb-5">
        <p className={cn("text-footnote font-semibold uppercase tracking-[0.08em]", accentClass)} style={accentInk ? { color: accentInk } : undefined}>
          {data.gardenName}
        </p>
        <h2 className="mt-1 font-display text-large-title font-bold text-ink">{card.headline}</h2>
        {card.note ? <p className="mt-2 text-body text-ink-2">{card.note}</p> : null}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {members}
          <p className="text-footnote font-semibold text-ink-3">
            {spotsLeft === 0 ? "Full" : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`} · from {data.creatorName}
          </p>
        </div>
      </div>
    </div>
  );
}
