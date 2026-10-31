# Roadmap

What is next for Little Spectrum, ordered by how much each item improves the product for the effort.
Sizes are rough: S is an afternoon, M is a day or two, L is a week.

## Decisions pending

- Games filter: replace the color filter with play-style groups (All, Clue games, Everyone answers, Photos) or remove the row. The six game colors stay fixed as identities either way.
- Garden theme tinting: whether a garden's theme should also tint the chrome (tab highlight, primary button, sky wash).

## Refinements

Polish that makes what already exists feel more finished.

1. Shared-element page transitions (M). Tapping a game morphs its motif tile into the game header, and the Home garden slides into the Garden screen, using the View Transitions API in Next 16.
2. Dark appearance (M). Same game identities, a deep ink canvas, glass tuned for dark, every reveal checked for contrast. Tokens are centralized so this is mostly a second set of values.
3. Scroll-aware tab bar (S). Compacts on scroll down, expands on scroll up, like iOS 26.
4. Garden theme as personalization (M). Two more themes, chrome tinting, and a time-of-day sky from the garden's timezone.
5. Reveal moments (M). One restrained celebration for a full-group match or a perfect guess, a light haptic on supported phones, and a shareable reveal card rendered server side for group chats.
6. Garden life (M). Cloud drift, a butterfly that lands when tapped, milestone scenery such as a pond at the tenth keepsake.
7. Photos (M). Lightbox with pinch zoom, dominant-color placeholders computed at upload, gallery layouts that respect portrait and landscape.
8. Desktop composition (S). Two columns inside games on wide screens, with the interaction on the left and players and status on the right.
9. Empty states with motif illustrations (S), and a Sunday-night weekly recap card on Home (S).
10. Accessibility audit (S). VoiceOver pass over every game, larger text settings, high contrast mode.

## Stretch goals

Capabilities that change what the product can do. All stay within free tiers.

- Realtime presence (M). Instant updates and a small "here now" indicator on avatars through Supabase Realtime, with the existing polling as the fallback.
- Install as an app (M). Service worker, offline shell, and optional web push with free VAPID keys for "your turn" nudges.
- Account portability (M). Let a guest attach an email later so a garden survives a lost phone, using Supabase anonymous-to-permanent linking.
- Member management (S). Leave a garden, remove a member, hand over the creator role.
- More games on the same engine (M each). For example "Caption This" (everyone captions one photo), "Two Truths" (spot the made-up answer), or a small drawing game.
- Yearly recap (M). A Memories view that gathers a year of rounds, best scores, and favorite photos.

## Platform and upkeep

- Database-backed throttling (S) so limits hold across serverless instances.
- Opportunistic orphan photo cleanup with Supabase's free scheduler (S).
- Error reporting on a free tier (S), only if it stays free and private.

## Not planned

- Public matchmaking, payments, external AI, voice or video, and gardens larger than eight. These stay out by design.
