# Progress

## Shared desktop game layout — complete

Implementation checkpoint (`02b90c8`):

- Added `GameSessionLayout` around the common `GamePlay` dispatcher, migrating all six games together. Interaction and turn copy come first; catalogue instructions and named player statuses follow on phones/tablets and sit alongside on wide content areas. Container sizing accounts for the app sidebar and larger text.
- `SessionFrame` retains navigation and early reveal. Production enables live player updates; previews reuse the same presentation without subscriptions or polling. Game controls, rules, validation, and local action isolation remain unchanged. Contributor adoption is documented in UI.md and GAME_CONTRACT.md.
- Focused browser matrix passed: seven tests covering all six games at 390/820/1280px, two/eight participants, clue-giver/guesser roles, initial/answering/waiting/reveal, 200% text reflow, reduced motion, keyboard focus and input retained through resize, and no preview backend traffic. The first pass prompted a later tablet breakpoint; container reflow assertions now wait for the browser to settle. `pnpm check` passed (158 unit tests, typecheck, lint). Full verification and screenshot review remain for the next checkpoint.
- Targeted six-game accessibility audit, backend reliability review, and independent contributor integration rehearsal remain pending.

Verification and visual evidence checkpoint:

- Final `pnpm check:full` passed: typecheck, lint, production build, 158 unit tests, 23 database tests, and 47 browser tests. The screenshot-only journey ran separately in the archive. Used free port 3200 because an existing service occupied 3100; the passing run started its own production server.
- `pnpm shots shared-desktop-game-layout` passed all 27 capture journeys and archived 249 images (29.5 MB). Reviewed all six desktop interactions plus phone flow, tablet dark appearance, two/eight players, long names, completed results, 200% text, visible keyboard focus, and held photo uploads. The archive includes real authenticated desktop/tablet screens and isolated previews of the same shared structure.
- Fixed the reproduced Chromium capture issue: full-page capture resets scroll, so viewport images are now captured first. Fixture captures explicitly frame the interaction or focused input. Rebuilt the archive after that correction and reran full verification. No game rules or production action boundaries changed.
- Layout contract and game-specific responsibilities are documented in UI.md and GAME_CONTRACT.md; ROADMAP.md marks the layout complete. The broader six-game accessibility audit is next; backend reliability/recovery review and the independent contributor rehearsal remain pending.

## Priority 2: interactive game previews — complete

- Extracted a required action provider and shared play dispatcher for all six screens. The production provider retains server actions and real photo uploads; preview actions use local state and browser-only image URLs.
- Added viewer-specific answering/waiting snapshots, direct error examples, held pending actions, one-shot simulated failures, retry with retained input, local photo upload/deletion, and replay reset. Only the current viewer-safe snapshot reaches the browser.
- Added local-state unit coverage and real-control browser tests for all six games. `pnpm check:full` passed: typecheck, lint, production build, 158 unit tests, 23 database tests, and 33 browser tests (screenshot-only journey reserved for archive). Initial verification caught a held-transition/release-control issue and ambiguous test selectors; corrected before the passing run.
- `pnpm shots interactive-game-previews` passed all 20 mobile journeys and archived 155 images from the verified implementation. Reviewed real pending controls, retained radio selections/error copy, local photo preview/dialog release controls, and light/dark completed examples. Final `pnpm check` passed again (158 unit tests, lint, typecheck). Implementation and visual evidence are separate commits on `main`.
- Priority 2 meets the original interactive-preview requirement. At that checkpoint, shared desktop layout, targeted game accessibility audit, backend reliability boundaries, and an external contributor integration rehearsal remained open. The shared layout is now complete above.

## Game contributor foundation

1. Complete: extracted typed engine contract (compatible helper re-exports) and participant-safe session projection; documented responsibilities and admission criteria in GAME_CONTRACT.md. Production migration remains last. `pnpm check` passed: typecheck, lint, 107 unit tests.
2. Complete: deterministic builders and examples for all six games at two/three/eight players, initial/waiting/revealed/early states, plus privacy, duplicate guards, round advancement and deleted-photo tests. Preview projection skips live URL signing. `pnpm check` passed: typecheck, lint, 139 unit tests.
3. Implemented last: all six engines now declare their view type against the shared contract; production session projection reuses the participant-safe helper. Shared view types no longer originate in the server data layer. Memories and `/styleguide/games` reuse the same reveal dispatcher. The read-only preview supports four lifecycle snapshots, two/three/eight participants and first/last viewer, with light/dark phone/desktop coverage and no writes. Rules and the six-game catalog are unchanged. `pnpm check:full` passed: typecheck, lint, build, 139 unit tests, 23 database tests, and 19 browser tests (the screenshot-only test runs in the archive command). `pnpm shots game-contract-fixtures` passed all 13 mobile journeys and archived 119 images; reviewed the new light/dark previews, long participant names, and photo placeholders.

Validation note: the first full run passed build, 139 unit and 23 database tests, plus all new fixture browser checks, but an account journey reported `ERR_NETWORK_IO_SUSPENDED` and a clue submission stalled. On a fresh run with idle sleep prevented, both affected journeys passed without code/test changes; the complete run passed. The archive run also passed these journeys. No assertions were weakened.

Each checkpoint has checks and a separate commit. No new games or catalog expansion in this milestone.

## Contributor foundation

- Added root contributor workflow and ownership map, scoped-project/bug issue templates, and PR template. Fixed the ignored environment template so new checkouts can follow setup without credentials. A clean temporary source snapshot installed all 400 packages from the local cache with the frozen lockfile, passed fast checks (104 unit tests), loaded the labelled demo without page errors, and passed all 6 documented demo-only browser checks with blank backend values. Local links, issue frontmatter, blank template credentials, and ignore behavior were checked. An independent contributor trial is still needed. Final `pnpm check:full` passed (104 unit, 23 database, 15 browser tests, build, lint, typecheck).

- Designer handoff and asset inventory: documented source files, rendering contracts, separate preview assets, stable identities, design deliverables, and review expectations. Verified referenced paths and links; `pnpm check:full` passed (104 unit, 23 database, 15 browser tests, build, lint, typecheck).

## Shared UI foundation

- Milestone 1: canonical button variants, named icon actions, associated field help/errors, shared feedback, and contributor UI contract. Regression coverage reproduces the previously missing field description. Verified with `pnpm check:full`: 103 unit tests, 23 database tests, production build, and 8 browser journeys passed. Screenshot-only spec is reserved for the final archive.
- Milestone 2: native-radio ChoiceGroup used by True Colors, ConfirmationSheet used by invite and capacity settings, shared settings feedback, and a 44px named sheet-close action. Added real-flow keyboard and confirmation coverage. `pnpm check:full` passed: 104 unit, 23 database, 9 browser journeys, and build. Radio inputs cover their full visible row after pointer testing caught the initial clipped target.
- Milestone 3: interactive style-guide recipes with real controls, code examples, form validation, disabled choices, pending/error confirmation flows, and light/dark reduced-motion browser coverage on phone and desktop. Fixed the reproduced Shift+Tab escape from sheet controls. `pnpm check:full` passed: 104 unit tests, 23 database tests, production build, and 15 browser tests. `pnpm shots shared-ui-foundation` passed all 11 mobile journeys and archived 95 images; reviewed representative form, choice, game, invite-sheet, and confirmation captures. The no-mistakes executable was unavailable, so validation used repository checks and direct diff review.
- The planning PRD was removed at the owner’s request and is not part of implementation commits.

## Documentation maintenance

- Reconciled setup, repository layout, account portability, Realtime, appearance, and CI descriptions with the current source. Historical verification records remain labeled as historical. This documentation-only update passed `git diff --check`, type checking, lint, 98 unit tests, and 23 database tests. Full verification was attempted, but the production build hit a local Turbopack port-binding permission error even after an elevated retry; browser journeys were therefore not run.

## Completed

- Stage 1: Next.js 16 scaffold (TypeScript, Tailwind v4, ESLint, pnpm, Node 22 via asdf), design tokens, shared UI, app shell, bundled content, twelve garden illustrations, `/styleguide`.
- Stage 2: backend and the Hue Knew? vertical slice.
  - `supabase/migrations/20261029000000_init.sql`: all tables, RLS read policies, `garden_activity` view, private `photos` bucket, and SECURITY DEFINER functions (`create_garden`, `join_garden`, `rotate_invitation`, `create_session`, `submit_answer`, `reveal_round`, `expand_garden`) executable only by the service role.
  - Anonymous auth with cookie sessions (`src/proxy.ts`, `src/lib/supabase/server.ts`, `src/lib/auth.ts`). Profile creation at `/welcome`.
  - Gardens: create at `/start` (size, name, theme, creator timezone), invite links at `/join/[token]`, capacity enforced in the database with row locks, revoke and regenerate links, expand two to eight, garden switcher.
  - Sessions: shared engine interface in `src/lib/games/engine.ts`, data layer in `src/lib/data/sessions.ts` with idempotent reveal and retry on stale submission counts, polling with visibility pause (`AutoRefresh`).
  - Hue Knew?: clue giver flow, slider guessing, automatic reveal, early reveal sheet, labeled markers with overlap lanes, play again.
  - Home with turn status lines, weekly progress, garden preview. Games catalog with color filters and start sheet. Settings page.

- Stage 3: the remaining five games on the same engine, each with an engine module, unit tests, a play screen, and a presentational reveal component reusable by the memories feed.
  - True Colors: circular prediction assignment stored on participants, unscored predictions on early reveal.
  - Hue Clue: deterministic 12 by 8 palette (`src/lib/games/hueCluePalette.ts`), keyboard-navigable grid, magnified swatch, separate confirm, Manhattan scoring.
  - Same Wavelength: exact normalized matching, up to three attempts with earlier answers visible, early reveal ends the session.
  - Palette Picks: pointer drag plus move buttons, pair similarity, shared favorites, biggest splits, most similar pairs with ties.
  - Color Quest: browser resize to 1600px JPEG, server re-validation with sharp (magic bytes, decode, resize, metadata stripped), private bucket with signed URLs, orphan cleanup on the next upload, uploader delete.

- Stage 4: garden, memories, demo mode, resilience, and polish.
  - Garden screen: tappable items in the scene and a grid, a sheet with when the item was earned and that week's rounds (details and links only for participants), weekly copy such as "Three friends added a little color this week."
  - Memories feed (`src/lib/data/memories.ts`, `src/components/memories`): chronological cards per game with compact reveals, score badges, five emoji reactions, one note per participant, game filter in the URL, and a generic "Around the garden" list for rounds the viewer was not in.
  - Demo mode under `/demo` with fixtures in `src/lib/demo.ts`, shown when Supabase variables are missing, redirecting to `/` when they exist, with a setup page explaining how to enable real multiplayer.
  - Backend unavailable handling: connection errors raise `BackendUnavailableError`, caught by `error.tsx` boundaries with a retry button that preserves the route. Friendly not-found page.
  - Polish: app icon and web manifest, skip link, main column shrinks on tablets, catalog layout, hydration fixes (random avatar, share capability), contrast of tertiary text raised to about 4.9:1.

- Redesign (liquid glass pass): new tokens in `globals.css` (warm canvas, ink scale, concentric radii 14/16/20/26/32, glass material with specular edge, spring motion, type scale), floating glass tab bar with a gliding highlight and a circular Start action, glass toolbar buttons beside large titles, inset grouped lists, six original gradient motif tiles and stage art (`src/components/games/motifs`), custom tab icons, richer garden scene drawn edge to edge, Home led by the garden and the next turn, Games with a daily featured pick and a compact list, Garden keepsakes, shared game frame with player status dots, count-up scores and staggered reveals, loading skeleton, shared field styles.

- Account portability: guests attach an email in Settings (`updateUser`), sign in elsewhere with a magic link or code (`/signin`, `/auth/callback`), sign out when kept. Local config allows localhost redirects. Covered by `tests/e2e/account.spec.ts` using the local Mailpit inbox.

- Realtime presence: game pages and Home subscribe to session changes over Supabase Realtime (publication added in `20261031000000_realtime.sql`, row level security decides who receives events), players show a green "here now" ring, and polling remains as the fallback at a slower cadence once the socket is live. The Hue Knew? spec asserts presence and that a clue arrives within 3.5 seconds.

- Refinements: shared-element view transitions (session motif rows morph into the game header, the home garden morphs into the Garden screen, forward and back slides, tab crossfades, all off under reduced motion), automatic dark appearance with the same game identities, a scroll-aware tab bar that compacts on the way down, and garden themes as the personalization lever (six themes, chrome tint variables, time-of-day skies from the garden timezone, creator theme picker on the Garden screen). The home page moved into a `(home)` route group so its loading skeleton does not block morphs elsewhere.

- Quality checks: `pnpm check` (typecheck, lint, unit) and `pnpm check:full` (`scripts/check-full.mjs`: fast checks, production build, database and policy tests, browser journeys against the built app on port 3100, explicit readiness waits, server cleanup, non-zero exit on any failure, refusal to touch non-local backends). New coverage: session lifecycle and late submissions, week boundaries with daylight saving in the garden timezone, rewards surviving a missed week, photo and secret visibility after reveal, table-driven scoring, photo processing and storage error mapping, invalid upload through the UI, a navigation smoke spec on phone and desktop that fails on console errors and on controls hidden behind the tab bar. Playwright fails on retry-only passes. GitHub Actions `check` and `check-full` at the repository root. `TESTING.md` documents commands, prerequisites, CI, investigation, regression tests, and the behavior to check mapping.

- Invite cards: `gardens.invite_card` JSON, `src/lib/inviteCard.ts` parsing, `InviteCardView` in three layouts, builder sheet in Settings with live preview, join landing shows the card, `opengraph-image` route paints the link preview with plain boxes (satori has no SVG motif support yet), `generateMetadata` sets Open Graph and Twitter tags with a versioned image URL. Screenshot archive via `pnpm shots` into `screenshots/<date>-<commit>/`.

## Historical checks performed

These are records of earlier verification runs, not results from the current checkout. Counts reflect different implementation stages.

- `pnpm test`: engine scoring, validation, turn status, week boundaries (10 tests).
- `pnpm test:db` against local Supabase: RLS visibility, service-role-only functions, duplicate submissions, concurrent reveals, simultaneous joins into a two-person garden, ninth member rejected, revoked invites, exactly one weekly reward under simultaneous completions, multi-round sessions count once, stale reveal refused (12 tests).
- `pnpm test:e2e` (Playwright, iPhone 13 viewport): two separate browser sessions create a garden, join by invite, third person sees the full-garden message, play Hue Knew? end to end, guesser HTML never contains the target, refresh keeps state, non-member is redirected away from the session URL.
- `pnpm test:e2e` second spec: three players in a group garden play True Colors (all), Hue Clue (subset, non-participant cannot see it), Same Wavelength (no match then full match), Palette Picks (early reveal with one missing), Color Quest (upload, non-participant blocked, delete), then Home shows the weekly reward.
- `pnpm test:e2e` third spec: memories privacy (non-participant never receives session content), reactions and notes persist across reloads, note removal, URL filter, garden activity entries.
- Garden item sheet, Ada's second garden plus switcher and landing redirect are covered in the first two specs.
- Screenshots reviewed at 390px, 820px, and 1280px for home, games, settings, play screens, garden, memories, and demo pages. No console errors or hydration warnings on the garden routes.
- Resilience: with a signed-in session and the Supabase URL pointed at a closed port, the landing and a garden route both render the "out of reach" retry state on the same URL. With the three variables blank, the landing offers the demo, `/demo/*` renders, and garden routes redirect to `/`.
- Accessibility: skip link is the first tab stop, the tab bar links show a 3px focus ring under `:focus-visible`, with `prefers-reduced-motion` the start sheet opens with animations at 0.01 ms, focus lands inside the dialog, and Escape closes it.
- Redesign verification: three end-to-end specs green after the restyle, screenshots compared before and after at 390px (home, games, garden, memories, each game, reveals, join, welcome, settings), desktop 1280 and tablet 820 home and games, an eight-person garden (home, start sheet, play, early reveal), demo pages under blank variables, retry state unchanged.
- Quality system baseline: `pnpm check:full` passed locally (95 unit, 23 database, 6 browser journeys against the production build).
- Earlier implementation-stage run (all green): `pnpm test` 61 tests, `pnpm test:db` 12 tests, `pnpm test:e2e` 3 specs, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

## Setup requirements

These describe setup for a new environment; they do not establish whether this checkout or a deployment is already configured.

- `.env.local` with Supabase URL, publishable key, and secret key (see `.env.example`).
- Local stack: `pnpm supabase start` (Docker), then `pnpm supabase db reset` to apply migrations. See AGENTS.md for the Docker credential note on this machine.

## Known limitations

- Guest accounts live in one browser until an email is attached in Settings; email links or codes then allow sign-in on another device.
- Realtime updates and presence use polling as a fallback. There are no notifications when the tab is closed.
- In-memory throttling per server instance.
- Appearance follows the device’s light or dark setting; there is no manual switch.
- A memories spec step was observed to flake once when a note was saved while a reaction request was still in flight. The test now waits for the network to settle. Not reproduced since.

## Next steps

- Deploy: create the Supabase project, apply all migrations in filename order, set the variables on Vercel with Root Directory `little-spectrum`, and play a round from two phones.
- Follow `ROADMAP.md` for refinements and future capabilities, including member management and a manual appearance switch.

