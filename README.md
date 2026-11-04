# little-spectrum

Little Spectrum is a private, mobile-first website where long-distance friends play six short games, share moments, and grow a garden together.
"A little color. A little closer."

The application lives in [`little-spectrum/`](./little-spectrum/).
The repository root also holds `.gitignore` and the CI workflows in `.github/workflows/`.

## Contribute

Start with [CONTRIBUTING.md](./CONTRIBUTING.md) for setup, a first task, checks, and PR review. See [OWNERSHIP.md](./OWNERSHIP.md) for responsibility boundaries. Designers can use the [handoff guide](./little-spectrum/DESIGN.md) and [asset inventory](./little-spectrum/ASSETS.md).

## Start here

```bash
cd little-spectrum
pnpm install
cp .env.example .env.local   # leave empty for demo mode, or fill in Supabase keys
pnpm dev                     # http://localhost:3000
```

Node 22 and pnpm are pinned in `little-spectrum/.tool-versions` (asdf).

- Demo mode: with no Supabase keys the site runs a read-only sample garden at `/demo` that also explains how to enable real multiplayer.
- Real multiplayer locally: `pnpm supabase start` (needs Docker), copy the printed URL and keys into `.env.local`, restart `pnpm dev`.
- Real friends on the internet: follow the setup guide in [`little-spectrum/README.md`](./little-spectrum/README.md). It covers creating a free Supabase project, enabling anonymous sign-ins, applying all migrations, environment variables, deploying to Vercel Hobby with Root Directory `little-spectrum`, and the free plan limits.

## Checks

```bash
cd little-spectrum
pnpm test        # unit tests for game logic and week math
pnpm test:db     # policy, capacity, and reward tests against a local Supabase
pnpm test:e2e    # Playwright, real browser sessions against a running dev server
pnpm lint && pnpm typecheck && pnpm build
```

## Documents

- [`little-spectrum/SPEC.md`](./little-spectrum/SPEC.md): the full product specification.
- [`little-spectrum/PROGRESS.md`](./little-spectrum/PROGRESS.md): what is done, what was checked, what remains.
- [`little-spectrum/AGENTS.md`](./little-spectrum/AGENTS.md): repository structure, architecture, conventions, and learnings for agents and new contributors.
