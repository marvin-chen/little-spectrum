import { notFound } from "next/navigation";
import { PageTitle } from "@/components/ui/PageTitle";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { GAME_KEYS } from "@/lib/games";
import { weekStartFor } from "@/lib/week";
import { isGameAvailable } from "@/lib/games/registry";
import { getSiteUrl } from "@/lib/supabase/env";
import { GamesCatalog } from "./GamesCatalog";

export const metadata = { title: "Games" };

export default async function GamesPage({
  params,
  searchParams,
}: {
  params: Promise<{ gardenId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { gardenId } = await params;
  const query = await searchParams;
  const user = await requireUser(`/g/${gardenId}/games`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();

  // A different featured pick each day, the same for everyone in the garden.
  const day = Number(weekStartFor(new Date(), garden.timezone).replace(/-/g, "")) + new Date().getUTCDay();
  const featured = GAME_KEYS[day % GAME_KEYS.length];

  return (
    <>
      <PageTitle title="Games" subtitle="Short rounds. Play now, reveal together." />
      <GamesCatalog
        gardenId={gardenId}
        currentUserId={user.id}
        members={garden.members.map((m) => ({ userId: m.userId, name: m.name, avatar: m.avatar }))}
        availability={Object.fromEntries(GAME_KEYS.map((k) => [k, isGameAvailable(k)]))}
        inviteUrl={garden.inviteToken ? `${getSiteUrl()}/join/${garden.inviteToken}` : null}
        initialGame={query.start ?? null}
        featured={featured}
      />
    </>
  );
}
