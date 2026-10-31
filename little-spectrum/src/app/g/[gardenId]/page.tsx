import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Play, Settings, Sparkles } from "lucide-react";
import { GardenScene } from "@/components/garden/GardenScene";
import { GameMotif } from "@/components/games/motifs/GameMotif";
import { LiveGarden } from "@/components/session/LiveGarden";
import { SessionCardRow } from "@/components/session/SessionCardRow";
import { AvatarStack } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Group, SectionLabel } from "@/components/ui/Card";
import { ToolbarGroup } from "@/components/ui/PageTitle";
import { ShareButton } from "@/components/ui/ShareButton";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES } from "@/lib/colors";
import { getGardenContext, listGardens } from "@/lib/data/gardens";
import { getGrowthSummary } from "@/lib/data/growth";
import { listSessionCards } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";
import { getSiteUrl } from "@/lib/supabase/env";
import { themeFor } from "@/lib/themes";
import { GardenSwitcher } from "./GardenSwitcher";
import { WeeklyProgress } from "./WeeklyProgress";

export const metadata = { title: "Home" };

function greeting(timezone: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: "numeric", hour12: false }).format(new Date()));
  return hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export default async function HomePage({ params, searchParams }: { params: Promise<{ gardenId: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { gardenId } = await params;
  const query = await searchParams;
  const user = await requireUser(`/g/${gardenId}`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const [cards, growth, gardens] = await Promise.all([listSessionCards(gardenId, user.id), getGrowthSummary(gardenId, garden.timezone), listGardens(user.id)]);
  const yourTurn = cards.filter((c) => c.status === "active" && c.turn.needsYou);
  const waiting = cards.filter((c) => c.status === "active" && !c.turn.needsYou);
  const recent = cards.filter((c) => c.status === "revealed").slice(0, 4);
  const inviteUrl = garden.inviteToken ? `${getSiteUrl()}/join/${garden.inviteToken}` : null;
  const solo = garden.members.length < 2;
  const theme = themeFor(garden.theme);
  const hero = yourTurn[0];
  const moreTurns = yourTurn.slice(1);

  return (
    <>
      <LiveGarden gardenId={gardenId} fallbackMs={waiting.length > 0 || yourTurn.length > 0 || solo ? 10000 : 60000} />
      {/* Sky header: the theme's sky bleeds behind the title and fades into the canvas. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72" style={{ background: `linear-gradient(180deg, ${theme.skyTop} 0%, rgba(245,241,234,0) 100%)` }} />

      <header className="flex items-start justify-between gap-3 pt-3 pb-4">
        <div className="min-w-0">
          <p className="text-footnote font-semibold text-ink-2">
            {greeting(garden.timezone)}, {user.displayName}.
          </p>
          <h1 className="line-clamp-2 font-display text-large-title font-bold text-ink">{garden.name}</h1>
        </div>
        <ToolbarGroup>
          {gardens.length > 1 ? <GardenSwitcher gardens={gardens} currentId={gardenId} variant="toolbar" /> : null}
          <Link href={`/g/${gardenId}/settings`} aria-label="Garden settings" className="pressable flex size-9 items-center justify-center rounded-capsule text-ink hover:bg-fill">
            <Settings className="size-[18px]" aria-hidden />
          </Link>
        </ToolbarGroup>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <AvatarStack people={garden.members.map((m) => ({ id: m.userId, name: m.name, avatar: m.avatar }))} size="sm" max={8} />
        <p className="truncate text-callout text-ink-2">
          {garden.members.length > 4 ? `You and ${garden.members.length - 1} friends` : garden.members.map((m) => (m.userId === user.id ? "You" : m.name)).join(", ")}
        </p>
      </div>

      {query.joined ? (
        <p role="status" className="anim-pop mb-4 rounded-row bg-green-soft px-4 py-3 text-callout text-green-ink">
          Welcome to {garden.name}. You are in.
        </p>
      ) : null}

      {/* The garden, edge to edge, with the weekly indicator resting on the ground. */}
      <section className="relative -mx-4 mb-7 md:mx-0">
        <Link href={`/g/${gardenId}/garden`} aria-label="Open the garden" className="block overflow-hidden md:rounded-group">
          <GardenScene theme={garden.theme} items={growth.rewards} compact className="block h-56 w-full md:h-64" animate />
        </Link>
        <div className="glass mx-4 -mt-4 rounded-row px-4 py-3 md:mx-4">
          <WeeklyProgress growth={growth} />
        </div>
      </section>

      {solo && inviteUrl ? (
        <section className="anim-rise mb-7 rounded-group bg-surface p-5 shadow-card ring-1 ring-line">
          <p className="text-title-3 font-bold">Invite a friend to start playing</p>
          <p className="mt-1 mb-4 text-callout text-ink-2">Every game needs two people. Your friend joins in ten seconds, no account needed.</p>
          <ShareButton url={inviteUrl} title={`Join ${garden.name} on Little Spectrum`} text="Come play little games and grow a garden with me." size="lg" full />
        </section>
      ) : null}

      {hero ? (
        <section className="mb-7">
          <SectionLabel>Up next</SectionLabel>
          <Link
            href={`/g/${gardenId}/play/${hero.id}`}
            className={cn("pressable anim-rise block overflow-hidden rounded-group p-5 shadow-card ring-1 ring-line", COLOR_CLASSES[GAMES[hero.game].color].soft)}
          >
            <span className="flex items-center gap-4">
              <GameMotif game={hero.game} size={64} />
              <span className="min-w-0 flex-1">
                <span className="block text-title-3 font-bold text-ink">{GAMES[hero.game].name}</span>
                <span className={cn("block text-callout font-medium", COLOR_CLASSES[GAMES[hero.game].color].ink)}>{hero.turn.line}</span>
                <span className="mt-1 block truncate text-footnote text-ink-2">With {hero.participants.filter((p) => p.userId !== user.id).map((p) => p.name).join(", ")}</span>
              </span>
              <span className={cn("lit flex size-11 shrink-0 items-center justify-center rounded-capsule text-white", COLOR_CLASSES[GAMES[hero.game].color].bgDeep)} aria-hidden>
                <Play className="ml-0.5 size-5" fill="currentColor" />
              </span>
            </span>
          </Link>
          {moreTurns.length > 0 ? (
            <Group className="mt-3">
              {moreTurns.map((card, i) => (
                <SessionCardRow key={card.id} card={card} gardenId={gardenId} emphasize index={i + 1} />
              ))}
            </Group>
          ) : null}
        </section>
      ) : !solo ? (
        <section className="anim-rise mb-7 flex items-center gap-4 rounded-group bg-surface p-5 shadow-card ring-1 ring-line">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-tile bg-amber-soft text-amber-ink">
            <Sparkles className="size-6" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-headline font-semibold">{waiting.length > 0 ? "You are all caught up" : "Nothing in play"}</span>
            <span className="block text-footnote text-ink-2">{waiting.length > 0 ? "Your friends are up. Start another while you wait?" : "Pick a game and your friends get a turn."}</span>
          </span>
          <ButtonLink href={`/g/${gardenId}/games`} size="sm" variant="tinted" accent="coral">
            Start
          </ButtonLink>
        </section>
      ) : null}

      {waiting.length > 0 ? (
        <section className="mb-7">
          <SectionLabel>Waiting on friends</SectionLabel>
          <Group>
            {waiting.map((card, i) => (
              <SessionCardRow key={card.id} card={card} gardenId={gardenId} index={i} />
            ))}
          </Group>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mb-7">
          <SectionLabel
            action={
              <Link href={`/g/${gardenId}/memories`} className="flex items-center gap-1 text-footnote font-semibold text-tint">
                Memories <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          >
            Recently revealed
          </SectionLabel>
          <Group>
            {recent.map((card, i) => (
              <SessionCardRow key={card.id} card={card} gardenId={gardenId} index={i} />
            ))}
          </Group>
        </section>
      ) : null}
    </>
  );
}
