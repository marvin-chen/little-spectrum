"use client";
import { GameSessionLayout } from "@/components/session/GameSessionLayout";
import { ColorQuestPlay } from "@/components/games/color-quest/ColorQuestPlay";
import { HueCluePlay } from "@/components/games/hue-clue/HueCluePlay";
import { HueKnewPlay } from "@/components/games/hue-knew/HueKnewPlay";
import { PalettePicksPlay } from "@/components/games/palette-picks/PalettePicksPlay";
import { SameWavelengthPlay } from "@/components/games/same-wavelength/SameWavelengthPlay";
import { TrueColorsPlay } from "@/components/games/true-colors/TrueColorsPlay";
import type { ColorQuestView } from "@/lib/games/colorQuest";
import type { HueClueView } from "@/lib/games/hueClue";
import type { HueKnewView } from "@/lib/games/hueKnew";
import type { PalettePicksView } from "@/lib/games/palettePicks";
import type { SameWavelengthView } from "@/lib/games/sameWavelength";
import type { TrueColorsView } from "@/lib/games/trueColors";
import type { SessionView } from "@/lib/games/sessionView";

export function GamePlay({ session, userId, live = false }: { session: SessionView; userId: string; live?: boolean }) {
  const gardenId = session.gardenId;
  let body: React.ReactNode = null;
  switch (session.game) {
    case "hue-knew":
      body = <HueKnewPlay gardenId={gardenId} session={session} game={session.view as HueKnewView} userId={userId} />;
      break;
    case "true-colors":
      body = (
        <TrueColorsPlay gardenId={gardenId} session={session} game={session.view as TrueColorsView} userId={userId} />
      );
      break;
    case "hue-clue":
      body = <HueCluePlay gardenId={gardenId} session={session} game={session.view as HueClueView} userId={userId} />;
      break;
    case "same-wavelength":
      body = (
        <SameWavelengthPlay
          gardenId={gardenId}
          session={session}
          game={session.view as SameWavelengthView}
          userId={userId}
        />
      );
      break;
    case "palette-picks":
      body = (
        <PalettePicksPlay
          gardenId={gardenId}
          session={session}
          game={session.view as PalettePicksView}
          userId={userId}
        />
      );
      break;
    case "color-quest":
      body = (
        <ColorQuestPlay gardenId={gardenId} session={session} game={session.view as ColorQuestView} userId={userId} />
      );
      break;
  }

  return (
    <GameSessionLayout session={session} userId={userId} live={live}>
      {body}
    </GameSessionLayout>
  );
}
