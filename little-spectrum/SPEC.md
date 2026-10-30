# Little Spectrum specification

Build a complete, polished, mobile-first website called **Little Spectrum**: a private place where long-distance friends play short games, share moments from their lives, and grow a garden together.

Product promise: **"A little color. A little closer."**

Implement the actual website and backend. This should be a working product, not just a visual prototype or implementation plan. Make reasonable decisions without asking routine clarification questions.

## 1. Core concept

Users create a private shared garden for either:
- **Just us two:** capacity of two people.
- **A group of friends:** capacity of up to eight people, including the creator.

Each garden contains:
- Six short games.
- Pending turns people can complete asynchronously.
- A shared garden that grows through participation.
- A gentle weekly goal and streak.
- A private history of completed games, photos, and memories.

All games work asynchronously. When participants are online together, updates should feel quick enough to play live.

The experience is for friends as well as partners. Use warm, playful, lightly witty copy without romantic assumptions, therapy language, or guilt.

## 2. Technology and free hosting

Use:
- Next.js with TypeScript.
- Tailwind CSS.
- Supabase Free for the database, authentication, and private photo storage.
- Vercel Hobby for deployment.
- A free Vercel-provided domain.

Design for a small personal, noncommercial project operating within free-plan allowances.

Do not require:
- Paid subscriptions or trial credits.
- Paid AI APIs.
- Paid email or SMS services.
- A purchased domain.
- A separate always-running server.
- Paid assets, fonts, or component libraries.
- Scheduled jobs for normal gameplay or garden progression.

Use bundled game prompts and original SVG/CSS illustrations. Favor system fonts or locally bundled open-source fonts.

Keep the architecture straightforward: shared components, clear game state transitions, and reusable server-side validation.

Provide database migrations, access policies, `.env.example`, and beginner-friendly setup instructions. Document current free-plan limits and potential inactivity pausing. Do not promise unlimited usage.

## 3. Design reference: iOS-inspired web interface

Use this Figma Community file as the primary visual reference:

https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27

Inspect it if accessible. Treat it as a visual reference, without assuming it is an official Apple resource. If unavailable, continue using the detailed direction below.

Create an original website inspired by the clarity, hierarchy, controls, and polish of Apple's iOS interfaces. The app should feel comfortable on an iPhone while remaining a responsive website usable on Android and desktop.

### Visual language

Use:
- Large, confident page titles.
- Clear hierarchy between titles, section headings, labels, and supporting text.
- A system font stack starting with `-apple-system` and `BlinkMacSystemFont`.
- Softly rounded grouped surfaces.
- Subtle separators and restrained shadows.
- Capsule buttons, segmented controls, and compact status badges.
- Spacious layouts with strong alignment.
- Translucent navigation surfaces with a gentle frosted-glass effect.
- Small, responsive press animations.
- Smooth sheet and page transitions.
- Simple, consistent outline icons from a free icon library.

Use translucency selectively for navigation bars, tab bars, and sheets. Keep game content and important text on surfaces with reliable contrast.

Avoid excessive blur, decorative glass panels everywhere, oversized shadows, and continuous background animation.

Build reusable design tokens for typography, spacing, radius, colors, elevation, and motion.

### Little Spectrum's identity

Combine iOS-inspired structure with a warm, colorful personality:
- Warm ivory or softly tinted backgrounds.
- Deep ink-colored text.
- Pastel accents and small areas of richer color.
- Charming original garden illustrations.
- Gentle gradients where useful.
- Calm screens with one clear primary action.

The garden can be playful and illustrated, the surrounding controls should remain clean and precise.

Use this coherent color system:

| Game | Color identity | Descriptor |
|---|---|---|
| Hue Knew? | Coral/orange | Guess the vibe |
| True Colors | Rose | Predict your friend |
| Hue Clue | Violet | Find the color |
| Same Wavelength | Blue | Match your minds |
| Palette Picks | Amber | Rank and compare |
| Color Quest | Green | Share your world |

Use softer color accents in the catalog and richer color within games.

Color must always be paired with names, icons, or labels.

### iOS-inspired interaction patterns

Use:
- A floating or inset bottom tab bar on mobile.
- Large page titles on main screens and compact headers inside games.
- Bottom sheets for starting games, selecting participants, and viewing garden items.
- Segmented controls for short, mutually exclusive choices.
- Grouped settings rows.
- A native-feeling share action, using the Web Share API where available and a copy-link fallback.
- Clear confirmation sheets for early reveal and destructive actions.

Do not draw a fake phone frame, status bar, home indicator, or other operating-system chrome.

Use familiar web behavior:
- Browser Back works correctly.
- Pages and games have usable URLs.
- Dialogs support focus management and dismissal.
- Do not disable browser zoom.
- Do not require gestures for essential actions.

Prefer free, web-friendly icons rather than depending on Apple-specific asset packages.

### Responsive behavior

On mobile, keep the main action easy to reach and respect safe areas.

On desktop, use a centered, comfortably sized application layout with more room for the garden, game content, and supporting information. Do not simply stretch phone cards across the whole screen.

Prioritize an excellent light appearance. If adding dark mode, maintain the same color identities and accessible contrast without delaying core functionality.

## 4. Navigation and accessibility

Primary navigation:
- Home
- Games
- Garden
- Memories

Include:
- Comfortable touch targets, generally at least 44 x 44 CSS pixels.
- No hover-only controls.
- Minimal typing.
- Clear turn status.
- Mobile keyboard handling.
- Visible keyboard focus.
- Accessible names and form labels.
- Readable contrast.
- Reduced-motion support.
- Solid-background fallbacks when backdrop blur is unavailable.

The Games screen includes labeled color filters and an "All colors" option. On mobile, filters can scroll horizontally.

Every game should have concise instructions and an obvious next action.

## 5. Identity, gardens, and invitations

Use Supabase anonymous authentication for low-friction onboarding.

Users choose:
- A display name.
- A simple avatar.

Returning on the same browser restores the session. Explain that guest access belongs to that browser and may be lost if browser data is cleared. Email delivery must not be a prerequisite.

A user can belong to multiple gardens. Include a garden switcher and keep each garden's membership, content, and progress separate.

Garden creation:
1. Choose "Just us two" or "A group of friends."
2. Name the garden.
3. Pick one of a few simple starting color themes.
4. Share an invitation link.

The creator can explore while waiting for a friend. Games require at least two members.

Use one membership system with a capacity setting. A two-person garden can expand to an eight-person garden without losing history.

Invitation requirements:
- Long, random tokens.
- Server-side validation.
- Creator can revoke and regenerate links.
- Capacity enforced atomically, including simultaneous joins.
- Existing members return to the garden without consuming another slot.
- Full gardens display a friendly explanation.

Do not require contact access, phone numbers, or email invitations.

## 6. Home screen

Show:
- Garden name and member avatars.
- A friendly contextual greeting.
- An illustrated garden preview.
- Weekly progress.
- A prominent "Your turn" section.
- Games waiting on other participants.
- A "Start something colorful" action.
- Recent completed activities.

For a garden awaiting its second member, prioritize sharing the invitation.

Use specific statuses:
- "Your clue is ready."
- "Waiting for Jamie's picks."
- "Three of four answers are in."
- "The reveal is ready."

Use the iOS-inspired hierarchy: a large page title, clear section labels, grouped content, and a calm primary action.

## 7. Participation and reveal rules

Garden membership and game participation are separate.

Any member can start a game and select between two people and all current members, including themselves. Include an "Everyone" shortcut.

Lock participants when the session starts. Allow multiple pending sessions.

For clue games, the creator is the clue giver. For other games, everyone participates equally.

Normal reveal:
- Reveal automatically once all required submissions are committed.
- Keep other players' unrevealed answers private.
- Committed answers cannot be edited.

Early reveal:
- The creator can select "Reveal available answers."
- Show who is still pending before confirmation.
- Simultaneous-answer games require at least two submitted players.
- Clue games require a committed clue and at least one committed guess.
- Early reveal ends the session permanently.
- Missing players are labeled "Didn't play this round."
- Missing players receive no penalty.
- For Same Wavelength, early reveal ends the whole session rather than starting another attempt.

Only selected participants can access session content, photos, comments, and detailed memories. Other garden members can see a generic activity entry indicating that a game contributed to growth.

Players can close the website and resume later.

## 8. Hue Knew?

Color: coral/orange.
Descriptor: "Guess the vibe."

A spectrum-guessing game.

Flow:
1. Present opposing labels, such as "Cozy <-> Chaotic."
2. Privately give the clue giver a target from 0-100.
3. They submit a clue of up to 60 characters.
4. Other participants independently place and confirm a guess.
5. Reveal the target and everyone's guesses.

Scoring:
- Individual score = max(0, 100 - 2 x absolute distance).
- Round to an integer.
- Shared score is the average submitted score.

One clue and its guesses complete a session.

Use a polished slider with a large touch area, clear endpoint labels, and a numerical selection preview. Show labeled player markers at reveal, handling overlapping guesses clearly.

Suggest a different clue giver for the next session.

Bundle at least 40 varied spectrum pairs.

The target must remain inaccessible to guessers until reveal, including in network responses.

## 9. True Colors

Color: rose.
Descriptor: "Predict your friend."

Flow:
1. Present a question with four options.
2. Assign each participant another person to predict using a circular assignment.
3. Each privately chooses their own answer and predicts their assigned friend's answer.
4. Commit both selections together.
5. Reveal actual answers and predictions.

Everyone makes one prediction and receives one prediction.

Scoring:
- One point per correct prediction.
- Show correct predictions out of scorable predictions.
- On early reveal, predictions about someone who did not submit are unscored.
- If nothing is scorable, show answers without inventing a score.

One question completes a session.

Use large selectable answer rows with clear selected states. Make the distinction between "Your answer" and "Your prediction for Jamie" unmistakable.

Bundle at least 40 questions across everyday preferences, hypothetical choices, nostalgia, and light personality topics. Avoid intrusive or exclusively romantic questions.

## 10. Hue Clue

Color: violet.
Descriptor: "Find the color."

Flow:
1. Show a fixed 12-column by 8-row color grid.
2. Privately assign a target cell to the clue giver.
3. They submit a clue of up to three words.
4. Each other player selects a cell and confirms.
5. Reveal the target and everyone's guesses.

Scoring:
- Use Manhattan distance between cells.
- Individual score = max(0, 100 - 15 x distance).
- Shared score is the average submitted score.

One clue and its guesses complete a session.

Use a deterministic palette with identical cell coordinates on every device.

Provide a magnified selected-color preview and a separate confirmation button so mobile users do not submit accidentally.

Give cells coordinates and useful color labels. Support keyboard selection. Keep secret targets private until reveal.

## 11. Same Wavelength

Color: blue.
Descriptor: "Match your minds."

Flow:
1. Give everyone the same category, such as "Something you bring to the beach."
2. Each privately submits one word or a short phrase.
3. Reveal answers together.
4. Highlight matching pairs and groups.
5. End with a special celebration if everyone matches.
6. Otherwise, allow another attempt inspired by the revealed answers.

Allow up to three attempts. Keep earlier revealed answers visible.

Matching:
- Trim whitespace.
- Collapse repeated spaces.
- Ignore capitalization.
- Remove basic punctuation.
- Use exact normalized matching.
- No AI or semantic matching.

Celebrate any matching pair. Show the largest matching group and reserve a bigger celebration for a full-group match.

For two people, a matching pair is a full-group win.

Use a simple input, clear "Lock in" action, and an attractive reveal of submitted word tiles.

Bundle at least 50 starting categories.

## 12. Palette Picks

Color: amber.
Descriptor: "Rank and compare."

Flow:
1. Present five themed items.
2. Everyone privately ranks them first through fifth.
3. Reveal individual rankings and group-average rankings.
4. Highlight shared favorites, biggest disagreements, and the most similar pair or pairs.

Controls:
- Drag-and-drop where supported.
- Accessible move-up and move-down buttons.
- Clear position numbers and a separate confirmation action.

Scoring:
- Pair similarity = round(100 x (1 - sum of absolute rank differences / 12)).
- Overall similarity is the average across all submitted-player pairs.
- Handle ties fairly.

One ranking completes a session.

Bundle at least 30 curated sets involving foods, weekend plans, fictional powers, seasons, small luxuries, and similar approachable topics.

Avoid ranking real friends, bodies, or sensitive identities.

## 13. Color Quest

Color: green.
Descriptor: "Share your world."

Flow:
1. Give everyone the same photo prompt.
2. Each submits one photo with an optional caption of up to 200 characters.
3. Reveal the photos together in a responsive gallery.
4. Save the exchange as a private memory.

No competitive score.

Example prompts:
- "Something that made you smile today."
- "A tiny detail you usually overlook."
- "Find something in today's featured color."
- "Your current view."
- "Something your friend would appreciate."

Bundle at least 30 prompts.

Photo handling:
- Support library selection and camera capture where available.
- Resize to a maximum long edge of approximately 1600 pixels.
- Re-encode to JPEG or WebP, targeting 500 KB or less.
- Strip location metadata.
- Validate actual content, type, and size server-side.
- Show useful unsupported-format errors.
- Store privately.
- Restrict access to session participants.
- Keep others' unrevealed photos inaccessible.
- Use compact previews and lazy loading.
- Avoid duplicate thumbnail files unless necessary.

Use a polished upload sheet with a preview, caption field, and clear confirmation.

Uploaders can delete their photos, removing both the file and database record. Update memories gracefully afterward.

Track temporary uploads and opportunistically clean up failed uploads without scheduled jobs.

## 14. Shared garden and weekly ritual

The garden represents time spent connecting.

Rules:
- Each completed session awards one shared growth point.
- At least two valid participants are required.
- All six games count equally.
- Scores do not affect growth.
- Three completions in one week unlock one permanent garden item.
- Award at most one weekly item per garden.
- Incomplete or abandoned games do not count.
- A multi-attempt Same Wavelength session counts once.
- Award points and rewards exactly once under retries and simultaneous completions.

Store the creator's timezone on the garden. Weeks run Monday through Sunday. Show the weekly reset clearly.

Use friendly copy:
- "2 of 3 little moments this week."
- "Your garden grew something new."
- "Four friends added a little color this week."

Include a gentle consecutive-week streak:
- Nothing dies.
- Plants are never removed.
- Missing a week preserves past progress.
- Returning feels welcome.
- No participation leaderboard.

Create approximately 12 original illustrated plants or decorations with attractive variations. Select weekly rewards deterministically.

The Garden screen should be a charming illustrated scene with restrained controls. Tapping an item opens a bottom sheet showing when it was earned and the relevant activities. Only show session details to authorized participants.

Calculate growth from stored events and server timestamps. No cron jobs.

Do not add a separate pet system.

## 15. Memories

Create a chronological feed of completed sessions the current user is authorized to view.

Include:
- Game identity and date.
- Participants.
- Answers, photos, or visual results.
- Score where relevant.
- A small set of emoji reactions.
- One optional comment per participant, up to 300 characters.

Allow filtering by game.

Use clean grouped cards and photo layouts with enough space for the content. Do not build a full messaging system.

## 16. Backend integrity and privacy

Use clear models for:
- Profiles.
- Gardens and memberships.
- Invitations.
- Sessions and participants.
- Private targets and submissions.
- Revealed results.
- Growth events and weekly rewards.
- Photos.
- Reactions and comments.

Enforce authorization through backend checks and database policies.

Requirements:
- Garden data is restricted to members.
- Session content is restricted to selected participants.
- Unrevealed submissions are visible only to their author.
- Secret targets are visible only to the clue giver until reveal.
- Committed answers cannot be changed.
- Joining, scoring, revealing, and rewards are validated server-side.
- Completion is atomic and idempotent.
- Concurrent submissions cannot corrupt state.
- Capacity cannot be exceeded.
- Service-role credentials never reach the browser.

Do not send secret information to unauthorized browsers and merely hide it visually.

Use appropriate validation and basic request throttling for invitations and uploads.

## 17. Updates and resilience

Use Supabase realtime if it simplifies reliable updates, with a refresh or polling fallback.

If polling:
- Poll only relevant pending sessions.
- Pause in background tabs.
- Avoid constant whole-app polling.

Handle reconnection and stale pages safely. Refreshes must not duplicate submissions or rewards.

When environment variables are missing:
- Provide an explicitly labeled, isolated demo mode.
- Seed an attractive example garden and sample results.
- Explain how to enable real multiplayer.

When a configured backend is unavailable or paused:
- Show a friendly retry state.
- Preserve the current route.
- Do not silently replace real data with demo data.

Keep storage and bandwidth usage modest. Explain provider limits in the setup documentation and handle quota errors usefully.

## 18. Scope and priorities

Implement all six games using shared interface patterns.

Prioritize:
1. Authentication, invitations, and private membership.
2. Persistent play across devices.
3. Correct submissions, scoring, and reveals.
4. Excellent mobile usability.
5. Garden progression and memories.
6. Visual polish.

Omit:
- Public matchmaking.
- More than eight members per garden.
- Payments.
- External AI generation.
- Voice/video calls.
- Push notifications.
- Complex inventories.
- A separate pet system.

Use original branding, illustrations, and copy. The Apple/iOS reference guides the interface's clarity and interaction quality. Little Spectrum retains its own identity.

## 19. Verification

Use independent browser sessions to verify:
- Creating two-person and eight-person gardens.
- Joining by invitation.
- Capacity enforcement, including simultaneous joins.
- Rejecting a ninth member.
- Switching between separate gardens.
- Playing with a subset of a larger garden.
- Completing all six games with two players.
- Completing all six games with group participants.
- Normal and early reveals.
- Refreshing and resuming.
- Keeping secret targets, answers, and photos private.
- Restricting detailed memories to participants.
- Uploading and deleting photos.
- Awarding exactly one reward after three weekly completions.
- Handling simultaneous completions safely.

Verify the interface at narrow mobile, tablet, and desktop widths.

Check:
- Bottom navigation does not cover content.
- Sheets work with the mobile keyboard.
- Blur effects preserve readability.
- Essential actions work without gestures.
- Focus and reduced-motion behavior are correct.
- Color labels remain understandable without relying on color alone.

Add focused automated checks for scoring, normalization, permissions, transitions, capacity, week boundaries, and duplicate reward prevention.

Run the production build and relevant checks. Do not claim verification you could not perform.

## 20. Delivery

Deliver:
- The implemented project.
- Database migrations and access/storage policies.
- Environment variable template.
- Bundled prompts.
- A concise beginner-friendly README.
- Known limitations.

Setup instructions should explain:
1. Creating a free Supabase project.
2. Enabling anonymous authentication.
3. Applying migrations and storage configuration.
4. Adding environment variables.
5. Deploying to Vercel Hobby.
6. Testing with separate browsers.
7. Understanding free-plan quotas and inactivity pausing.

Keep manual setup minimal.

Finish with a concise report of what works, what configuration remains, what was tested, and any limitations.

Build a complete, charming website that friends can use after configuration, with the clarity and polish of an iOS-inspired interface.

## Delivery process

Implement in stages, continuing automatically between them:

1. Create the scaffold and shared design system. Verify, commit, and push.
2. Implement authentication, garden membership, invitations, and Hue Knew? as a complete vertical slice. Verify real play between separate browser sessions, including secret-target privacy, before expanding.
3. Reuse the proven session, participation, submission, and reveal infrastructure to implement the remaining five games.
4. Complete garden progression, memories, photo handling, accessibility, and visual polish.
5. Run final verification, fix failures, and commit and push the finished work.

At each stage, run focused checks for the behavior just implemented.
Commit and push at meaningful milestones with small, coherent checkpoints.
Keep concise progress notes in PROGRESS.md.
Never commit secrets, real environment files, credentials, uploaded user photos, dependency folders, or build artifacts.
