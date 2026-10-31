"use client";

import { useActionState, useState } from "react";
import { Download, Paintbrush } from "lucide-react";
import { InviteCardView, type InviteCardData } from "@/components/invite/InviteCardView";
import { GameMotif } from "@/components/games/motifs/GameMotif";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Field, TextArea, TextInput } from "@/components/ui/Field";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, COLOR_KEYS, COLOR_NAMES, type ColorKey } from "@/lib/colors";
import { GAMES, GAME_KEYS } from "@/lib/games";
import { HEADLINE_MAX, NOTE_MAX, type InviteCard, type InviteLayout, type InviteSticker } from "@/lib/inviteCard";
import { saveInviteCardAction, type InviteCardState } from "./inviteCardActions";

type Props = { gardenId: string; data: InviteCardData; isCreator: boolean; previewImageUrl: string | null };

// Live builder: curated choices on the left, the real card on the right, saved as JSON on the garden.
export function InviteCardEditor({ gardenId, data, isCreator, previewImageUrl }: Props) {
  const [open, setOpen] = useState(false);
  const [card, setCard] = useState<InviteCard>(data.card);
  const [state, action, pending] = useActionState<InviteCardState, FormData>(saveInviteCardAction.bind(null, gardenId), {});
  const preview: InviteCardData = { ...data, card };
  const update = (patch: Partial<InviteCard>) => setCard((prev) => ({ ...prev, ...patch }));

  return (
    <div className="flex flex-col gap-3">
      <InviteCardView data={{ ...data, card: state.saved ? card : data.card }} />
      <div className="flex flex-wrap gap-2">
        {isCreator ? (
          <Button variant="glass" icon={<Paintbrush className="size-4" aria-hidden />} onClick={() => setOpen(true)}>
            Design the card
          </Button>
        ) : null}
        {previewImageUrl ? (
          <ButtonLink href={previewImageUrl} variant="glass" icon={<Download className="size-4" aria-hidden />} prefetch={false}>
            Save as image
          </ButtonLink>
        ) : null}
      </div>
      <p className="px-1 text-footnote text-ink-3">This card is what friends see when the link is shared in a chat, and what they land on when they tap it.</p>

      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Design the invite"
        description="A few choices that always look good together."
        footer={
          <form action={action} className="flex flex-col gap-2">
            <input type="hidden" name="layout" value={card.layout} />
            <input type="hidden" name="headline" value={card.headline} />
            <input type="hidden" name="note" value={card.note} />
            <input type="hidden" name="sticker" value={card.sticker} />
            <input type="hidden" name="accent" value={card.accent} />
            {card.showMembers ? <input type="hidden" name="showMembers" value="on" /> : null}
            {card.showGarden ? <input type="hidden" name="showGarden" value="on" /> : null}
            {state.error ? (
              <p role="alert" className="rounded-row bg-danger-soft px-4 py-2 text-footnote text-danger">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" size="lg" full loading={pending} onClick={() => setTimeout(() => setOpen(false), 0)}>
              Save card
            </Button>
          </form>
        }
      >
        <div className="flex flex-col gap-5 pb-2">
          <InviteCardView data={preview} />

          <SegmentedControl
            label="Layout"
            value={card.layout}
            onChange={(layout: InviteLayout) => update({ layout })}
            options={[
              { value: "poster", label: "Poster" },
              { value: "postcard", label: "Postcard" },
              { value: "ticket", label: "Ticket" },
            ]}
          />

          <Field label="Headline" hint={`${card.headline.length}/${HEADLINE_MAX}`}>
            <TextInput value={card.headline} maxLength={HEADLINE_MAX} onChange={(e) => update({ headline: e.target.value })} placeholder="Come grow a garden with me" />
          </Field>
          <Field label="A note from you" hint={`${card.note.length}/${NOTE_MAX}. Leave empty to skip.`}>
            <TextArea value={card.note} maxLength={NOTE_MAX} rows={2} onChange={(e) => update({ note: e.target.value })} placeholder="Short games, a few times a week." />
          </Field>

          <fieldset>
            <legend className="mb-2 px-1 text-footnote font-semibold text-ink-2">Show</legend>
            <div className="flex flex-wrap gap-2">
              {[
                ["showGarden", "The garden", card.showGarden],
                ["showMembers", "Who is in", card.showMembers],
              ].map(([key, label, on]) => (
                <button
                  key={String(key)}
                  type="button"
                  aria-pressed={Boolean(on)}
                  onClick={() => update({ [key as "showGarden" | "showMembers"]: !on })}
                  className={cn("pressable h-10 rounded-capsule px-4 text-footnote font-semibold", on ? "bg-ink text-canvas" : "glass text-ink-2")}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 px-1 text-footnote font-semibold text-ink-2">Sticker</legend>
            <div role="radiogroup" aria-label="Sticker" className="flex flex-wrap gap-2">
              <button type="button" role="radio" aria-checked={card.sticker === "none"} onClick={() => update({ sticker: "none" })} className={cn("pressable flex h-12 items-center rounded-control px-3 text-footnote font-semibold", card.sticker === "none" ? "bg-ink text-canvas" : "glass text-ink-2")}>
                None
              </button>
              {GAME_KEYS.map((key) => (
                <button key={key} type="button" role="radio" aria-checked={card.sticker === key} aria-label={GAMES[key].name} onClick={() => update({ sticker: key as InviteSticker })} className={cn("pressable rounded-control p-1", card.sticker === key && "ring-2 ring-ink")}>
                  <GameMotif game={key} size={40} />
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 px-1 text-footnote font-semibold text-ink-2">Accent</legend>
            <div role="radiogroup" aria-label="Accent" className="flex flex-wrap gap-2">
              <button type="button" role="radio" aria-checked={card.accent === "theme"} onClick={() => update({ accent: "theme" })} className={cn("pressable h-10 rounded-capsule px-3.5 text-footnote font-semibold", card.accent === "theme" ? "bg-ink text-canvas" : "glass text-ink-2")}>
                Garden theme
              </button>
              {COLOR_KEYS.map((key: ColorKey) => (
                <button key={key} type="button" role="radio" aria-checked={card.accent === key} onClick={() => update({ accent: key })} className={cn("pressable flex h-10 items-center gap-1.5 rounded-capsule pr-3.5 pl-2.5 text-footnote font-semibold", COLOR_CLASSES[key].soft, COLOR_CLASSES[key].ink, card.accent === key && "ring-2 ring-ink")}>
                  <span className={cn("size-2.5 rounded-full", COLOR_CLASSES[key].bg)} aria-hidden />
                  {COLOR_NAMES[key]}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </Sheet>
    </div>
  );
}
