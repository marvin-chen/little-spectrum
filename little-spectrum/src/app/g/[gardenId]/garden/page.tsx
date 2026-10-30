import { notFound } from "next/navigation";
import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PageTitle } from "@/components/ui/PageTitle";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { getGardenDetails, getGrowthSummary } from "@/lib/data/growth";
import { countWord } from "@/lib/games/engine";
import { GardenView } from "./GardenView";

export const metadata = { title: "Garden" };

export default async function GardenPage({ params }: { params: Promise<{ gardenId: string }> }) {
  const { gardenId } = await params;
  const user = await requireUser(`/g/${gardenId}/garden`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const [growth, details] = await Promise.all([getGrowthSummary(gardenId, garden.timezone), getGardenDetails(gardenId, user.id, garden.timezone)]);

  const weekLine = growth.rewardedThisWeek
    ? "Your garden grew something new this week."
    : `${growth.completionsThisWeek} of ${growth.goal} little moments this week.`;
  const contributors =
    details.contributorsThisWeek >= 2
      ? `${countWord(details.contributorsThisWeek)} friends added a little color this week.`
      : growth.completionsThisWeek === 0
        ? "Nothing played yet this week. No rush."
        : null;

  return (
    <>
      <PageTitle
        title="Garden"
        subtitle={`${growth.totalCompletions} ${growth.totalCompletions === 1 ? "little moment" : "little moments"} so far. Nothing here ever wilts.`}
        action={
          growth.streak > 1 ? (
            <Badge tone="amber" icon={<Flame className="size-3" aria-hidden />}>
              {growth.streak} weeks running
            </Badge>
          ) : null
        }
      />
      <GardenView gardenId={gardenId} theme={garden.theme} items={details.items} />
      <div className="mt-4 rounded-card bg-surface p-4 shadow-card ring-1 ring-line">
        <p className="text-body font-semibold">{weekLine}</p>
        <p className="mt-1 text-footnote text-ink-2">
          {contributors ? `${contributors} ` : ""}
          Three finished rounds in a week grow one new item. The week resets {growth.weekResetLabel}.
        </p>
        {details.items.length === 0 ? <p className="mt-2 text-footnote text-ink-3">Tap an item once it grows to see when it was earned.</p> : null}
      </div>
    </>
  );
}
