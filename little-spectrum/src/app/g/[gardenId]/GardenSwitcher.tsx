"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ChevronsUpDown, Plus, Settings } from "lucide-react";
import { Group, RowLink } from "@/components/ui/Card";
import { Sheet } from "@/components/ui/Sheet";
import { cn } from "@/lib/cn";
import type { GardenSummary } from "@/lib/data/gardens";

type Props = { gardens: GardenSummary[]; currentId: string; variant: "toolbar" | "sidebar" };

export function GardenSwitcher({ gardens, currentId, variant }: Props) {
  const [open, setOpen] = useState(false);
  const current = gardens.find((g) => g.id === currentId);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label={variant === "toolbar" ? "Switch garden" : undefined}
        className={cn(
          "pressable flex items-center justify-center rounded-capsule font-semibold text-ink",
          variant === "toolbar" ? "size-9 hover:bg-fill" : "glass h-11 w-full justify-between px-3 text-callout",
        )}
      >
        {variant === "sidebar" ? <span className="truncate">{current?.name ?? "Gardens"}</span> : null}
        <ChevronsUpDown className="size-[18px] shrink-0" aria-hidden />
      </button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Your gardens"
        description="Each garden keeps its own members, games, and growth."
      >
        <Group>
          {gardens.map((g) => (
            <Link
              key={g.id}
              href={`/g/${g.id}`}
              onClick={() => setOpen(false)}
              className="pressable flex min-h-[52px] items-center gap-3 px-4 py-2.5 not-last:border-b not-last:border-line hover:bg-fill"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body text-ink">{g.name}</span>
                <span className="block text-footnote text-ink-3">
                  {g.memberCount} of {g.capacity}
                </span>
              </span>
              {g.id === currentId ? <Check className="size-5 text-tint" aria-hidden /> : null}
            </Link>
          ))}
        </Group>
        <Group className="mt-3">
          <RowLink
            href="/start"
            icon={<Plus className="size-5 text-ink-2" aria-hidden />}
            label="Plant another garden"
          />
          <RowLink
            href={`/g/${currentId}/settings`}
            icon={<Settings className="size-5 text-ink-2" aria-hidden />}
            label="Garden settings"
          />
        </Group>
      </Sheet>
    </>
  );
}
