# Designer handoff guide

Start with the running `/styleguide`, then [UI.md](./UI.md) for component contracts and [ASSETS.md](./ASSETS.md) for artwork locations. This is a shared internal library: changes to a production component reach every screen that imports it. Some artwork has separate renderers, so use the inventory to identify all affected surfaces.

## Start without a backend

Follow the demo setup in the application [README](./README.md). `/styleguide` works without an account; `/demo` shows sample garden screens. A backend is needed to exercise real games, account settings, and invitation flows. Use local generated test data for screenshots, never friends’ private photos or messages.

## Agree on a small assignment

Write down the user problem, target component or asset family, included screens, exclusions, and reviewer. The maintainer reviews shared tokens and component APIs. Assign one implementer; a designer may hand off assets and specifications to that implementer rather than editing React directly.

A useful first design assignment is replacing one tab icon family, including active and inactive states, while preserving names and navigation. A useful component assignment is refining a button variant across its default, focus, disabled, and loading states.

## Deliver a reviewable design

Include these in the issue or PR:

- Component/asset name and inventory entry; list every affected rendering surface.
- Editable source or a durable source link, export files, and authorship/license notes. Use original or appropriately licensed assets; do not introduce paid dependencies.
- Before and after views at phone and desktop widths, in light and dark appearance.
- Variants and states: selected/unselected, hover where relevant, keyboard focus, disabled, pending, and error. State explicitly when a variant does not apply.
- Existing tokens to use, or a reason for a new semantic token. Give spacing, optical alignment, minimum display size, and crop/safe-area guidance.
- Motion duration/easing and a reduced-motion alternative when animation changes.
- Acceptance criteria describing visible behavior and any intended compatibility change.

Figma or another design tool can hold the editable source. The implemented tokens and React components remain the runtime source of truth. A design file alone does not update the application.

## Replace artwork safely

Prefer SVG for symbols and existing vector illustrations. Preserve the current viewBox, proportions, component props, and stable keys unless the task explicitly includes changing consumers. Remove editor metadata and external dependencies. Keep SVG gradient/mask IDs unique when an asset appears more than once on a page; existing components use generated IDs for this reason.

Decorative icons should remain hidden from assistive technology. Their enclosing button/link supplies the accessible name. Keep a textual name or label alongside color identity. Do not bake a label into an image when it should remain selectable, accessible text.

Garden reward keys and avatar identifiers are stored data. Replacing their appearance is different from renaming or removing them. Coordinate compatibility changes with the maintainer.

For component styling, use semantic tokens and supported props. If a new look repeats across consumers, propose a shared variant rather than styling each screen independently. Preserve the component’s keyboard and pending/error behavior.

## Preview and acceptance

1. Add or update a `/styleguide` example using the actual production component.
2. Inspect the component in context, including at least one real consuming screen. Check the inventory for separate image-rendering paths.
3. Check phone and desktop, light/dark, enlarged text, long labels, keyboard focus, and reduced motion. Aim for 44px interaction targets; decorative art can be smaller inside that target.
4. Run the checks in [TESTING.md](./TESTING.md). Review screenshot changes deliberately; the archive is a reference, not an automated visual oracle.
5. For visible implementation changes, run `pnpm shots <unique-label>` with the app and local backend running. Review viewport captures for fixed navigation and sheets.
6. Include the design source, changed paths, screenshots, validation results, and remaining limitations in the PR. The reviewer checks both the isolated component and its consumers.

## Handoff example

Task: replace the Home tab symbol.

Own: the Home icon paths in `src/components/icons/TabIcons.tsx`, its style-guide presentation, and screenshots.

Preserve: the `active` and `className` props, 24×24 viewBox, currentColor behavior, link label, touch target, and navigation destination.

Deliver: inactive and active variants, previews at the actual tab size in both appearances, editable source, and implementation evidence. Check `src/components/shell/TabBar.tsx` and `/styleguide`; changing the tab icon does not change the app icon or brand mark.
