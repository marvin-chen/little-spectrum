# Testing

Two commands, one habit: run `check` before every commit, run `check:full` before the final push.

## Commands

| Command | What it runs | Needs |
|---|---|---|
| `pnpm check` | Type check, lint, unit tests (game logic, week math, photo processing, backend detection) | Nothing beyond `pnpm install` |
| `pnpm check:full` | Everything in `check`, the production build, database and policy tests against a local Supabase, then every browser journey against the production build on port 3100 | Docker, `pnpm supabase start`, `.env.local` pointing at it, Playwright's Chromium |

`check:full` fails if any step fails, and it refuses to run database tests against anything but a local Supabase unless `ALLOW_REMOTE_TEST_DB=1` is set for a disposable project you own.
Nothing is skipped silently: an unreachable backend is a failure, not a pass.
The production server it starts is stopped afterwards, even on failure.

Smaller slices while working:

```bash
pnpm test                # unit tests
pnpm test:db             # database and policy tests
pnpm test:e2e            # browser journeys against a running `pnpm dev` on port 3000
pnpm test:smoke          # navigation smoke only, phone and desktop
pnpm exec vitest run src/lib/games/hueKnew.test.ts   # one file
```

## Local prerequisites

1. Node 22 and pnpm (pinned in `.tool-versions` for asdf).
2. Docker, for the local Supabase stack: `pnpm supabase start`.
3. `.env.local` filled from `pnpm supabase status -o env` (URL, publishable key, secret key) plus `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
4. `pnpm exec playwright install chromium` once.

The account journey reads the sign-in email from the local Mailpit inbox at `http://127.0.0.1:54324`. Set `MAILPIT_URL` if yours differs.

## How CI runs

- `check` workflow: every push and pull request, about two minutes. Runs `pnpm check`.
- `check-full` workflow: pull requests, pushes to `main`, and manual runs from the Actions tab. Starts a local Supabase on the runner with the Supabase CLI, writes `.env.local` from it, runs `pnpm check:full`, uploads Playwright traces and screenshots on failure, and stops the stack.

Superseded runs for the same commit are cancelled, and a pull request plus its push to `main` share one concurrency key so the same commit is not verified twice.
No production credentials are needed, and nothing deploys.

If you turn on branch protection for `main`, require these two checks: `Fast checks` and `Full verification`.

## Investigating a failure

- Unit or database test: the vitest output names the file and assertion. Database tests create their own users and gardens with unique names, so you can rerun one file with `pnpm exec vitest run --config vitest.db.config.mts tests/db/<file>`.
- Browser journey: look in `test-results/<test name>/` for `error-context.md` (an accessibility snapshot of the page at failure), screenshots, and `trace.zip`. Open the trace with `pnpm exec playwright show-trace test-results/<test name>/trace.zip`. In CI the same files are uploaded as the `playwright-results` artifact.
- A test that passed only on retry is reported as flaky and fails the run. Treat it as a real failure and find the race.
- A failing `check:full` step before the browser journeys stops the run early, and the summary lists what did not run.

## Adding a regression test

1. Reproduce the bug through the user-facing flow first, so the test proves the real problem.
2. Pick the lowest layer that can express it: a unit test for pure logic (`src/**/*.test.ts`), a database test for policies, capacity, or reveal rules (`tests/db`), a browser test only when the bug lives in the interaction.
3. Write the test so it fails on the current code, then fix the code, then confirm it passes.
4. Keep it focused on behavior, not on internal details, so a later refactor does not break it for the wrong reason.

## What protects what

| Behavior | Checks |
|---|---|
| Garden creation, invitations, joining, capacity, revoked links, existing members, isolation | `tests/db/capacity.test.ts`, `tests/db/permissions.test.ts`, `tests/e2e/hue-knew.spec.ts` |
| Starting sessions, participant selection, non-participant access, committed answers, refresh, normal and early reveals, late submissions, duplicate completions | `tests/db/permissions.test.ts`, `tests/db/sessions.test.ts`, `tests/db/rewards.test.ts`, `tests/e2e/all-games.spec.ts` |
| Secret targets and unrevealed answers at the database layer, using ordinary user credentials | `tests/db/permissions.test.ts`, `tests/db/sessions.test.ts` |
| Scoring, assignments, normalization, grid math, ranking similarity and ties | `src/lib/games/*.test.ts`, `src/lib/games/scoring.test.ts` |
| Each game's main flow in a browser | `tests/e2e/hue-knew.spec.ts`, `tests/e2e/all-games.spec.ts` |
| Growth once per session, multi-attempt once, three completions make one reward, concurrency, week boundaries in the garden timezone including daylight saving, rewards surviving a missed week | `tests/db/rewards.test.ts`, `tests/db/sessions.test.ts`, `src/lib/week.test.ts` |
| Photo validation, resizing, metadata removal, storage errors, upload and reveal, invalid files, access restrictions, deletion | `src/lib/photos/server.test.ts`, `tests/db/sessions.test.ts`, `tests/e2e/all-games.spec.ts` |
| Account portability with email links | `tests/e2e/account.spec.ts` |
| Memories visibility, reactions, notes, filters | `tests/e2e/memories.spec.ts` |
| Navigation, dialogs, controls not hidden by the tab bar, no unhandled errors, phone and desktop | `tests/e2e/smoke.spec.ts` |
| Backend unreachable detection | `src/lib/backend.test.ts` |

## Habits

- Run focused checks while making changes, `pnpm check` before committing, `pnpm check:full` before the final push when Docker is available.
- When fixing a bug, reproduce it first and add a regression test.
- When adding or changing behavior, update its tests in the same change.
- Avoid tests that restate the implementation. Test what a person or another system can observe.
- Investigate failures rather than weakening assertions or deleting coverage.
- Review any screenshot or snapshot change on purpose. There are no pixel baselines to update automatically.
