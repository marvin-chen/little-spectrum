# Contributing to Little Spectrum

Start here whether you are building a feature, changing artwork, or fixing a bug. The repository root contains this guide and `.github/`; the application and its commands live in the nested `little-spectrum/` directory.

Read the [ownership map](./OWNERSHIP.md) and agree on an issue with one owner, one reviewer, clear acceptance criteria, and exclusions before starting. Marvin is the initial review contact. New contributors do not need production credentials or a deployment account.

## Choose your setup

| Work | Setup | What you can verify |
|---|---|---|
| Tokens, components, design, documentation | Demo setup | `/styleguide`, `/demo`, fast checks, isolated component browser tests |
| Games, accounts, membership, photos, database, complete journeys | Local backend setup | Real independent players, uploads, full browser/database verification |

Demo mode is read-only. It does not simulate account creation, real submissions, or multiplayer. Missing backend values enable demo mode; configured but unreachable backend values produce an error instead.

## Demo setup from a fresh checkout

Install Git, Node 22.23.4, and pnpm 11.15.0. Versions are pinned in `little-spectrum/.tool-versions` and `package.json`; asdf users with the appropriate plugins can run `asdf install` from the application directory. Other version managers are fine if the versions match. If Node is installed and pnpm is missing, install the pinned CLI with `npm install --global pnpm@11.15.0` using your version manager’s writable Node installation.

```sh
git clone https://github.com/marvin-chen/little-spectrum.git
cd little-spectrum/little-spectrum
node --version
pnpm --version
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

When reviewing an unmerged PR, check out its branch before installing so the source matches that PR’s guide. Otherwise use `main`.

The copy command is for a fresh checkout: do not overwrite an existing `.env.local`. Leave the three Supabase values blank for demo mode. Open http://localhost:3000/styleguide and http://localhost:3000/demo. Keep this terminal running; use a second terminal in the same application directory for checks:

```sh
pnpm check
pnpm exec playwright install chromium
pnpm exec playwright test tests/e2e/ui.spec.ts --grep 'fields expose|component examples'
```

Expected result: the style guide and sample garden load; typecheck, lint, unit tests, and these component tests pass. The full UI spec also contains a settings test that requires the backend, so use the filter shown above in demo mode.

## Local backend setup

Start Docker first. From the application directory:

```sh
pnpm supabase start
pnpm supabase status -o env
```

Copy the local values into `.env.local`: `API_URL` becomes `NEXT_PUBLIC_SUPABASE_URL`, `PUBLISHABLE_KEY` becomes `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SECRET_KEY` becomes `SUPABASE_SECRET_KEY`. Keep `NEXT_PUBLIC_SITE_URL=http://localhost:3000`. Treat status output as local credentials; do not paste it into an issue or PR. Restart the dev server after changing environment variables.

The checked-in Supabase configuration enables anonymous sign-in and applies migrations on initial startup. To rebuild a disposable local database after migration work, run `pnpm supabase db reset`. This deletes local data; use it only against your local development stack. Never point integration tests at a production project.

Create a profile and garden in a normal browser, then join its invitation in a private window or another browser. You should see independent players and complete a round. Local email tests use Mailpit at http://127.0.0.1:54324; override `MAILPIT_URL` if your local port differs.

```sh
pnpm exec playwright install chromium
pnpm check:full
```

Full verification runs fast checks, a production build, database tests, and browser tests against a temporary server on port 3100, then stops that server. Port 3100 must be free. Tests create disposable users and gardens. The screenshot-only spec is intentionally skipped unless capture mode is enabled.

## Work in small reviewable changes

From the repository root, start with an up-to-date checkout and inspect local changes:

```sh
git status --short
git switch main
git pull --ff-only
git switch -c marvinc/short-task-name
```

If local changes prevent switching, preserve them and finish or isolate that work first. Do not reset or overwrite somebody else's work. Use the repository's `marvinc/` branch prefix. If you do not have repository write access, use a fork and push your branch there; open the PR against the upstream `main` branch. For work depending on an unmerged branch, agree on the base with the reviewer.

Read [SPEC.md](./little-spectrum/SPEC.md) for behavior, [UI.md](./little-spectrum/UI.md) for shared controls, and [TESTING.md](./little-spectrum/TESTING.md) for checks. Design contributions also use [DESIGN.md](./little-spectrum/DESIGN.md) and [ASSETS.md](./little-spectrum/ASSETS.md).

Keep scope aligned with the issue. Reproduce a bug through the user flow, add a failing regression test, then fix it. Use unit tests for pure logic, database tests for policies/atomic behavior, and browser tests for interaction. New migrations must have unique names and preserve existing data; do not rewrite already-applied migrations. Shared APIs, global tokens, and schema changes need the relevant reviewer before integration.

## First contribution walkthrough

Example task: add a long-text error example to the style guide's feedback section, demonstrating that the existing Feedback component wraps a useful recovery message on a phone. This changes documentation/examples, not game behavior or the component API.

1. Agree on the exact message and screenshot acceptance with the reviewer. Own `src/app/styleguide/ComponentExamples.tsx` and the related test in `tests/e2e/ui.spec.ts`.
2. Use the demo setup. Create `marvinc/feedback-example` and inspect the existing Feedback examples at `/styleguide#feedback`.
3. Add one production `<Feedback tone="error">` example with a realistic long message and clear next step. Reuse tokens and components; avoid custom styling just for the example.
4. Add a focused browser test named `long feedback example wraps on a phone`. Scope the alert locator to the new message, assert it is visible, and check that the document does not overflow horizontally. Do not assert exact class strings.
5. Run `pnpm check`, then `pnpm exec playwright test tests/e2e/ui.spec.ts --grep 'long feedback example'` while the dev server runs. The UI spec is configured for phone and desktop.
6. Capture light/dark evidence and run the full screenshot archive with a local backend before final delivery. If you cannot run Docker, report that limitation and arrange full verification with the reviewer; do not report unrun checks as passing.
7. Update `little-spectrum/PROGRESS.md` with the scope and evidence. Update the roadmap if the issue completes a milestone.
8. Inspect and stage only the intended paths, commit, and push. Use a concise imperative message with only the human author, no agent co-author lines.

From the repository root, for that example:

```sh
git diff --check
git diff -- little-spectrum/src/app/styleguide/ComponentExamples.tsx little-spectrum/tests/e2e/ui.spec.ts little-spectrum/PROGRESS.md
git add little-spectrum/src/app/styleguide/ComponentExamples.tsx little-spectrum/tests/e2e/ui.spec.ts little-spectrum/PROGRESS.md
git commit -m 'Document long feedback messages'
git push -u origin marvinc/feedback-example
```

## Screenshots and final checks

Run focused checks during work, `pnpm check` before every commit, and `pnpm check:full` before the final push when Docker is available. Check failures are work to investigate, not a reason to weaken assertions.

For visible changes, keep a local-backend dev server running on port 3000 in one terminal, then from the application directory:

```sh
pnpm shots feedback-example
```

Choose an unused label; the script refuses to overwrite an existing archive. It captures all mobile journeys into `screenshots/<label>/`. Review the changed screens and commit the archive with the change. Viewport captures are the layout reference for fixed navigation and sheets. Include light/dark, keyboard, and reduced-motion evidence relevant to your change. No new screenshot archive is necessary for prose-only documentation changes.

## Submit the PR

Open a draft PR from your pushed branch to the agreed base, normally `main`. Fill in the PR template: problem, resulting behavior, issue, ownership, scope, checks, screenshots, and limitations. Request the reviewer named in the issue. CI runs fast checks and full verification on PRs; inspect both `Fast checks` and `Full verification` before merge.

The reviewer checks acceptance criteria, compatibility, privacy, UI consistency, and evidence. Address feedback in small commits. Merge only after review and required checks; deployment is a separate maintainer responsibility. If contribution/license terms are unclear for your planned asset or code, settle them with the maintainer before submitting it.

## Troubleshooting

| Symptom | Action |
|---|---|
| No package.json | You are probably at the repository root. Enter the nested `little-spectrum/` application directory. |
| Wrong Node/pnpm version | Check versions in that directory; fix your version manager/PATH before reinstalling. |
| pnpm wants to replace node_modules or aborts without a TTY | Use the pinned versions and run `pnpm install --frozen-lockfile` interactively. Investigate the install error instead of bypassing dependency verification. |
| Docker credential/helper failure | Check your Docker runtime and credential-helper installation. The machine-specific Colima workaround is in AGENTS.md; it is not required on every computer. |
| Second Next dev server fails | Stop the existing dev process for this application; Next holds a per-directory lock. |
| Turbopack reports port binding denied | Run from a terminal/environment allowed to bind local ports. Stop Next, move `.next` to a uniquely named temporary backup, and rebuild if a failed cache persists. Do not use sudo. |
| Demo does not appear | Stop the app, check that all three backend values are blank, then restart. Preserve existing local configuration before switching modes. |
| check:full fails before browser tests | Read the first failed phase and check local backend health and port 3100. Later skipped journeys do not count as a pass. |

## Setup acceptance checklist

A new contributor should be able to complete the demo path, identify their owner/reviewer, run a focused test, and prepare the example PR without verbal instructions. A backend contributor should also complete a two-browser round and full verification. Report the first unclear instruction, command output with secrets removed, OS, and tool versions. The first external contributor trial should record setup time and any missing steps; automated setup checks do not substitute for that feedback.
