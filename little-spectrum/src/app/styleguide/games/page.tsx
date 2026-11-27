import Link from "next/link";
import { GamePreview } from "./GamePreview";
import { Card } from "@/components/ui/Card";
import { PageTitle } from "@/components/ui/PageTitle";
import { GAME_KEYS, GAMES, isGameKey } from "@/lib/games";
import { previewFixture } from "@/lib/games/fixtures/builders";
import { PREVIEW_SCENARIOS, playerExample, type PreviewScenario } from "@/lib/games/fixtures/examples";
import { getEngine } from "@/lib/games/registry";

export const metadata = { title: "Game fixtures", robots: { index: false, follow: false } };

export default async function GameFixturesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const game = typeof params.game === "string" && isGameKey(params.game) ? params.game : "hue-knew";
  const scenario = PREVIEW_SCENARIOS.includes(params.scenario as PreviewScenario)
    ? (params.scenario as PreviewScenario)
    : "revealed";
  const players = params.players === "2" ? 2 : params.players === "8" ? 8 : 3;
  const viewerIndex = params.viewer === "last" ? players - 1 : 0;
  const state = playerExample(game, scenario, players, viewerIndex);
  const userId = state.participants[viewerIndex].userId;
  const session = await previewFixture(getEngine(game), state, userId);
  const href = (values: Record<string, string>) =>
    `?${new URLSearchParams({ game, scenario, players: String(players), viewer: viewerIndex ? "last" : "first", ...values })}`;
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-5 py-8">
      <Link href="/styleguide" className="text-footnote underline">
        Back to style guide
      </Link>
      <PageTitle
        eyebrow="Contributor tools"
        title="Game fixtures"
        subtitle="Play with synthetic examples. All actions stay in this preview."
      />
      <nav aria-label="Fixture game" className="flex flex-wrap gap-3">
        {GAME_KEYS.map((key) => (
          <Link
            key={key}
            href={href({ game: key })}
            aria-current={game === key ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-control px-3 py-2 text-footnote underline aria-[current=page]:bg-fill"
          >
            {GAMES[key].name}
          </Link>
        ))}
      </nav>
      <nav aria-label="Fixture state" className="flex flex-wrap gap-3">
        {PREVIEW_SCENARIOS.map((value) => (
          <Link
            key={value}
            href={href({ scenario: value })}
            aria-current={scenario === value ? "page" : undefined}
            className="inline-flex min-h-11 items-center rounded-control px-3 py-2 text-footnote underline aria-[current=page]:bg-fill"
          >
            {value}
          </Link>
        ))}
      </nav>
      <nav aria-label="Fixture participants" className="flex flex-wrap gap-3 text-footnote">
        {([2, 3, 8] as const).map((count) => (
          <Link
            key={count}
            href={href({ players: String(count) })}
            className="inline-flex min-h-11 items-center px-3 py-2 underline"
            aria-current={players === count ? "page" : undefined}
          >
            {count} players
          </Link>
        ))}
        <Link
          href={href({ viewer: viewerIndex ? "first" : "last" })}
          className="inline-flex min-h-11 items-center px-3 py-2 underline"
        >
          Switch viewer
        </Link>
      </nav>
      <Card className="p-5">
        <h2 className="text-title-3 font-semibold">{GAMES[game].name}</h2>
        <p className="text-footnote text-ink-2">
          Viewing as {state.participants[viewerIndex].name} · {scenario} · {players} players
        </p>
        <p className="mt-2 text-body">{session.turn.line}</p>
        <p className="mt-2 text-footnote text-ink-2">
          These are the actual game screens. Uploads stay in browser memory. Pending actions can be held and released;
          failed actions can be retried. Reload or change a fixture to reset.
        </p>
      </Card>
      <GamePreview
        key={`${game}-${scenario}-${players}-${userId}`}
        initial={session}
        userId={userId}
        mode={scenario}
        restartHref={href({ scenario: "initial" })}
      />
    </main>
  );
}
