import { notFound } from "next/navigation";
import { GardenScene } from "@/components/garden/GardenScene";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { getGrowthSummary } from "@/lib/data/growth";

export const metadata = { title: "Garden" };

export default async function GardenPage({ params }: { params: Promise<{ gardenId: string }> }) {
  const { gardenId } = await params;
  const user = await requireUser(`/g/${gardenId}/garden`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const growth = await getGrowthSummary(gardenId, garden.timezone);

  return (
    <>
      <PageTitle title="Garden" subtitle={`${growth.totalCompletions} little moments so far.`} />
      <Card className="overflow-hidden">
        <GardenScene theme={garden.theme} items={growth.rewards} className="block w-full" />
      </Card>
      <p className="mt-4 text-callout text-ink-2">
        {growth.rewards.length === 0
          ? "Finish three games in one week and something new will grow here."
          : `${growth.rewards.length} ${growth.rewards.length === 1 ? "item" : "items"} earned. Nothing here ever wilts.`}
      </p>
    </>
  );
}
