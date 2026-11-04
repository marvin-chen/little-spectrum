# Ownership and review map

Marvin (`@marvin-chen`) is the initial maintainer and review-routing contact. Area owners are currently unassigned; this map defines responsibilities, not a claim that a team or enforced GitHub review rules already exist. Before work begins, every issue names one accountable contributor and one reviewer. A contributor owns their implementation, tests, documentation, and response to review.

Paths below are relative to the application directory `little-spectrum/`, except `.github/`, which is at the repository root.

| Area | Primary paths | Responsible for | Coordinate with |
|---|---|---|---|
| Shared UI and design | `src/components/ui/`, `src/components/icons/`, `src/components/shell/`, `src/app/globals.css`, `src/app/styleguide/` | Tokens, controls, navigation, accessibility, examples, asset contracts | All affected feature owners for public API/global visual changes |
| Identity and accounts | `src/lib/auth.ts`, `src/lib/supabase/`, `src/proxy.ts`, welcome/signin/auth routes, settings account actions | Authentication, account portability, credentials and cookie boundaries | Platform/database reviewer |
| Gardens and invitations | `src/lib/data/gardens.ts`, start/join routes, settings invitation controls, `src/components/invite/` | Capacity, invitation lifecycle, garden membership and preview cards | Identity, database, design |
| Session platform | `src/lib/data/sessions.ts`, `src/lib/games/engine.ts`, `src/components/session/`, play route/actions | Participant authorization, lifecycle, submissions, reveal and live updates | Every game owner, database reviewer |
| Individual game | Its `src/lib/games/` engine/tests, `src/components/games/<game>/`, relevant `src/content/` file | Rules, scoring, content, viewer-safe state, play/reveal experience | Session platform, catalog/registry, memories; schema reviewer for new game keys |
| Photos | `src/lib/photos/`, `src/app/api/photos/`, Color Quest photo presentation | Validation, processing, private storage, signed access, deletion and cleanup | Session platform and memories |
| Progression and garden | `src/lib/data/growth.ts`, `src/lib/week.ts`, `src/components/garden/`, `src/lib/themes.ts` | Timezone/week behavior, permanent rewards, scene and themes | Database and design |
| Memories | `src/lib/data/memories.ts`, `src/components/memories/`, memories routes/actions | Authorized history, reactions, notes, result presentation | Individual games and photos |
| Integration and quality | `supabase/migrations/`, tests/config/scripts, repository `.github/` | Schema compatibility, RLS, CI, repeatable setup, release evidence | Maintainer and affected area reviewer |

## Shared change rules

- Contributors may edit across areas when the issue includes the integration work. Identify those paths before starting and request the affected review; do not expand scope silently.
- The maintainer coordinates shared session contracts, database migrations, game registration, and global tokens. Agree on interfaces first when two projects need the same shared files.
- One project should deliver a complete user outcome. Separate reusable prerequisites when they unblock several projects; avoid splitting frontend/backend ownership so nobody owns the full behavior.
- A reviewer may be the maintainer until another person is assigned. Leave an unassigned project clearly marked rather than inventing an owner.
- This file does not install CODEOWNERS or branch protection. Those can be added after actual reviewer availability and repository settings are agreed.

## Suggested first assignments

A designer can own one icon family or a documented component variant using the handoff guide. A frontend contributor can own an isolated style-guide example or photo-viewing presentation. A game contributor needs the game integration checklist before receiving a new game. Backend work needs a migration/access-test plan. The roadmap tracks which foundations are complete and which are still pending.
