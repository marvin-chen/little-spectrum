# Little Spectrum

A little color. A little closer.

Little Spectrum is a private, mobile-first website where long-distance friends play six short games, share moments from their lives, and grow a garden together.
It runs on free tiers only: Next.js on Vercel Hobby, and Supabase Free for the database, anonymous sign-in, and private photo storage.

The product specification lives in [SPEC.md](./SPEC.md), the current state in [PROGRESS.md](./PROGRESS.md), and working notes for agents in [AGENTS.md](./AGENTS.md).

## What is inside

- Six games on one shared engine: Hue Knew? (coral), True Colors (rose), Hue Clue (violet), Same Wavelength (blue), Palette Picks (amber), Color Quest (green).
- Gardens for two or up to eight people, invite links, and a garden switcher.
- Asynchronous play with automatic reveals, early reveals, and polling that pauses in background tabs.
- A shared garden that grows one item for every three finished rounds in a week, with a gentle streak.
- Memories with reactions and one note per participant.
- A read-only demo mode when no backend is configured.

## Contributing

Use the repository [contributor guide](../CONTRIBUTING.md) for demo/backend setup, a first-contribution walkthrough, screenshots, and PR expectations. The [ownership map](../OWNERSHIP.md) explains who to coordinate with.

## Run it locally

Requirements: Node 22 and pnpm (both pinned in `.tool-versions` for asdf), and Docker if you want a local Supabase.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Without Supabase values in `.env.local` the site runs in demo mode at `/demo`.
To play for real locally:

```bash
pnpm supabase start          # starts Postgres, Auth, Storage, and the API in Docker
pnpm supabase status -o env  # prints API_URL, PUBLISHABLE_KEY, and SECRET_KEY
```

Put `API_URL` into `NEXT_PUBLIC_SUPABASE_URL`, `PUBLISHABLE_KEY` into `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SECRET_KEY` into `SUPABASE_SECRET_KEY` in `.env.local`, then restart `pnpm dev`.
The local config already enables anonymous sign-ins and the migration creates the private `photos` bucket.
`pnpm supabase db reset` re-applies the migrations from scratch.

## Set up for real friends (about 15 minutes)

### 1. Create a free Supabase project

Go to [supabase.com](https://supabase.com), create a project on the Free plan, and pick a region close to your friends.
Wait for the project to finish provisioning.

### 2. Enable anonymous sign-ins

In the Supabase dashboard open **Authentication**, then **Sign In / Providers**, and turn on **Anonymous sign-ins**.
No email provider is needed.
Guests are tied to the browser they signed up in, which is explained inside the app.

### 2b. Allow the sign-in link to return to your site

Guests can keep their account by attaching an email in Settings, then sign in on another device with an emailed link.
For that link to land back in the app, open **Authentication**, then **URL Configuration**, set **Site URL** to your deployed address, and add `https://<your-site>/auth/callback` to **Redirect URLs** (use `http://localhost:3000/auth/callback` for local work).
Supabase sends these emails itself.
Its built-in sender is rate limited to a few emails per hour, which is fine for a small group.
If you need more, point **Authentication, SMTP settings** at a free provider such as Resend or Brevo.
Optional: add `{{ .Token }}` to the magic link email template so people can type a code instead of opening the link.

### 3. Apply the migration and storage configuration

The schema, row level security policies, atomic game functions, and private `photos` bucket start in `supabase/migrations/20261029000000_init.sql`. Later migrations add Realtime, more themes, and invite cards. Apply all migrations in filename order.
Either:

- Open **SQL Editor** in the dashboard, run each file from `supabase/migrations/` in filename order, or
- Use the CLI from this folder: `pnpm supabase login`, `pnpm supabase link --project-ref <your-project-ref>`, then `pnpm supabase db push`.

Nothing else needs to be configured in Storage: the bucket is private and only the server touches it.

### 4. Add environment variables

In the dashboard open **Project Settings**, then **API keys**, and copy:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key (`sb_publishable_...`). The legacy `anon` key also works. |
| `SUPABASE_SECRET_KEY` | Secret key (`sb_secret_...`). The legacy `service_role` key also works. Server only. |
| `NEXT_PUBLIC_SITE_URL` | Optional. The public URL used in invite links. Vercel fills this in automatically. |

Put them in `.env.local` for local development. Never commit that file.

### 5. Deploy to Vercel Hobby

1. Push this repository to GitHub.
2. In [vercel.com](https://vercel.com) choose **Add New Project**, import the repository, and set **Root Directory** to `little-spectrum`.
3. Add the same environment variables under **Environment Variables**.
4. Deploy. Vercel gives you a free `*.vercel.app` domain, and invite links use it automatically.

### 6. Test with separate browsers

Open the site in two different browsers, or one normal and one private window, since each browser holds its own guest account.
Create a profile and a garden in the first, share the invite link, open it in the second, and start Hue Knew?.
The second browser sees the clue appear within a few seconds without reloading.

### 7. Free plan limits and pausing

- Supabase Free projects pause after about one week without activity. The site shows a friendly retry state while the project wakes up, which takes about a minute. Open the dashboard and click **Restore** if it does not wake on its own.
- Supabase Free includes roughly 500 MB of database space, 1 GB of file storage, and 5 GB of bandwidth per month at the time of writing. Photos are resized to about 1600 px and well under 500 KB, so a small group can share thousands of photos before this matters. Uploaders can delete photos to free space.
- Vercel Hobby is for personal, noncommercial use and has generous limits for a site like this. No cron jobs or background workers are used.
- The app does not promise unlimited usage. If a quota is hit, uploads show an explanatory error instead of failing silently.

## Checks

```bash
pnpm check        # type check, lint, unit tests. Run before every commit.
pnpm check:full   # plus production build, database and policy tests, browser journeys. Run before pushing.
```

`check:full` needs Docker, `pnpm supabase start`, `.env.local` pointing at it, and `pnpm exec playwright install chromium` once.
`pnpm shots` archives screenshots of every page under `screenshots/<date>-<commit>/`.
Fast checks run on every push and pull request. Full verification runs on pull requests, pushes to `main`, manual dispatches, and a weekly schedule. [TESTING.md](./TESTING.md) explains what each check protects and how to investigate a failure.

## Shared UI for contributors

Design contributors: start with the [handoff guide](./DESIGN.md) and [asset inventory](./ASSETS.md).

Read [UI.md](./UI.md) for component contracts, import conventions, and acceptance requirements. Open `/styleguide` to try production controls, state examples, and copyable usage snippets.

## How it is put together

- `src/app` holds the routes: onboarding (`/welcome`, `/start`, `/join/[token]`), the garden shell under `/g/[gardenId]` (home, games, play, garden, memories, settings), the photo upload route, and the demo.
- `src/lib/games` holds one engine per game behind a shared interface (`engine.ts`), with pure scoring and view logic that is unit tested.
- `src/lib/data` is the server-side data layer. Reads use explicit membership and participation checks, writes go through SECURITY DEFINER functions that only the service role may execute.
- `src/components` holds the design system (`ui`), the app shell, the garden illustrations, and each game's play and reveal screens.
- `src/content` holds the bundled prompts, questions, categories, ranking sets, and photo prompts.
- `supabase/migrations` holds the schema, policies, bucket, and functions.

## Privacy model

- Guest accounts use Supabase anonymous auth. Nothing identifies a person beyond the name and avatar they choose.
- Garden data is visible only to members. Session content is visible only to the selected participants.
- Secret targets and unrevealed answers never leave the server. Views are shaped per viewer before they reach the browser.
- Photos live in a private bucket and are served through short-lived signed URLs, only to participants, only after the reveal (your own photo is visible to you before).
- Photos are resized and re-encoded in the browser and again on the server, which removes location and other metadata.

## Known limitations

- Guest accounts live in one browser until an email is attached in Settings. After that, a sign-in link restores the gardens on any device.
- Live updates use Supabase Realtime (free tier: 200 concurrent connections, 2 million messages a month), with polling as the fallback. There is no push notification when the tab is closed.
- Request throttling is in memory per server instance, which is fine for a personal project but not a hard guarantee on serverless hosting.
- Appearance follows the device’s light or dark setting. A manual appearance switch is not implemented.
- Deleting a photo after a reveal leaves a "Photo removed" note in the memory rather than rewriting the result.
- Gardens cannot shrink back from eight to two, and members cannot be removed. Pausing or rotating the invite link stops new people from joining.

Game contributions: [GAME_CONTRACT.md](GAME_CONTRACT.md) covers ownership, integration, privacy, fixtures, and acceptance. Preview synthetic examples at `/styleguide/games`.
