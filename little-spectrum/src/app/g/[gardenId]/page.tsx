import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Settings, Sparkles } from "lucide-react";
import { GardenScene } from "@/components/garden/GardenScene";
import { AutoRefresh } from "@/components/session/AutoRefresh";
import { SessionCardRow } from "@/components/session/SessionCardRow";
import { AvatarStack } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Card, Group, SectionLabel } from "@/components/ui/Card";
import { ShareButton } from "@/components/ui/ShareButton";
import { requireUser } from "@/lib/auth";
import { getGardenContext, listGardens } from "@/lib/data/gardens";
import { getGrowthSummary } from "@/lib/data/growth";
import { listSessionCards } from "@/lib/data/sessions";
import { getSiteUrl } from "@/lib/supabase/env";
import { GardenSwitcher } from "./GardenSwitcher";
import { WeeklyProgress } from "./WeeklyProgress";

export const metadata = { title: "Home" };

function greeting(timezone: string, name: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date()));
  const part = hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return `${part}, ${name}.`;
}

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ gardenId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { gardenId } = await params;
  const query = await searchParams;
  const user = await requireUser(`/g/${gardenId}`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const [cards, growth, gardens] = await Promise.all([
    listSessionCards(gardenId, user.id),
    getGrowthSummary(gardenId, garden.timezone),
    listGardens(user.id),
  ]);
  const yourTurn = cards.filter((c) => c.status === "active" && c.turn.needsYou);
  const waiting = cards.filter((c) => c.status === "active" && !c.turn.needsYou);
  const recent = cards.filter((c) => c.status === "revealed").slice(0, 5);
  const inviteUrl = garden.inviteToken ? `${getSiteUrl()}/join/${garden.inviteToken}` : null;
  const soloGarden = garden.members.length < 2;

  const context = soloGarden
    ? "Your garden is planted. Now invite a friend."
    : yourTurn.length > 0
      ? yourTurn.length === 1
        ? "One little thing is waiting on you."
        : `${yourTurn.length} little things are waiting on you.`
      : waiting.length > 0
        ? "You are all caught up. Your friends are up next."
        : "All quiet. Start something colorful?";

  return (
    <>
      <AutoRefresh intervalMs={10000} enabled={waiting.length > 0 || yourTurn.length > 0 || soloGarden} />
      <header className="flex items-start justify-between gap-3 pt-2 pb-5">
        <div className="min-w-0">
          <p className="text-footnote font-semibold uppercase tracking-[0.06em] text-ink-3">{greeting(garden.timezone, user.displayName)}</p>
          <h1 className="truncate font-display text-title-1 font-bold text-ink">{garden.name}</h1>
          <p className="mt-1 text-callout text-ink-2">{context}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1 pt-1">
          {gardens.length > 1 ? <GardenSwitcher gardens={gardens} currentId={gardenId} variant="title" /> : null}
          <Link href={`/g/${gardenId}/settings`} aria-label="Garden settings" className="pressable flex size-11 items-center justify-center rounded-full text-ink-2 hover:bg-fill">
            <Settings className="size-5" aria-hidden />
          </Link>
        </div>
      </header>

      {query.joined ? (
        <p role="status" className="mb-4 rounded-row bg-green-soft px-4 py-3 text-callout text-green-ink">
          Welcome to {garden.name}. You are in.
        </p>
      ) : null}

      <div className="mb-5 flex items-center gap-3">
        <AvatarStack people={garden.members.map((m) => ({ id: m.userId, name: m.name, avatar: m.avatar }))} size="md" max={8} />
        <p className="text-callout text-ink-2">
          {garden.members.map((m) => (m.userId === user.id ? "You" : m.name)).join(", ")}
        </p>
      </div>

      {soloGarden && inviteUrl ? (
        <Card className="mb-6 p-5">
          <p className="text-title-3 font-semibold">Waiting for a friend</p>
          <p className="mt-1 mb-4 text-callout text-ink-2">
            Games need at least two people. Send the link and they can join in ten seconds, no account needed.
          </p>
          <ShareButton url={inviteUrl} title={`Join ${garden.name} on Little Spectrum`} text="Come play little games and grow a garden with me." size="lg" full />
          <p className="mt-3 break-all text-center text-footnote text-ink-3">{inviteUrl}</p>
        </Card>
      ) : null}

      <section className="mb-6">
        <Link href={`/g/${gardenId}/garden`} className="pressable block overflow-hidden rounded-card shadow-card ring-1 ring-line">
          <GardenScene theme={garden.theme} items={growth.rewards} compact className="block h-40 w-full" />
        </Link>
        <WeeklyProgress growth={growth} memberCount={garden.members.length} />
      </section>

      {yourTurn.length > 0 ? (
        <section className="mb-6">
          <SectionLabel>Your turn</SectionLabel>
          <Group>
            {yourTurn.map((card) => (
              <SessionCardRow key={card.id} card={card} gardenId={gardenId} emphasize />
            ))}
          </Group>
        </section>
      ) : null}

      <section className="mb-6">
        <ButtonLink href={`/g/${gardenId}/games`} size="lg" full accent="coral" icon={<Sparkles className="size-5" aria-hidden />}>
          Start something colorful
        </ButtonLink>
      </section>

      {waiting.length > 0 ? (
        <section className="mb-6">
          <SectionLabel>Waiting on friends</SectionLabel>
          <Group>
            {waiting.map((card) => (
              <SessionCardRow key={card.id} card={card} gardenId={gardenId} />
            ))}
          </Group>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mb-6">
          <SectionLabel
            action={
              <Link href={`/g/${gardenId}/memories`} className="flex items-center gap-1 text-footnote font-semibold text-blue-ink">
                All memories <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          >
            Recently revealed
          </SectionLabel>
          <Group>
            {recent.map((card) => (
              <SessionCardRow key={card.id} card={card} gardenId={gardenId} />
            ))}
          </Group>
        </section>
      ) : null}
    </>
  );
}
