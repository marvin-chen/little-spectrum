<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Little Spectrum agent notes

Read SPEC.md for the product specification and PROGRESS.md for the current state before changing anything.

## Learnings

Keep this list short and concrete. Add a line whenever a mistake or a non-obvious fact costs time.

- Never add Claude or any agent as a commit author or co-author. Commits carry only the human author.
- Node is managed by asdf. Run commands from this directory so `.tool-versions` resolves Node 22, or export `ASDF_NODEJS_VERSION=22.23.4`.
- The git repository root is the home directory, one level up. Only `little-spectrum/`, `README.md`, and `.gitignore` are tracked there. Stage files explicitly, never with `git add -A` from the root.
- Local Supabase runs through Docker on colima. The user's Docker credential helpers are not on PATH, so start it with an isolated config: `DOCKER_CONFIG=<empty dir with {} config.json> DOCKER_HOST=unix://$HOME/.colima/default/docker.sock pnpm supabase start -x studio,imgproxy,logflare,vector,edge-runtime,postgres-meta,supavisor`.
