import Link from "next/link";
import { notFound } from "next/navigation";
import { BookHeart } from "lucide-react";
import { GameIcon } from "@/components/games/GameIcon";
import { MemoryCard } from "@/components/memories/MemoryCard";
import { Card, Group, Row, SectionLabel } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageTitle } from "@/components/ui/PageTitle";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { COLOR_CLASSES } from "@/lib/colors";
import { getGardenContext } from "@/lib/data/gardens";
import { formatRevealedDate, listMemories } from "@/lib/data/memories";
import { GAMES, GAME_KEYS, isGameKey } from "@/lib/games";

export const metadata = { title: "Memories" };

const CHIP = "pressable flex h-9 shrink-0 items-center gap-1.5 rounded-capsule px-3.5 text-footnote font-semibold";

export default async function MemoriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ gardenId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { gardenId } = await params;
  const query = await searchParams;
  const user = await requireUser(`/g/${gardenId}/memories`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const filter = query.game && isGameKey(query.game) ? query.game : null;
  const { memories, activity } = await listMemories(gardenId, user.id, filter ?? undefined);
  const base = `/g/${gardenId}/memories`;

  return (
    <>
      <PageTitle title="Memories" subtitle="Every finished round you were part of." />

      <nav aria-label="Filter by game" className="hide-scrollbar -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link
          href={base}
          aria-current={filter === null ? "page" : undefined}
          className={cn(CHIP, filter === null ? "bg-ink text-canvas" : "glass text-ink-2")}
        >
          All games
        </Link>
        {GAME_KEYS.map((key) => {
          const colors = COLOR_CLASSES[GAMES[key].color];
          const on = filter === key;
          return (
            <Link
              key={key}
              href={`${base}?game=${key}`}
              aria-current={on ? "page" : undefined}
              className={cn(CHIP, on ? `${colors.soft} ${colors.ink}` : "glass text-ink-2")}
            >
              <span className={cn("size-3 rounded-full", colors.bg)} aria-hidden />
              {GAMES[key].name}
            </Link>
          );
        })}
      </nav>

      {memories.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookHeart className="size-8" aria-hidden />}
            title={filter ? `No ${GAMES[filter].name} memories yet` : "No memories yet"}
            body={
              filter
                ? "Finish a round of it with you in it and it lands here."
                : "Finished rounds land here, with answers, photos, and scores."
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {memories.map((memory) => (
            <MemoryCard key={memory.session.id} gardenId={gardenId} memory={memory} userId={user.id} />
          ))}
        </div>
      )}

      {activity.length > 0 ? (
        <section className="mt-8">
          <SectionLabel>Around the garden</SectionLabel>
          <Group>
            {activity.slice(0, 10).map((entry) => (
              <Row
                key={entry.id}
                icon={<GameIcon game={entry.game} size="sm" />}
                label={
                  <span className="text-callout text-ink-2">
                    {GAMES[entry.game].name} · {entry.participantCount}{" "}
                    {entry.participantCount === 1 ? "player" : "players"} · {formatRevealedDate(entry.revealedAt)}
                  </span>
                }
              />
            ))}
          </Group>
          <p className="mt-2 px-1 text-footnote text-ink-3">Rounds you were not in still help the garden grow.</p>
        </section>
      ) : null}
    </>
  );
}
