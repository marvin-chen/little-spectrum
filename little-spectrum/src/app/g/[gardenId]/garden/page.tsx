import { notFound } from "next/navigation";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { getGardenContext } from "@/lib/data/gardens";
import { getGardenDetails, getGrowthSummary } from "@/lib/data/growth";
import { countWord } from "@/lib/games/engine";
import { hourIn, skyFor, themeFor } from "@/lib/themes";
import { WeeklyProgress } from "../WeeklyProgress";
import { GardenView } from "./GardenView";

export const metadata = { title: "Garden" };

export default async function GardenPage({ params }: { params: Promise<{ gardenId: string }> }) {
  const { gardenId } = await params;
  const user = await requireUser(`/g/${gardenId}/garden`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const [growth, details] = await Promise.all([getGrowthSummary(gardenId, garden.timezone), getGardenDetails(gardenId, user.id, garden.timezone)]);
  const theme = themeFor(garden.theme);
  const hour = hourIn(garden.timezone);
  const sky = skyFor(theme, hour);
  const contributors = details.contributorsThisWeek >= 2 ? `${countWord(details.contributorsThisWeek)} friends added a little color this week.` : null;

  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64" style={{ background: `linear-gradient(180deg, ${sky.top} 0%, transparent 100%)`, opacity: sky.night ? 0.5 : 1 }} />
      <header className="flex items-start justify-between gap-3 pt-3 pb-4">
        <div>
          <h1 className="font-display text-large-title font-bold text-ink">Garden</h1>
          <p className="mt-1 text-callout text-ink-2">
            {growth.totalCompletions} {growth.totalCompletions === 1 ? "round" : "rounds"} so far. Nothing here ever wilts.
          </p>
        </div>
        {growth.streak > 1 ? (
          <Badge tone="amber" icon={<Flame className="size-3" aria-hidden />} className="mt-2">
            {growth.streak} weeks running
          </Badge>
        ) : null}
      </header>
      <GardenView gardenId={gardenId} theme={garden.theme} items={details.items} hour={hour} canEditTheme={garden.role === "creator"} />
      <section className={cn("mt-5 rounded-group bg-surface p-4 shadow-card ring-1 ring-line")}>
        <WeeklyProgress growth={growth} />
        <p className="mt-2 text-footnote text-ink-3">
          {contributors ? `${contributors} ` : ""}
          Three finished rounds in a week grow one keepsake.
          {details.items.length === 0 ? " Tap one once it grows to see how it got here." : ""}
        </p>
      </section>
    </>
  );
}
