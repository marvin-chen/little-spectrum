"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronsUpDown, Plus, Settings } from "lucide-react";
import { Group, RowLink, RowButton } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import type { GardenSummary } from "@/lib/data/gardens";
import { cn } from "@/lib/cn";

type Props = { gardens: GardenSummary[]; currentId: string; variant: "title" | "sidebar" };

export function GardenSwitcher({ gardens, currentId, variant }: Props) {
  const [open, setOpen] = useState(false);
  const current = gardens.find((g) => g.id === currentId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={cn(
          "pressable flex items-center gap-1.5 rounded-capsule text-callout font-semibold hover:bg-fill",
          variant === "title" ? "h-9 px-3 text-ink-2" : "h-11 w-full justify-between px-3 text-ink",
        )}
      >
        <span className="truncate">{variant === "title" ? "Switch" : (current?.name ?? "Gardens")}</span>
        <ChevronsUpDown className="size-4 shrink-0" aria-hidden />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Your gardens" description="Each garden keeps its own members, games, and growth.">
        <Group>
          {gardens.map((g) => (
            <RowButton
              key={g.id}
              onClick={() => setOpen(false)}
              label={
                <Link href={`/g/${g.id}`} className="block w-full">
                  {g.name}
                  {g.id === currentId ? <span className="text-ink-3"> · Current</span> : null}
                </Link>
              }
              detail={`${g.memberCount} of ${g.capacity}`}
              chevron={false}
            />
          ))}
        </Group>
        <div className="mt-4 flex flex-col gap-2">
          <RowLink href="/start" icon={<Plus className="size-5 text-ink-2" aria-hidden />} label="Plant another garden" className="rounded-row bg-surface ring-1 ring-line" />
          <RowLink href={`/g/${currentId}/settings`} icon={<Settings className="size-5 text-ink-2" aria-hidden />} label="Garden settings" className="rounded-row bg-surface ring-1 ring-line" />
        </div>
      </Sheet>
    </>
  );
}
