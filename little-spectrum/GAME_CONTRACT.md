# Game contributor contract

The six current games are the core collection. A reusable implementation contract makes a game easier to contribute; it does not automatically earn a place in the catalog. Prefer new prompt packs or a variation within an existing game when the interaction and reveal are substantially the same.

## Before accepting a game project

The owner and reviewer agree on: the distinct social moment it creates, why an existing game cannot provide it, an asynchronous flow for two through eight people, one bounded first release, and who maintains its content. Include a sample prompt, interaction, and reveal. Explain how it fits discovery without another permanent navigation item. Catalog expansion is a separate product decision; no automatic registration or public plugin loading.

Use the repository project issue template. One person owns rules, screens, fixtures, tests, and documentation for that game. Request platform-owner review for shared contracts, session storage, authentication, permissions, growth, or photo handling. See [ownership](../OWNERSHIP.md) and [contributing](../CONTRIBUTING.md).

## Boundaries

| Area | Game contributor owns | Shared platform owns |
|---|---|---|
| Rules | Prompt selection, input validation, completion, early-reveal eligibility, scoring, viewer-safe output, turn copy | Session loading, participant authorization, atomic writes and reveal, stale/duplicate protection, growth |
| Presentation | Play screen and compact/full reveal, using shared UI | Session frame, presence, navigation, common controls |
| Media | Meaning and layout of photos | Validation, private storage, signing, deletion |
| Evidence | Deterministic examples, rule/privacy tests, browser journey, reviewed screenshots | Test runners, CI, shared fixture helpers |

## Engine API

Import `GameEngine<View>` and server state types from `src/lib/games/contract.ts`. Existing helper imports remain available from `engine.ts`. Declare an explicit view type; the same type flows through `view` and optional `hydrateView`.

- `pickPrompt`: use the supplied random function and recent IDs. Return a prompt snapshot, optional secret, and optional prediction assignments. No network or current clock in rule logic.
- `validateSubmission`: accept unknown input and return a normalized payload or a friendly error. Enforce game-specific roles, prerequisites, ranges, and any game-specific duplicate answer rules. The platform separately checks authentication, participation, session status, and stale rounds.
- `isRoundComplete`: decide whether all required answers are present for the current round.
- `earlyRevealCheck`: describe eligibility and missing participant IDs. The platform authorizes the creator and commits the reveal.
- `computeReveal`: compute a result without writes. `final: false` advances the round; it must not award growth. Preserve earlier rounds only when the rules require them.
- `view`: return only what this participant may see. Never spread raw state, secret, submissions, prediction assignments, or storage paths into browser props. Counts and submitted IDs are safe; unrevealed answers from others are not.
- `hydrateView`: optional server lookup, retaining the same view shape. Sign only photos already authorized by `view`. Do not fetch additional participants' answers.
- `turnStatus`: short actionable copy, consistent with the play screen.

`projectSession` in `sessionView.ts` builds the explicit public envelope, rejects non-participants before view/hydration, and checks engine identity. Real state stays in server code. The caller still authenticates the viewer and verifies garden access; this helper is not an authentication mechanism. Type-only imports of contracts are safe in client screens.

## Acceptance checklist

1. Agree on the issue, owner, reviewer, rules, discovery, and exclusions first.
2. Add content and pure engine implementation with a concrete view type. Test invalid input, duplicates, scoring boundaries, completion, early reveal, viewer privacy, and any round advancement.
3. Supply deterministic fixtures for initial input, waiting, completed and partial reveals, two and eight players, both clue roles where applicable, and game-specific failure states. Use synthetic identities and media only. Preview examples must never call production writes.
4. Build play and compact/full reveal with [shared UI](UI.md), clear pending/retry feedback, keyboard operation, and long-content handling. Do not duplicate session persistence or rewards.
5. Integrate explicitly: game metadata and key, engine registry, play dispatch, memory/reveal dispatch, catalog admission, content, and relevant database game constraints. Search existing keys to locate integration points; a frontend key alone does not change database constraints.
6. Add a browser journey through actual submission and reveal. Check privacy with a second participant and outsider, refresh, narrow/wide screens, light/dark, and reduced motion. Follow [TESTING.md](TESTING.md); a fixture test does not replace database or browser tests.
7. Update roadmap, progress, asset inventory if needed, and screenshot archive for visible changes. Run `pnpm check` per commit and `pnpm check:full` before final push.

All six current engines use the typed contract, and production sessions use the shared projection. Existing rules remain unchanged.

## Fixture walkthrough

`src/lib/games/fixtures/builders.ts` is the reusable toolkit. Pass your engine into `createFixture(engine, 3)`, then use `submitFixture(engine, state, participantId, input)` to build answers through its real validator. `revealFixture(engine, state)` refuses incomplete rounds; pass `true` only for an eligible early reveal. These helpers return independent state snapshots, model duplicate writes and round advancement, and never touch a backend or award growth.

`examples.ts` supplies the six core games with `initial`, `waiting`, `revealed`, and `early` examples. A waiting snapshot is captured after submission and before automatic completion processing; for two players that can already be a complete round. Use three or eight players for an early reveal with someone missing.

Raw fixture state includes synthetic secrets and is for server code and tests only. Call `previewFixture(engine, state, viewerId)` before passing props to a preview. It checks participation, calls the real viewer projection, and intentionally skips URL signing. Server fixture photo URLs stay null; deleted-photo examples remove the reference after reveal. No credentials, real people, external images, or network calls are needed. Do not wire preview controls to production actions.

For a new game, supply its own valid inputs and exceptional examples while reusing these builders. The table-driven tests in `fixtures/fixtures.test.ts` demonstrate lifecycle checks. Add precise privacy assertions for your payload; passing the shared matrix alone does not prove that a new view cannot leak answers.

Visit `/styleguide/games` without signing in. Choose a game, lifecycle state, player count, and first/last viewer. `initial` shows the start of the round; `answering` makes the selected viewer actionable (including guessers after a clue); `waiting` locks in that viewer's example answer. `error` opens the real screen with a retry message. `pending` holds the next action until you choose **Finish pending action**. `early` and `revealed` show the real completed play screens.

All six games render through `GamePlay`, shared with the production play route. Every screen requires `GameActionsProvider`; there is no implicit production fallback. `ProductionGameActions` provides real server actions and the photo endpoint only in authenticated play routes. The fixture page supplies local actions. Never import production actions or data access into a play screen; extend the action interface if another operation needs simulation.

Use **Fail next action** to exercise failure and retry while keeping the input. The checkbox resets after one attempt, so retry can succeed. Use **Hold next action pending** to inspect disabled controls and photo dialogs; release controls are available inside photo dialogs too. Preview submissions update only the viewer's own data, leave friends' answers hidden, and wait until you select a completed snapshot. They do not compute scores, advance multiplayer rounds, or award growth. Real validators and scoring are exercised separately through the fixture builders and integration tests.

Photo selection uses the real browser preparation flow; the resulting image remains a local blob URL. Upload and deletion affect only the preview, and URLs are revoked when resetting or leaving. **Play again** returns to the initial fixture. Reloading or changing the game/state/participants/viewer resets local changes. Synthetic photo snapshots have no live image URLs. Use actual backend browser journeys to verify authorization, persistence, multiplayer completion, and storage behavior.

## Play layout adoption

Register the screen in `GamePlay` to inherit `GameSessionLayout` in production and previews. Supply concise `GAMES[key].howTo` instructions; keep the game screen responsible for its prompt, role-specific help, controls, pending/error state, and reveal/replay. Do not wrap the screen in another desktop grid or repeat the participant list. See [UI.md](UI.md#shared-game-layout) for width, reading order, and live/preview boundaries. Browser acceptance lives in `tests/e2e/game-layout.spec.ts`; add the new game to the shared catalog to join that matrix.
