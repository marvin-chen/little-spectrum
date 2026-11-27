"use client";

import Link from "next/link";
import { useState, ViewTransition } from "react";
import { ChevronRight } from "lucide-react";
import { GardenScene } from "@/components/garden/GardenScene";
import { getGardenItem } from "@/components/garden/items";
import { GameMotif } from "@/components/games/motifs/GameMotif";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import type { GardenItemDetail } from "@/lib/data/growth";
import { GAMES } from "@/lib/games";
import { ThemePicker } from "./ThemePicker";

function weekLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}

export function GardenView({
  gardenId,
  theme,
  items,
  hour,
  canEditTheme,
}: {
  gardenId: string;
  theme: string;
  items: GardenItemDetail[];
  hour: number;
  canEditTheme: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = items.find((i) => i.id === selectedId) ?? null;
  const def = selected ? getGardenItem(selected.itemKey) : null;

  return (
    <>
      <div className="relative -mx-4 overflow-hidden md:mx-0 md:rounded-group md:shadow-card md:ring-1 md:ring-line">
        <ViewTransition name="garden-scene" share="morph" default="none">
          <GardenScene
            theme={theme}
            items={items}
            className="block h-[300px] w-full md:h-[360px]"
            selectable
            selectedId={selectedId}
            onSelect={setSelectedId}
            animate
            hour={hour}
          />
        </ViewTransition>
        {canEditTheme ? <ThemePicker gardenId={gardenId} current={theme} /> : null}
      </div>

      {items.length > 0 ? (
        <section className="mt-6">
          <SectionLabel muted>Keepsakes</SectionLabel>
          <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
            {items.map((item, i) => {
              const itemDef = getGardenItem(item.itemKey);
              if (!itemDef) return null;
              const Item = itemDef.Component;
              return (
                <li key={item.id} className="anim-rise" style={{ "--i": i } as React.CSSProperties}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    aria-pressed={selectedId === item.id}
                    className={cn(
                      "pressable flex w-full flex-col items-center gap-1.5 rounded-tile bg-surface px-2 pt-3 pb-2.5 shadow-card ring-1 ring-line hover:bg-surface-2",
                      selectedId === item.id && "ring-2 ring-ink",
                    )}
                  >
                    <span className="block h-14 w-12">
                      <Item variant={item.variant} title={itemDef.name} />
                    </span>
                    <span className="text-caption font-semibold text-ink">{itemDef.name}</span>
                    <span className="text-caption text-ink-3">
                      Week of {weekLabel(item.weekStart).replace(/, \d{4}$/, "")}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <Sheet
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title={def?.name ?? ""}
        description={def?.blurb}
      >
        {selected && def ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-tile bg-surface-3 p-4">
              <span className="block h-24 w-20 shrink-0 anim-pop">
                <def.Component variant={selected.variant} title={def.name} />
              </span>
              <div className="text-callout text-ink-2">
                <p>
                  Earned the week of <span className="font-semibold text-ink">{weekLabel(selected.weekStart)}</span>.
                </p>
                <p className="mt-1">Keepsake {selected.ordinal}. It stays forever.</p>
              </div>
            </div>
            <div>
              <p className="mb-2 px-1 text-footnote font-semibold text-ink-3">That week&apos;s rounds</p>
              <ul className="overflow-hidden rounded-group bg-surface ring-1 ring-line">
                {selected.activities.map((a) => {
                  const game = GAMES[a.game];
                  const date = a.revealedAt
                    ? new Date(a.revealedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "";
                  const inner = (
                    <>
                      <GameMotif game={a.game} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-callout font-semibold text-ink">{game.name}</span>
                        <span className="block truncate text-footnote text-ink-3">
                          {a.isParticipant ? a.participantNames.join(", ") : `${a.participantCount} players`}
                          {date ? ` · ${date}` : ""}
                        </span>
                      </span>
                      {a.isParticipant ? (
                        <ChevronRight className="size-4 shrink-0 text-ink-3/70" aria-hidden />
                      ) : (
                        <Badge>Not in this one</Badge>
                      )}
                    </>
                  );
                  return (
                    <li key={a.id} className="not-last:border-b not-last:border-line">
                      {a.isParticipant ? (
                        <Link
                          href={`/g/${gardenId}/play/${a.id}`}
                          className="pressable flex min-h-12 items-center gap-3 px-3 py-2 hover:bg-fill"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex min-h-12 items-center gap-3 px-3 py-2">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </Sheet>
    </>
  );
}
