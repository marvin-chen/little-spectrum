import type { ReactNode } from "react";
import { ColorQuestReveal } from "@/components/games/color-quest/ColorQuestReveal";
import { HueClueReveal } from "@/components/games/hue-clue/HueClueReveal";
import { HueKnewReveal } from "@/components/games/hue-knew/HueKnewReveal";
import { PalettePicksReveal } from "@/components/games/palette-picks/PalettePicksReveal";
import { SameWavelengthReveal } from "@/components/games/same-wavelength/SameWavelengthReveal";
import { TrueColorsReveal } from "@/components/games/true-colors/TrueColorsReveal";
import type { SessionView } from "@/lib/games/sessionView";
import type { ColorQuestView } from "@/lib/games/colorQuest";
import type { HueClueView } from "@/lib/games/hueClue";
import type { HueKnewView } from "@/lib/games/hueKnew";
import type { PalettePicksView } from "@/lib/games/palettePicks";
import type { SameWavelengthView } from "@/lib/games/sameWavelength";
import type { TrueColorsView } from "@/lib/games/trueColors";

export function GameReveal({
  session,
  userId,
  compact = false,
}: {
  session: SessionView;
  userId: string;
  compact?: boolean;
}): ReactNode {
  switch (session.game) {
    case "hue-knew": {
      const v = session.view as HueKnewView;
      return v.result ? (
        <HueKnewReveal
          session={session}
          result={v.result}
          left={v.left}
          right={v.right}
          userId={userId}
          compact={compact}
        />
      ) : null;
    }
    case "true-colors": {
      const v = session.view as TrueColorsView;
      return v.result ? (
        <TrueColorsReveal
          session={session}
          prompt={{ text: v.question, options: v.options }}
          result={v.result}
          userId={userId}
          compact={compact}
        />
      ) : null;
    }
    case "hue-clue": {
      const v = session.view as HueClueView;
      return v.result ? <HueClueReveal session={session} result={v.result} userId={userId} compact={compact} /> : null;
    }
    case "same-wavelength": {
      const v = session.view as SameWavelengthView;
      return v.result ? (
        <SameWavelengthReveal session={session} result={v.result} userId={userId} compact={compact} />
      ) : null;
    }
    case "palette-picks": {
      const v = session.view as PalettePicksView;
      return v.result ? (
        <PalettePicksReveal session={session} result={v.result} items={v.items} userId={userId} compact={compact} />
      ) : null;
    }
    case "color-quest":
      return (
        <ColorQuestReveal session={session} game={session.view as ColorQuestView} userId={userId} compact={compact} />
      );
  }
}
