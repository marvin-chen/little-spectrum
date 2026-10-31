# Progress

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

## Checks performed

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
- Final run (all green): `pnpm test` 61 tests, `pnpm test:db` 12 tests, `pnpm test:e2e` 3 specs, `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`.

## Configuration still needed

- `.env.local` with Supabase URL, publishable key, and secret key (see `.env.example`).
- Local stack: `pnpm supabase start` (Docker), then `pnpm supabase db reset` to apply migrations. See AGENTS.md for the Docker credential note on this machine.

## Known limitations

- Guest accounts live in one browser. No email login or recovery by design.
- Polling instead of realtime. Updates land within about four seconds while the tab is visible.
- In-memory throttling per server instance.
- Light appearance only.
- A memories spec step was observed to flake once when a note was saved while a reaction request was still in flight. The test now waits for the network to settle. Not reproduced since.

## Next steps

- Deploy: create the Supabase project, apply the migration, set the variables on Vercel with Root Directory `little-spectrum`, and play a round from two phones.
- Optional later: Supabase Realtime instead of polling, dark mode, removing members.

