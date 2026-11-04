<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Little Spectrum agent guide

This is the quick pickup guide for the repository.
Read it first, then `SPEC.md` (product specification, the source of truth for behavior), `PROGRESS.md` (current state and checks), and `README.md` (setup guide for people deploying the app).

## What this project is

Little Spectrum is a private, mobile-first website where long-distance friends play six short asynchronous games, share photos, and grow an illustrated garden together.
It is a small personal, noncommercial project that must run on free tiers only: Next.js on Vercel Hobby, Supabase Free for Postgres, anonymous auth, and private photo storage.
There are no paid APIs, no SMS, no scheduled jobs for gameplay, and no always-on server. Optional email links or codes let guests keep their accounts and sign in on another device.

## Repository layout

The Git root is the project checkout, one level above this application directory.
It contains the root README, `.gitignore`, `.github/workflows/`, and `little-spectrum/`.
The root `.gitignore` ignores `.DS_Store`; application ignore rules live in `little-spectrum/.gitignore`.
Stage intended files explicitly and inspect the diff before committing.

```
little-spectrum/               the Next.js application (Vercel Root Directory)
  SPEC.md                      product specification
  PROGRESS.md                  completed work, checks performed, next steps
  AGENTS.md                    this guide plus learnings
  README.md                    setup guide, limits, privacy model, known limitations
  .env.example                 environment variable template
  supabase/migrations/         schema, RLS policies, private photos bucket, SECURITY DEFINER functions
  supabase/config.toml         local stack config (anonymous sign-ins enabled)
  src/app/                     App Router routes
    page.tsx                   landing, redirects signed-in users to their last garden
    welcome/ start/ join/      onboarding: profile, create garden, accept invitation
    signin/ auth/callback/    email link or code sign-in and callback
    g/[gardenId]/              garden shell: home, games, play/[sessionId], garden, memories, settings
    api/photos/                photo upload route (multipart) and delete action
    demo/                      read-only demo mode, used when Supabase env vars are missing
    error.tsx not-found.tsx    friendly retry and 404 states
  src/proxy.ts                 refreshes Supabase auth cookies, remembers the last garden
  src/lib/
    supabase/                  env detection, cookie-backed user client, service-role client
    auth.ts                    getCurrentUser and requireUser (profile required)
    data/                      server data layer: gardens, sessions, growth, memories
    games/                     engine.ts interface plus one module per game, all unit tested
    photos/                    client resize (canvas) and server validation (sharp), signed URLs
    week.ts themes.ts colors.ts games.ts avatars.ts ratelimit.ts backend.ts demo.ts
  src/components/
    ui/                        design system: Button, Card, Sheet, SegmentedControl, Avatar, Badge, Slider, ShareButton
    shell/                     AppShell with bottom tab bar on mobile and sidebar on desktop
    garden/                    GardenScene and the twelve illustrated items
    games/<game>/              play screen (client) and reveal component (server safe) per game
    session/                   SessionFrame, Realtime/presence with polling fallback, early reveal sheet, session rows
    memories/                  memory cards with reactions and notes
  src/content/                 bundled prompts, questions, categories, ranking sets, photo prompts
  tests/db/                    vitest integration tests against a local Supabase
  tests/e2e/                   Playwright flows with several independent browser sessions
```

## Architecture in one minute

- Identity: Supabase anonymous auth with optional email account portability. A profile (display name, avatar string "icon:color") is required before anything else.
- Gardens have a capacity of 2 or 8 and store the creator's timezone. Membership and game participation are separate.
- Every game is a session with locked participants, a prompt snapshot, an optional secret, submissions per round, and a result written at reveal.
- The engine interface in `src/lib/games/engine.ts` defines pickPrompt, validateSubmission, isRoundComplete, earlyRevealCheck, computeReveal, view (per viewer, never leaks secrets), optional hydrateView (signed URLs), and turnStatus (home copy).
- Reads use the service role client with explicit membership and participation checks in `src/lib/data`. Views are shaped per viewer before reaching the browser.
- Writes go through SECURITY DEFINER Postgres functions that only the service role can execute: join with a capacity lock, submit with a session lock, reveal with growth and the weekly reward awarded exactly once.
- Row level security read policies exist as defense in depth and are tested in `tests/db`.
- Updates use Supabase Realtime through `useLiveChannel`, with presence on game pages. Polling is the fallback, slows when connected, and pauses in background tabs.
- Growth: one point per completed session, three in a Monday to Sunday week unlock one deterministic garden item, at most one per week, never removed.

## Working on it

- Shared UI contracts and acceptance requirements live in `UI.md`; `/styleguide` shows interactive examples. Import components by module from `@/components/ui/<Component>`. Keep data access and actions in features, and extend shared patterns before duplicating controls.

- Run focused checks while changing code, `pnpm check` before every commit, and `pnpm check:full` before the final push when Docker is available. See `TESTING.md` for what each check protects.
- When fixing a bug, reproduce it through the user-facing flow first, then add a regression test that fails before the fix.
- When adding or changing behavior, update its tests in the same change. Do not weaken assertions or delete coverage to get green.
- Review screenshot or snapshot changes deliberately. Nothing updates baselines automatically.
- Every new feature extends the CI pipeline in the same change: a unit test for its logic, a database test if it touches tables or policies, a browser journey for its flow, and a row in the TESTING.md table. Archive a screenshot set with `pnpm shots` after visible changes.

- Run everything from this directory so asdf picks Node 22 from `.tool-versions`.
- Local backend: `pnpm supabase start`, then `pnpm supabase db reset` after editing migrations.
- Before committing: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:db`, `pnpm test:e2e` (dev server on port 3000), `pnpm build`.
- Commit messages are concise and imperative, with no agent co-author lines. New branches start with `marvinc/`.
- Keep `PROGRESS.md` current at every checkpoint so another session can resume.

## Learnings

Keep this list short and concrete. Add a line whenever a mistake or a non-obvious fact costs time.

- Never add Claude or any agent as a commit author or co-author. Commits carry only the human author.
- Node is managed by asdf. Run commands from this directory so `.tool-versions` resolves Node 22, or export `ASDF_NODEJS_VERSION=22.23.4`.
- The Git root is the project checkout, one level above the application directory. Run `git rev-parse --show-toplevel` if unsure, and stage intended files explicitly.
- Local Supabase runs through Docker on colima. The user's Docker credential helpers are not on PATH, so start it with an isolated config: `DOCKER_CONFIG=<empty dir with {} config.json> DOCKER_HOST=unix://$HOME/.colima/default/docker.sock pnpm supabase start -x studio,imgproxy,logflare,vector,edge-runtime,postgres-meta,supavisor`.
- Supabase grants EXECUTE on new functions to `anon` and `authenticated` through default privileges. Revoking from `public` is not enough. Revoke from `public, anon, authenticated` explicitly and keep the integration test that proves a signed-in user cannot call privileged functions.
- Full-page Playwright screenshots draw fixed elements (tab bar, sheets) mid-page. Judge layout from viewport screenshots.
- Next 16 refuses a second `next dev` in the same directory. To test another environment (blank or bogus Supabase variables), stop the main server, edit `.env.local` with a backup, restart, and restore afterwards. Copies of the project with a symlinked `node_modules` do not build under Turbopack.
- `getByText` in Playwright can match the text inside a textarea, so after saving a note assert on the rendered note, not just the text, and let pending server actions settle with `waitForLoadState("networkidle")` before the next one.
- Turbopack's persistent dev cache in `.next/dev` can keep serving a stale `globals.css` after a large rewrite. If new tokens do not show up, stop the server, delete `.next/dev`, and start it again.
- `LayoutProps` and `PageProps` are generated by Next into `.next/types`. A clean checkout has none, so `pnpm typecheck` runs `next typegen` first. Keep that in place or CI type checks fail.
