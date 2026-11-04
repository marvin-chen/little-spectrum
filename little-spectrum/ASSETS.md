# Visual asset inventory

Paths are relative to this application directory. This is an inventory of the current sources, not a promise that every asset is controlled by one file. The maintainer is the current review contact; a project can assign a designer and implementer for an individual family.

| Family | Source | Contract and consumers | Preview and replacement check |
|---|---|---|---|
| Semantic tokens | `src/app/globals.css`; `src/lib/colors.ts` | Type, surface/ink colors, radii, shadows, motion, six game accents. CSS and TypeScript color values have separate uses. | `/styleguide`, demo, real game; inspect light/dark and contrast. |
| Shared controls | `src/components/ui/` | APIs and states in [UI.md](./UI.md). Features import individual modules. | `/styleguide` recipes plus the consuming screen. |
| Tab symbols | `src/components/icons/TabIcons.tsx` | Home, Games, Garden, Memories; 24×24 viewBox, active and inactive, currentColor. Used by `shell/TabBar.tsx`. | Style guide and mobile navigation; preserve accessible link names. |
| Utility symbols | `lucide-react` imports throughout `src/` | Named library icons inside controls, commonly 16–20px. There is no central replacement registry. | Search the symbol’s imports and inspect every changed consumer. Prefer a shared wrapper only when the assignment needs global replacement. |
| Game glyphs and motif tiles | `src/components/games/motifs/GameMotif.tsx` | Six identities keyed by GameKey; 28×28 glyph geometry, gradients and reusable motif/stage renderers. `GameIcon.tsx` wraps motif sizing. | Style guide demonstrates tiles at 24, 32, 44, 56, 72px; check catalog, session headers, memories, and invite cards. |
| Brand mark and wordmark | `src/components/shell/Brand.tsx` | BrandMark uses a 40×40 viewBox and size/className props; Wordmark is separate presentation. | Landing and shell. Also review app icon and invite preview, which are separate renderers. |
| App icon and manifest | `src/app/icon.svg`; `src/app/manifest.ts` | Icon has a 64×64 viewBox; manifest references `/icon.svg`. Manifest appearance colors are separate values. | Browser icon and manifest output; check legibility at small sizes. This is not a complete installable/offline app feature. |
| Avatars | `src/components/ui/Avatar.tsx`; `src/lib/avatars.ts` | Twelve named Lucide symbols and six colors; persisted identity is `icon:color`. Avatar and AvatarStack have their own size variants. | Style guide, onboarding, player lists. Preserve identifiers and fallback behavior. |
| Garden scene and themes | `src/components/garden/GardenScene.tsx`; `src/lib/themes.ts` | Scene uses a 400-unit coordinate system with compact/full crops; theme colors and time-of-day sky affect composition. | Demo Home/Garden and real gardens with few/many keepsakes. Check both crops. |
| Garden items | `src/components/garden/items/`; registry `index.ts`, props `types.ts` | Twelve illustrated rewards, laid out in a 100×120 coordinate box with baseline near y=112. Props: variant, className, title; registry defines stable key and footprint. | Garden scene and item details. Preserve key, grounding, footprint, and variants. |
| Invite cards | `src/components/invite/InviteCardView.tsx`; `src/lib/inviteCard.ts`; `src/app/g/[gardenId]/settings/InviteCardEditor.tsx` | Poster/postcard/ticket layouts, accent, sticker and content configuration. | Settings editor and invitation landing with long text and each layout. |
| Invite link preview | `src/app/join/[token]/opengraph-image.tsx` | Separate server renderer produces 1200×630 PNG; simplified motif/avatar rendering. UI SVG changes do not automatically update it. | Fetch an actual valid invitation preview; check expired links too. Keep private game content out of the image. |
| Game-specific diagrams | `src/components/games/hue-knew/SpectrumScale.tsx`, `src/components/games/hue-clue/ColorGrid.tsx`, `src/lib/games/hueCluePalette.ts` | Spectrum markers and deterministic game palette are gameplay surfaces, not interchangeable decorative symbols. | Real play/reveal, keyboard interaction, overlapping markers. Coordinate scoring/coordinate changes with the game owner. |
| Reference screenshots | `screenshots/` | Generated examples, not runtime assets. `shared-ui-foundation/` includes component states. | Use viewport captures for layout; do not edit reference PNGs as a substitute for source changes. |

## Garden reward keys

`sprout`, `tulips`, `sunflower`, `fern`, `mushrooms`, `berry-bush`, `little-tree`, `lantern`, `birdbath`, `watering-can`, `stepping-stones`, `butterfly`.

## Avatar keys

`sun`, `leaf`, `cloud`, `star`, `waves`, `moon`, `flower`, `cat`, `zap`, `heart`, `music`, `coffee`.

## What is not a bundled design asset

User-uploaded photos live in private storage, not in this repository. Do not download or commit them for design review. Bundled text prompts live in `src/content/`; changes there are content contributions and can affect games. Adding new art, identities, or variants should update this inventory and the relevant registry without breaking stored records.
