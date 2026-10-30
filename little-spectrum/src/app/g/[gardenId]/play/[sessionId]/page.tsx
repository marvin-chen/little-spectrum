import { notFound } from "next/navigation";
import { HueKnewPlay } from "@/components/games/hue-knew/HueKnewPlay";
import { SessionFrame } from "@/components/session/SessionFrame";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { getSessionView } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";
import type { HueKnewView } from "@/lib/games/hueKnew";

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

  let body: React.ReactNode = null;
  switch (view.game) {
    case "hue-knew":
      body = <HueKnewPlay gardenId={gardenId} session={view} game={view.view as HueKnewView} userId={user.id} />;
      break;
    default:
      body = <p className="text-callout text-ink-2">This game is not available yet.</p>;
  }

  return (
    <SessionFrame gardenId={gardenId} session={view} userId={user.id}>
      {body}
    </SessionFrame>
  );
}
