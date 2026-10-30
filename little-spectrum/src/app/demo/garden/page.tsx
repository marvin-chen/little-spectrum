import { GardenScene } from "@/components/garden/GardenScene";
import { getGardenItem } from "@/components/garden/items";
import { Card, Group, Row, SectionLabel } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { DEMO_GARDEN, DEMO_GROWTH } from "@/lib/demo";

export const metadata = { title: "Garden" };

function weekLabel(weekStart: string): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { timeZone: "UTC", month: "short", day: "numeric" }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export default function DemoGardenPage() {
  const rewards = DEMO_GROWTH.rewards;
  return (
    <>
      <PageTitle title="Garden" subtitle={`${DEMO_GROWTH.totalCompletions} little moments so far.`} />
      <Card className="overflow-hidden">
        <GardenScene theme={DEMO_GARDEN.theme} items={rewards} className="block w-full" />
      </Card>
      <p className="mt-4 mb-6 text-callout text-ink-2">
        {rewards.length} {rewards.length === 1 ? "item" : "items"} earned. Nothing here ever wilts.
      </p>
      <section>
        <SectionLabel>What grew here</SectionLabel>
        <Group>
          {[...rewards].reverse().map((reward) => {
            const item = getGardenItem(reward.itemKey);
            if (!item) return null;
            const Item = item.Component;
            return (
              <Row
                key={reward.id}
                icon={
                  <svg viewBox="0 0 100 120" className="size-8" aria-hidden>
                    <Item variant={reward.variant} />
                  </svg>
                }
                label={item.name}
                detail={
                  <>
                    {item.blurb} Earned the week of {weekLabel(reward.weekStart)}.
                  </>
                }
              />
            );
          })}
        </Group>
      </section>
    </>
  );
}
