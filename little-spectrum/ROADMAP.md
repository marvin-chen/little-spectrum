# Roadmap

## Current milestone: game contributor foundation

1. Completed: shared typed engine contract, participant-safe projection, responsibility boundaries, and game admission checklist.
2. Deterministic lifecycle fixtures with privacy checks for two, three, and eight participants are complete. Priority 2 completion adds actual play screens with local actions, viewer-specific answering/waiting snapshots, pending/error/retry examples, local photo operations, and replay reset; verification is tracked in `PROGRESS.md`.
3. Completed last: migrate the six current engines and session projection; share reveal rendering between Memories and fixture previews. Interactive previews now also share the production play dispatcher and action interface.

See [GAME_CONTRACT.md](GAME_CONTRACT.md) and `/styleguide/games`. Final checks and screenshot evidence are tracked in `PROGRESS.md`. Next is a bounded pilot contribution, with an external contributor setup trial still pending.

## Completed foundation: shared UI

The internal component library is ready for feature contributions. Implementation and checks are tracked in `PROGRESS.md`; contributor-facing contracts live in `UI.md`.

1. Completed: standardize primitive APIs, accessible fields, icon actions, and feedback; migrate legacy button variants.
2. Completed: extract reusable answer selection and confirmation patterns; migrate a game and settings flow.
3. Completed: expand the style guide with documented states and examples, browser tests on phone/desktop, and a reviewed screenshot archive.

Completed: designer handoff guide and current asset inventory (`DESIGN.md`, `ASSETS.md`).

Contributor foundation: setup guide, ownership map, issue/PR templates, and a first-contribution walkthrough are implemented; clean-snapshot dependency installation, fast checks, demo loading, and six demo-only browser checks passed. An external contributor trial remains the usability acceptance step.

Keep the six-game catalog focused; new mechanics need a separate admission decision. The broader accessibility audit below remains separate from the shared-control coverage completed here.

The feature backlog below remains available for later prioritization.
Sizes are rough: S is an afternoon, M is a day or two, L is a week.

## Done since the first release

- Liquid glass redesign: tokens, floating glass tab bar, motif tiles, richer garden scene, memories feed.
- Account portability: attach an email in Settings, sign in anywhere with a link or code.
- Realtime presence: instant session updates and "here now" rings, polling as the fallback.
- Shared-element view transitions, automatic dark appearance, scroll-aware tab bar.
- Garden themes as personalization: six themes, chrome tinting, time-of-day skies, creator theme picker.
- Invite cards: creator-designed card (poster, postcard, ticket, headline, note, sticker, accent) shown on the join page and as the link preview image, with a screenshot archive command.
- Quality checks: `check` on every push and pull request; `check:full` on pull requests, pushes to `main`, manual dispatches, and a weekly drift run.

## Decisions pending

- Games filter: replace the color filter with play-style groups (All, Clue games, Everyone answers, Photos) or remove the row. The six game colors stay fixed as identities either way.

## Refinements

Polish that makes what already exists feel more finished.

1. Reveal moments (M). One restrained celebration for a full-group match or a perfect guess, a light haptic on supported phones, and a shareable reveal card rendered server side for group chats.
2. Garden life (M). Cloud drift, a butterfly that lands when tapped, milestone scenery such as a pond at the tenth keepsake, seasonal touches by month.
3. Photos (M). Lightbox with pinch zoom, dominant-color placeholders computed at upload, gallery layouts that respect portrait and landscape.
4. Desktop composition (S). Two columns inside games on wide screens, with the interaction on the left and players and status on the right.
5. Empty states with motif illustrations (S), and a Sunday-night weekly recap card on Home (S).
6. Accessibility audit (S). VoiceOver pass over every game, larger text settings, high contrast mode.
7. Manual appearance switch (S). Light, dark, or follow the system, remembered per device.

## Stretch goals

Capabilities that change what the product can do. All stay within free tiers.

- Install as an app (M). Service worker, offline shell, and optional web push with free VAPID keys for "your turn" nudges.
- Nudge a friend (S). A one-tap "your move" that becomes a push once the app is installable, and a quiet in-app badge until then.
- Invite card refinements (S). Draw the sticker as the real motif glyph in the preview image, show more of the garden scene behind the card, add a "copy image" action that works inside chat apps, and let the creator pick a keepsake as the sticker.
- Member management (S). Leave a garden, remove a member, hand over the creator role.
- More games on the same engine (M each). "Caption This" (everyone captions one photo), "Two Truths" (spot the made-up answer), a small drawing game, and team variants of Hue Knew?.
- Yearly recap (M). A Memories view that gathers a year of rounds, best scores, and favorite photos, with a downloadable album.
- Garden journal (S). One optional line per week from anyone, shown on the keepsake sheet for that week.
- Streak keepsakes (S). Special items at four, twelve, and fifty-two consecutive weeks.
- Offline resilience (M). Queue a submission while offline and send it when the connection returns.
- Localization (L). Copy extracted for translation, starting with one additional language.

## Platform and upkeep

- Database-backed throttling (S) so limits hold across serverless instances.
- Opportunistic orphan photo cleanup with Supabase's free scheduler (S).
- Error reporting on a free tier (S), only if it stays free and private.

## Not planned

- Public matchmaking, payments, external AI, voice or video, and gardens larger than eight. These stay out by design.
