import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { WeeklyProgress } from "@/app/g/[gardenId]/WeeklyProgress";
import { GardenScene } from "@/components/garden/GardenScene";
import { AvatarStack } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Group, SectionLabel } from "@/components/ui/Card";
import { DEMO_CARDS, DEMO_GARDEN, DEMO_GROWTH, DEMO_VIEWER_ID } from "@/lib/demo";
import { DemoSessionRow } from "./DemoSessionRow";

export const metadata = { title: "Demo home" };

function greeting(timezone: string, name: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date()));
  const part = hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}.`;
}

export default function DemoHomePage() {
  const viewer = DEMO_GARDEN.members.find((m) => m.userId === DEMO_VIEWER_ID) ?? DEMO_GARDEN.members[0];
  const yourTurn = DEMO_CARDS.filter((c) => c.status === "active" && c.turn.needsYou);
  const waiting = DEMO_CARDS.filter((c) => c.status === "active" && !c.turn.needsYou);
  const recent = DEMO_CARDS.filter((c) => c.status === "revealed").slice(0, 5);
  const context =
    yourTurn.length === 1 ? "One little thing is waiting on you." : `${yourTurn.length} little things are waiting on you.`;

  return (
    <>
      <header className="pt-2 pb-5">
        <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{greeting(DEMO_GARDEN.timezone, viewer.name)}</p>
        <h1 className="truncate font-display text-title-1 font-bold text-ink">{DEMO_GARDEN.name}</h1>
        <p className="mt-1 text-callout text-ink-2">{context}</p>
      </header>

      <div className="mb-5 flex items-center gap-3">
        <AvatarStack people={DEMO_GARDEN.members.map((m) => ({ id: m.userId, name: m.name, avatar: m.avatar }))} size="md" max={8} />
        <p className="text-callout text-ink-2">
          {DEMO_GARDEN.members.map((m) => (m.userId === DEMO_VIEWER_ID ? "You" : m.name)).join(", ")}
        </p>
      </div>

      <section className="mb-6">
        <Link href="/demo/garden" className="pressable block overflow-hidden rounded-card shadow-card ring-1 ring-line">
          <GardenScene theme={DEMO_GARDEN.theme} items={DEMO_GROWTH.rewards} compact className="block h-40 w-full" />
        </Link>
        <WeeklyProgress growth={DEMO_GROWTH} memberCount={DEMO_GARDEN.members.length} />
      </section>

      {yourTurn.length > 0 ? (
        <section className="mb-6">
          <SectionLabel>Your turn</SectionLabel>
          <Group>
            {yourTurn.map((card) => (
              <DemoSessionRow key={card.id} card={card} emphasize />
            ))}
          </Group>
        </section>
      ) : null}

      <section className="mb-6">
        <ButtonLink href="/demo/games" size="lg" full accent="coral" icon={<Sparkles className="size-5" aria-hidden />}>
          Start something colorful
        </ButtonLink>
      </section>

      {waiting.length > 0 ? (
        <section className="mb-6">
          <SectionLabel>Waiting on friends</SectionLabel>
          <Group>
            {waiting.map((card) => (
              <DemoSessionRow key={card.id} card={card} />
            ))}
          </Group>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mb-6">
          <SectionLabel
            action={
              <Link href="/demo/memories" className="flex items-center gap-1 text-footnote font-semibold text-blue-ink">
                All memories <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          >
            Recently revealed
          </SectionLabel>
          <Group>
            {recent.map((card) => (
              <DemoSessionRow key={card.id} card={card} />
            ))}
          </Group>
        </section>
      ) : null}
    </>
  );
}
