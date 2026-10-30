# Little Spectrum

A little color. A little closer.

A private, mobile-first website where long-distance friends play six short games, share moments, and grow a garden together.
Built with Next.js, TypeScript, Tailwind CSS, and Supabase. Deploys to Vercel Hobby.

The full product specification is in [SPEC.md](./SPEC.md) and the current state in [PROGRESS.md](./PROGRESS.md).

## Run locally

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase values, or leave empty for demo mode
pnpm dev
```

Node 22 and pnpm are pinned in `.tool-versions`.

## Checks

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Setup instructions for Supabase and Vercel follow once the backend lands.
