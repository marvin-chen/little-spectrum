import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GameIcon } from "@/components/games/GameIcon";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES, COLOR_KEYS, COLOR_NAMES, type ColorKey } from "@/lib/colors";
import { GAMES, GAME_KEYS } from "@/lib/games";

export const metadata = { title: "Games" };

export default async function DemoGamesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { color } = await searchParams;
  const filter: ColorKey | "all" = color && (COLOR_KEYS as string[]).includes(color) ? (color as ColorKey) : "all";
  const games = GAME_KEYS.filter((k) => filter === "all" || GAMES[k].color === filter);

  return (
    <>
      <PageTitle title="Games" subtitle="Six short games. Everyone plays on their own time and reveals together." />
      <div className="flex flex-col gap-5">
        <nav aria-label="Filter by color" className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <Link
            href="/demo/games"
            aria-current={filter === "all" ? "true" : undefined}
            className={cn(
              "pressable flex h-10 shrink-0 items-center gap-2 rounded-capsule px-4 text-callout font-semibold ring-1",
              filter === "all" ? "bg-ink text-ivory ring-ink" : "bg-surface text-ink-2 ring-line",
            )}
          >
            All colors
          </Link>
          {COLOR_KEYS.map((key) => (
            <Link
              key={key}
              href={`/demo/games?color=${key}`}
              aria-current={filter === key ? "true" : undefined}
              className={cn(
                "pressable flex h-10 shrink-0 items-center gap-2 rounded-capsule px-4 text-callout font-semibold ring-1",
                filter === key
                  ? `${COLOR_CLASSES[key].soft} ${COLOR_CLASSES[key].ink} ring-current`
                  : "bg-surface text-ink-2 ring-line",
              )}
            >
              <span className={cn("size-3 rounded-full", COLOR_CLASSES[key].bg)} aria-hidden />
              {COLOR_NAMES[key]}
            </Link>
          ))}
        </nav>

        <ul className="grid gap-3 sm:grid-cols-2">
          {games.map((key) => {
            const game = GAMES[key];
            return (
              <li key={key}>
                <Card className="flex items-start gap-3 p-4">
                  <GameIcon game={key} size="lg" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-title-3 font-semibold text-ink">{game.name}</span>
                      <Badge tone={game.color}>{game.colorLabel}</Badge>
                    </span>
                    <span className="block text-footnote font-semibold text-ink-2">{game.descriptor}</span>
                    <span className="mt-1 block text-footnote text-ink-3">{game.blurb}</span>
                  </span>
                </Card>
              </li>
            );
          })}
        </ul>

        <Card className="p-4">
          <p className="text-body font-semibold">Starting a game needs a real backend</p>
          <p className="mt-1 text-footnote text-ink-2">
            The demo garden is read-only. Hook up a free Supabase project and these cards turn into actual games with
            actual friends.
          </p>
          <Link
            href="/demo/setup"
            className="mt-3 inline-flex items-center gap-1 text-footnote font-semibold text-blue-ink"
          >
            Enable real multiplayer <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Card>
      </div>
    </>
  );
}
