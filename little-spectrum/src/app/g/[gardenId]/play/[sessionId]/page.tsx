import { notFound } from "next/navigation";
import { ColorQuestPlay } from "@/components/games/color-quest/ColorQuestPlay";
import { HueCluePlay } from "@/components/games/hue-clue/HueCluePlay";
import { HueKnewPlay } from "@/components/games/hue-knew/HueKnewPlay";
import { PalettePicksPlay } from "@/components/games/palette-picks/PalettePicksPlay";
import { SameWavelengthPlay } from "@/components/games/same-wavelength/SameWavelengthPlay";
import { TrueColorsPlay } from "@/components/games/true-colors/TrueColorsPlay";
import { SessionFrame } from "@/components/session/SessionFrame";
import { requireUser } from "@/lib/auth";
import { getGardenContext } from "@/lib/data/gardens";
import { getSessionView } from "@/lib/data/sessions";
import { GAMES } from "@/lib/games";
import type { ColorQuestView } from "@/lib/games/colorQuest";
import type { HueClueView } from "@/lib/games/hueClue";
import type { HueKnewView } from "@/lib/games/hueKnew";
import type { PalettePicksView } from "@/lib/games/palettePicks";
import type { SameWavelengthView } from "@/lib/games/sameWavelength";
import type { TrueColorsView } from "@/lib/games/trueColors";

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
    case "true-colors":
      body = <TrueColorsPlay gardenId={gardenId} session={view} game={view.view as TrueColorsView} userId={user.id} />;
      break;
    case "hue-clue":
      body = <HueCluePlay gardenId={gardenId} session={view} game={view.view as HueClueView} userId={user.id} />;
      break;
    case "same-wavelength":
      body = <SameWavelengthPlay gardenId={gardenId} session={view} game={view.view as SameWavelengthView} userId={user.id} />;
      break;
    case "palette-picks":
      body = <PalettePicksPlay gardenId={gardenId} session={view} game={view.view as PalettePicksView} userId={user.id} />;
      break;
    case "color-quest":
      body = <ColorQuestPlay gardenId={gardenId} session={view} game={view.view as ColorQuestView} userId={user.id} />;
      break;
  }

  return (
    <SessionFrame gardenId={gardenId} session={view} userId={user.id}>
      {body}
    </SessionFrame>
  );
}
