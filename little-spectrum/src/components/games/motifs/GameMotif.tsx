import { useId, type JSX } from "react";
import { GAMES, type GameKey } from "@/lib/games";

// Top is a lighter, warmer tint of the game color, bottom is the base or a touch deeper.
export const MOTIF_GRADIENTS: Record<GameKey, [string, string]> = {
  "hue-knew": ["#ffa07e", "#fb6a45"],
  "true-colors": ["#ff93ab", "#ea5b7d"],
  "hue-clue": ["#ad97f8", "#7e5fe8"],
  "same-wavelength": ["#7faeff", "#427ff5"],
  "palette-picks": ["#ffc46a", "#eb9b26"],
  "color-quest": ["#79cf9a", "#3ea86a"],
};

const WHITE = "#ffffff";

// 28 by 28 glyph shapes, white on the game gradient. Shared by GameGlyph and GameMotif.
function GlyphShapes({ game, id }: { game: GameKey; id: string }): JSX.Element {
  switch (game) {
    case "hue-knew":
      return (
        <>
          <rect x="3" y="15" width="22" height="5" rx="2.5" opacity="0.7" />
          <circle cx="16.5" cy="17.5" r="3.4" />
          <path d="M16.5 14V5.2" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16.5 4.6h6.3l-2.3 2.6 2.3 2.6h-6.3Z" />
        </>
      );
    case "true-colors":
      return (
        <>
          <mask id={`${id}-check`}>
            <rect x="4" y="3.5" width="20" height="9.5" rx="4.75" fill={WHITE} />
            <path
              d="m10.3 8.5 2.4 2.4 5-5.2"
              fill="none"
              stroke="#000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </mask>
          <rect x="4" y="3.5" width="20" height="9.5" rx="4.75" mask={`url(#${id}-check)`} />
          <g opacity="0.7" fill="none" stroke={WHITE} strokeLinecap="round" strokeLinejoin="round">
            <rect x="4.9" y="15.9" width="18.2" height="7.7" rx="3.85" strokeWidth="1.8" />
            <path d="M12.4 18.6a1.6 1.6 0 1 1 2.4 1.4c-.5.3-.8.6-.8 1.1v.2" strokeWidth="1.6" />
          </g>
          <circle cx="14" cy="23.1" r="0.95" opacity="0.7" />
        </>
      );
    case "hue-clue":
      return (
        <>
          <mask id={`${id}-halo`}>
            <rect width="28" height="28" fill={WHITE} />
            <circle cx="14" cy="14" r="6.4" fill="#000" />
          </mask>
          <g mask={`url(#${id}-halo)`} opacity="0.7">
            <rect x="3.75" y="3.75" width="5.5" height="5.5" rx="1.5" />
            <rect x="11.25" y="3.75" width="5.5" height="5.5" rx="1.5" />
            <rect x="18.75" y="3.75" width="5.5" height="5.5" rx="1.5" />
            <rect x="3.75" y="11.25" width="5.5" height="5.5" rx="1.5" />
            <rect x="18.75" y="11.25" width="5.5" height="5.5" rx="1.5" />
            <rect x="3.75" y="18.75" width="5.5" height="5.5" rx="1.5" />
            <rect x="11.25" y="18.75" width="5.5" height="5.5" rx="1.5" />
            <rect x="18.75" y="18.75" width="5.5" height="5.5" rx="1.5" />
          </g>
          <rect x="11.25" y="11.25" width="5.5" height="5.5" rx="1.5" />
          <circle cx="14" cy="14" r="4.7" fill="none" stroke={WHITE} strokeWidth="1.6" />
        </>
      );
    case "same-wavelength":
      return (
        <>
          <rect x="3" y="6.5" width="7.5" height="4.5" rx="1.6" opacity="0.7" />
          <rect x="10.25" y="2.5" width="7.5" height="4.5" rx="1.6" />
          <rect x="17.5" y="6.5" width="7.5" height="4.5" rx="1.6" opacity="0.7" />
          <path d="m8.4 13.3 2.5 2.8M19.6 13.3l-2.5 2.8" stroke={WHITE} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14" cy="20" r="3.3" />
        </>
      );
    case "palette-picks":
      return (
        <>
          <circle cx="5.75" cy="6.75" r="2.1" />
          <circle cx="5.75" cy="14" r="2.1" />
          <circle cx="5.75" cy="21.25" r="2.1" />
          <rect x="10.5" y="4" width="14.5" height="5.5" rx="2.75" />
          <rect x="10.5" y="11.25" width="11" height="5.5" rx="2.75" opacity="0.7" />
          <rect x="10.5" y="18.5" width="7.5" height="5.5" rx="2.75" opacity="0.7" />
        </>
      );
    case "color-quest":
      return (
        <g transform="rotate(-8 14 14)">
          <rect x="4.5" y="6.5" width="19" height="15" rx="3" fill="none" stroke={WHITE} strokeWidth="2" />
          <circle cx="10.5" cy="11.5" r="2.1" />
          <path d="M6.5 20c2.5-4 5-5 7.5-2.8 2-2.6 5-2.4 7.5.6V20Z" opacity="0.7" />
        </g>
      );
  }
}

export function GameGlyph({ game, className }: { game: GameKey; className?: string }): JSX.Element {
  const id = useId();
  return (
    <svg viewBox="0 0 28 28" width="1em" height="1em" fill={WHITE} aria-hidden className={className}>
      <GlyphShapes game={game} id={id} />
    </svg>
  );
}

export function GameMotif({
  game,
  size = 56,
  className,
  title,
}: {
  game: GameKey;
  size?: number;
  className?: string;
  title?: string;
}): JSX.Element {
  const id = useId();
  const [top, bottom] = MOTIF_GRADIENTS[game];
  return (
    <svg viewBox="0 0 56 56" width={size} height={size} role="img" className={className}>
      <title>{title ?? GAMES[game].name}</title>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${id}-hi`} cx="0.5" cy="0" r="0.75">
          <stop offset="0" stopColor={WHITE} stopOpacity="0.35" />
          <stop offset="1" stopColor={WHITE} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-sh`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="14" fill={`url(#${id}-bg)`} />
      <rect width="56" height="56" rx="14" fill={`url(#${id}-hi)`} />
      <rect width="56" height="56" rx="14" fill={`url(#${id}-sh)`} />
      <rect x="0.5" y="0.5" width="55" height="55" rx="13.5" fill="none" stroke={WHITE} strokeOpacity="0.22" />
      <g transform="translate(14 14)" fill={WHITE}>
        <GlyphShapes game={game} id={id} />
      </g>
    </svg>
  );
}

export function GameStageArt({ game, className }: { game: GameKey; className?: string }): JSX.Element {
  const id = useId();
  const [top, bottom] = MOTIF_GRADIENTS[game];
  let art: JSX.Element;
  switch (game) {
    case "hue-knew":
      art = (
        <>
          <defs>
            <linearGradient id={`${id}-bar`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor={top} />
              <stop offset="1" stopColor={bottom} />
            </linearGradient>
          </defs>
          <circle cx="214" cy="76" r="48" fill={top} opacity="0.12" />
          <rect x="36" y="72" width="248" height="18" rx="9" fill={`url(#${id}-bar)`} opacity="0.3" />
          <circle cx="110" cy="81" r="11" fill={top} opacity="0.3" />
          <circle cx="214" cy="81" r="20" fill="none" stroke={bottom} strokeWidth="6" opacity="0.35" />
          <circle cx="214" cy="81" r="6" fill={bottom} opacity="0.35" />
          <path d="M214 56V30" stroke={bottom} strokeWidth="5" strokeLinecap="round" opacity="0.25" />
          <path d="M214 27h30l-9 11 9 11h-30Z" fill={bottom} opacity="0.25" />
        </>
      );
      break;
    case "true-colors":
      art = (
        <>
          <circle cx="160" cy="80" r="66" fill={top} opacity="0.12" />
          <rect x="56" y="32" width="150" height="42" rx="21" fill={top} opacity="0.22" />
          <path
            d="m118 53 10 10 22-22"
            fill="none"
            stroke={bottom}
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
          />
          <rect
            x="116.5"
            y="88.5"
            width="147"
            height="39"
            rx="19.5"
            fill="none"
            stroke={bottom}
            strokeWidth="5"
            opacity="0.25"
          />
          <path
            d="M181 103a8 8 0 1 1 12 7c-2.6 1.4-3.6 3-3.6 5.4v.6"
            fill="none"
            stroke={bottom}
            strokeWidth="6"
            strokeLinecap="round"
            opacity="0.3"
          />
          <circle cx="189.4" cy="121.5" r="3.6" fill={bottom} opacity="0.3" />
        </>
      );
      break;
    case "hue-clue":
      art = (
        <>
          <mask id={`${id}-halo`}>
            <rect width="320" height="160" fill={WHITE} />
            <circle cx="160" cy="80" r="31" fill="#000" />
          </mask>
          <g mask={`url(#${id}-halo)`}>
            <rect x="101" y="21" width="34" height="34" rx="9" fill={top} opacity="0.14" />
            <rect x="143" y="21" width="34" height="34" rx="9" fill={top} opacity="0.2" />
            <rect x="185" y="21" width="34" height="34" rx="9" fill={bottom} opacity="0.18" />
            <rect x="101" y="63" width="34" height="34" rx="9" fill={top} opacity="0.18" />
            <rect x="185" y="63" width="34" height="34" rx="9" fill={bottom} opacity="0.24" />
            <rect x="101" y="105" width="34" height="34" rx="9" fill={bottom} opacity="0.14" />
            <rect x="143" y="105" width="34" height="34" rx="9" fill={bottom} opacity="0.2" />
            <rect x="185" y="105" width="34" height="34" rx="9" fill={bottom} opacity="0.3" />
          </g>
          <rect x="143" y="63" width="34" height="34" rx="9" fill={bottom} opacity="0.35" />
          <circle cx="160" cy="80" r="25" fill="none" stroke={bottom} strokeWidth="5" opacity="0.3" />
        </>
      );
      break;
    case "same-wavelength":
      art = (
        <>
          <circle cx="160" cy="88" r="54" fill="none" stroke={top} strokeWidth="3" opacity="0.12" />
          <circle cx="160" cy="88" r="32" fill="none" stroke={top} strokeWidth="3" opacity="0.18" />
          <rect x="36" y="38" width="64" height="30" rx="10" fill={bottom} opacity="0.2" />
          <rect x="128" y="14" width="64" height="30" rx="10" fill={bottom} opacity="0.3" />
          <rect x="220" y="38" width="64" height="30" rx="10" fill={bottom} opacity="0.2" />
          <path d="m106 66 29 11M214 66l-29 11" stroke={bottom} strokeWidth="5" strokeLinecap="round" opacity="0.25" />
          <circle cx="160" cy="88" r="12" fill={bottom} opacity="0.35" />
        </>
      );
      break;
    case "palette-picks":
      art = (
        <>
          <circle cx="92" cy="80" r="62" fill={top} opacity="0.12" />
          <circle cx="46" cy="43" r="10" fill={bottom} opacity="0.35" />
          <circle cx="46" cy="80" r="10" fill={bottom} opacity="0.28" />
          <circle cx="46" cy="117" r="10" fill={bottom} opacity="0.2" />
          <rect x="68" y="30" width="212" height="26" rx="13" fill={bottom} opacity="0.3" />
          <rect x="68" y="67" width="150" height="26" rx="13" fill={bottom} opacity="0.22" />
          <rect x="68" y="104" width="92" height="26" rx="13" fill={top} opacity="0.2" />
        </>
      );
      break;
    case "color-quest":
      art = (
        <>
          <clipPath id={`${id}-inner`}>
            <rect x="103" y="31" width="114" height="90" rx="11" />
          </clipPath>
          <g transform="rotate(6 160 80)">
            <rect
              x="112"
              y="24"
              width="120"
              height="96"
              rx="14"
              fill="none"
              stroke={top}
              strokeWidth="5"
              opacity="0.14"
            />
          </g>
          <g transform="rotate(-6 160 80)">
            <rect
              x="100"
              y="28"
              width="120"
              height="96"
              rx="14"
              fill="none"
              stroke={bottom}
              strokeWidth="6"
              opacity="0.3"
            />
            <circle cx="134" cy="58" r="12" fill={top} opacity="0.35" />
            <path
              d="M96 128c20-38 44-48 64-24 20-30 44-28 64 0v24Z"
              fill={bottom}
              opacity="0.2"
              clipPath={`url(#${id}-inner)`}
            />
          </g>
        </>
      );
      break;
  }
  return (
    <svg viewBox="0 0 320 160" width="100%" aria-hidden className={className}>
      {art}
    </svg>
  );
}
