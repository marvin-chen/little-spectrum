# Progress

## Completed

- Stage 1: Next.js 16 scaffold (TypeScript, Tailwind v4, ESLint, pnpm, Node 22 via asdf).
- Design tokens in `src/app/globals.css` (type scale, colors with six game identities, radius, elevation, motion, safe areas, reduced motion, frosted glass with solid fallback).
- Shared UI in `src/components/ui/`: Button and ButtonLink, Badge, Card, Group and Rows, PageTitle and CompactHeader, EmptyState, Avatar and AvatarStack, SegmentedControl, Sheet (native dialog, focus trapped, Escape and backdrop dismiss), ShareButton (Web Share with copy fallback).
- App shell in `src/components/shell/`: floating bottom tab bar on mobile, sidebar on desktop, brand mark.
- Bundled content in `src/content/`: 48 spectrums, 48 questions, 60 categories, 36 ranking sets, 36 photo prompts.
- Twelve original garden illustrations with three palette variants each in `src/components/garden/items/`.
- `/styleguide` page that renders every shared component.

## Checks performed

- `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` pass.
- Style guide screenshotted at 390px and 1280px, sheet opened with the mobile keyboard field visible.

## Configuration still needed

- `.env.local` with Supabase URL, publishable key, and secret key (see `.env.example`).
- Local Supabase runs via `pnpm supabase start` (Docker), see AGENTS.md for the Docker note.

## Next steps

- Stage 2: Supabase schema, policies, anonymous auth, gardens, invitations, and Hue Knew? end to end.
