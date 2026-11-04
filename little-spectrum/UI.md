# Shared UI library

Use the application’s internal component library for new screens. `/styleguide` renders the production components with interactive examples. No separate package or deployment is needed.

## Foundations and imports

`src/app/globals.css` owns typography, semantic colors, radii, elevation, motion, and dark appearance. Use `bg-surface`, `text-ink`, `text-ink-2`, `rounded-control`, and the named type scale rather than introducing new color or radius values. Layout uses the existing Tailwind spacing scale; prefer gaps of 2, 3, 4, 5, and 6 for related controls and sections. Game accents come from `src/lib/colors.ts`.

Import components by module, for example `@/components/ui/Button`. This is the public import convention: it keeps interactive boundaries explicit and avoids an umbrella client module. UI must not import database clients, server actions, or game engines. Callers supply data and callbacks. Domain patterns live beside their feature or in `src/components/session`.

## Component contract

| Component | Use and public contract |
|---|---|
| `Button`, `ButtonLink` | Actions versus navigation. Canonical variants: prominent, glass, tinted, plain, danger. Sizes: sm, md, lg. `loading` disables actions and exposes busy state; retain meaningful text. |
| `IconButton` | Icon-only action. Requires `label` and `icon`; target is at least 44px. Use decorative icons with `aria-hidden`. |
| `Field`, `TextInput`, `TextArea` | One direct control per Field. Field supplies label, ID, hint, and optional error associations. Explicit control IDs/descriptions are preserved. `error` is for a field-specific problem. |
| `Feedback` | Action errors (`tone="error"`), success, or informational updates. Do not use an input error for a backend outage. |
| `Card`, `Group`, `Row`, `RowButton`, `RowLink` | Surfaces and grouped content. Choose the interactive element by behavior. |
| `Sheet` | Modal content, title, optional description/footer. Keep dismissal available unless an action genuinely cannot be interrupted. |
| `SegmentedControl` | Short mutually exclusive choices; labelled radio group with arrow-key navigation. |
| `ChoiceGroup` | Vertical single-choice list. Native radios isolate groups and provide keyboard navigation. Supply unique string values, labels, selected value or null, onChange, optional accent and disabled states. |
| `ConfirmationSheet` | Shared confirmation pattern. Requires title, description, confirmLabel, onConfirm, and onClose. Pending state disables dismissal and duplicate actions; errors stay inside the dialog. Callers own the operation and close only on success. |
| `Slider` | Numeric range with visible labels and a confirmation action in the enclosing flow. |
| `Avatar`, `Badge`, `EmptyState` | Identity, labelled status, and a clear next step when content is absent. |

Keep `className` for layout and composition. A repeated visual override should become a reviewed component variant. A unique illustration or game board may remain custom; basic controls should reuse the library.

## Acceptance requirements

- Every interactive control has an accessible name, visible keyboard focus, and correct button/link/form semantics.
- Field help and errors are programmatically associated. Async failures remain readable, and pending actions cannot submit twice.
- Radio groups support keyboard selection; dialogs support Escape, contained focus, and return focus to the opener.
- Aim for 44px touch targets. Compact controls need deliberate review and enough surrounding space.
- Verify phone and desktop, light and dark, reduced motion, and long text. Essential actions must not be hidden by navigation or depend on color/hover/gestures alone.
- Use semantic tokens, existing game colors, and production components in documentation examples.
- Add behavior tests at the lowest useful layer plus browser coverage for interaction. Do not snapshot class strings as a substitute for user behavior.
- Run `pnpm check` before each commit, relevant browser checks for interactions, and `pnpm check:full` before final delivery. Archive and review visible changes with `pnpm shots`.

## Adding or changing a component

First check whether an existing component or composition solves the need. State the use case, props, variants, interaction states, and server/client boundary. Add a style-guide example and tests, migrate at least one real consumer, and document the change here. Coordinate shared contract changes with the maintainer; migrate existing consumers in the same change rather than leaving competing conventions.
