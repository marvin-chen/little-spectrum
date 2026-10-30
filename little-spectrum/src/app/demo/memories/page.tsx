import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import { GameIcon } from "@/components/games/GameIcon";
import { HueClueReveal } from "@/components/games/hue-clue/HueClueReveal";
import { HueKnewReveal } from "@/components/games/hue-knew/HueKnewReveal";
import { PalettePicksReveal } from "@/components/games/palette-picks/PalettePicksReveal";
import { SameWavelengthReveal } from "@/components/games/same-wavelength/SameWavelengthReveal";
import { TrueColorsReveal } from "@/components/games/true-colors/TrueColorsReveal";
import { AvatarStack } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { DEMO_GARDEN, DEMO_RESULTS, DEMO_VIEWER_ID, type DemoResult } from "@/lib/demo";
import { GAMES } from "@/lib/games";

export const metadata = { title: "Memories" };

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: DEMO_GARDEN.timezone, month: "short", day: "numeric" }).format(new Date(iso));
}

function Reveal({ entry }: { entry: DemoResult }) {
  switch (entry.game) {
    case "hue-knew":
      return <HueKnewReveal session={entry.session} result={entry.result} left={entry.left} right={entry.right} userId={DEMO_VIEWER_ID} compact />;
    case "true-colors":
      return <TrueColorsReveal session={entry.session} prompt={entry.prompt} result={entry.result} userId={DEMO_VIEWER_ID} compact />;
    case "hue-clue":
      return <HueClueReveal session={entry.session} result={entry.result} userId={DEMO_VIEWER_ID} compact />;
    case "same-wavelength":
      return <SameWavelengthReveal session={entry.session} result={entry.result} userId={DEMO_VIEWER_ID} compact />;
    case "palette-picks":
      return <PalettePicksReveal session={entry.session} result={entry.result} items={entry.items} userId={DEMO_VIEWER_ID} compact />;
  }
}

export default function DemoMemoriesPage() {
  return (
    <>
      <PageTitle title="Memories" subtitle="Every reveal, kept. Only the people who played can see it." />
      <div className="flex flex-col gap-8">
        {DEMO_RESULTS.map((entry) => {
          const game = GAMES[entry.game];
          const people = entry.session.participants.map((p) => ({ id: p.userId, name: p.name, avatar: p.avatar }));
          return (
            <section key={entry.session.id} aria-labelledby={`${entry.session.id}-title`}>
              <header className="mb-3 flex items-center gap-3 px-1">
                <GameIcon game={entry.game} size="sm" />
                <div className="min-w-0 flex-1">
                  <h2 id={`${entry.session.id}-title`} className="truncate text-body font-semibold text-ink">
                    {game.name}
                  </h2>
                  <p className="text-footnote text-ink-3">{formatDate(entry.session.revealedAt ?? entry.session.createdAt)}</p>
                </div>
                <AvatarStack people={people} size="xs" max={4} />
              </header>
              <Reveal entry={entry} />
            </section>
          );
        })}
        <Card className="flex items-start gap-3 bg-surface-2 p-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-row bg-green-soft text-green-ink">
            <Camera className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-body font-semibold text-ink">Color Quest photos live here too</p>
            <p className="mt-1 text-footnote text-ink-2">
              Photo memories need somewhere private to live, so they appear once the backend is configured. The demo
              keeps its camera roll to itself.
            </p>
            <Link href="/demo/setup" className="mt-2 inline-flex items-center gap-1 text-footnote font-semibold text-blue-ink">
              Enable real multiplayer <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
