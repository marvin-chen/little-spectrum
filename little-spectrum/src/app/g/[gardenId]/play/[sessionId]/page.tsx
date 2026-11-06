import { GamePlay } from "@/components/games/GamePlay";
import { ProductionGameActions } from "@/components/games/ProductionGameActions";
import { notFound } from "next/navigation";
import { SessionFrame } from "@/components/session/SessionFrame";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { getSessionView } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ gardenId: string; sessionId: string }> }) {
  const { gardenId, sessionId } = await params;
  const user = await requireUser(`/g/${gardenId}/play/${sessionId}`);
  const view = await getSessionView(sessionId, user.id);
  return { title: view ? GAMES[view.game].name : "Game" };
}

export default async function PlayPage({ params }: { params: Promise<{ gardenId: string; sessionId: string }> }) {
  const { gardenId, sessionId } = await params;
  const user = await requireUser(`/g/${gardenId}/play/${sessionId}`);
  const garden = await getGardenContext(gardenId, user.id);
  if (!garden) notFound();
  const view = await getSessionView(sessionId, user.id);
  if (!view || view.gardenId !== gardenId) notFound();


  return (
    <SessionFrame gardenId={gardenId} session={view} userId={user.id}>
      <ProductionGameActions><GamePlay session={view} userId={user.id} /></ProductionGameActions>
    </SessionFrame>
  );
}
