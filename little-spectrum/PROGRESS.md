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

## Checks performed

- `pnpm test`: engine scoring, validation, turn status, week boundaries (10 tests).
- `pnpm test:db` against local Supabase: RLS visibility, service-role-only functions, duplicate submissions, concurrent reveals, simultaneous joins into a two-person garden, ninth member rejected, revoked invites, exactly one weekly reward under simultaneous completions, multi-round sessions count once, stale reveal refused (12 tests).
- `pnpm test:e2e` (Playwright, iPhone 13 viewport): two separate browser sessions create a garden, join by invite, third person sees the full-garden message, play Hue Knew? end to end, guesser HTML never contains the target, refresh keeps state, non-member is redirected away from the session URL.
- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` pass.

## Configuration still needed

- `.env.local` with Supabase URL, publishable key, and secret key (see `.env.example`).
- Local stack: `pnpm supabase start` (Docker), then `pnpm supabase db reset` to apply migrations. See AGENTS.md for the Docker credential note on this machine.

## Next steps

- Stage 3: True Colors, Hue Clue, Same Wavelength, Palette Picks, Color Quest on the same engine.
- Stage 4: garden item sheet, memories feed with reactions and comments, photo upload pipeline, demo mode, accessibility pass, polish.
