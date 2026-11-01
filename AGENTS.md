# Project overview

UI clone of [hiring.cafe](https://hiring.cafe/). Stack: Next.js (App Router),
React, Tailwind, TypeScript, Convex for jobs, saved searches, and users.
Browse/search uses denormalized `jobCards`; dialog payloads live in `jobDetails`.

## Structure

| Path              | Role                                                      |
| ----------------- | --------------------------------------------------------- |
| `src/app/`        | Routes, layouts, API route handlers                       |
| `src/components/` | UI, job board, search, tracker                            |
| `src/lib/`        | Server/client helpers (search, utils, job helpers)        |
| `src/data/`       | Autocomplete seed JSON and filter config                  |
| `convex/`         | Convex schema, queries, mutations                         |
| `scraper/`        | Python scrape + NDJSON replay into Convex                 |
| `scripts/`        | PowerShell helpers (autocomplete seed, jobCards backfill) |

Path alias: `@/*` → `src/*`.

## Commands

| Command                           | Purpose                                                                                                       |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm run typecheck`              | TypeScript only (`tsc --noEmit`). **Use this for type errors — do not use `pnpm run build` as a substitute.** |
| `pnpm run lint` / `vp lint`       | Lint (Oxlint via Vite+; migrated from ESLint `eslint-config-next`)                                            |
| `pnpm run lint:fix`               | Lint with fixes (`vp lint . --fix`)                                                                           |
| `pnpm run format` / `vp fmt`      | Format (Oxfmt via Vite+; migrated from Prettier, same options incl. `printWidth: 180`)                        |
| `pnpm run check` / `vp check`     | Format + lint in one pass (type-check NOT included; `tsc` stays the type gate)                                |
| `pnpm run build`                  | Production build (slow; not for routine type checking)                                                        |
| `pnpm run start`                  | Serve production build                                                                                        |
| `pnpm run test:unit`              | Unit tests (node:test via tsx). `vp test` is a green no-op until the suite converts to Vitest                 |
| `pnpm run test:e2e` / `test:perf` | Playwright (unchanged)                                                                                        |
| `pnpm run import-jobs-convex`     | Live scrape to Convex (`scraper/scrape_to_convex.py`)                                                         |

Vite+ (`vp v1.3.0`, local `vite-plus` dep) owns package mgmt + lint + format.
`pnpm run dev` / `dev:next` / `dev:convex` / `build` / `codegen` stay
Next + Convex + xport — do NOT use `vp dev`/`vp build` for the app (they are
Vite built-ins; this is a Next.js app). Any project script can also be run as
`vp run <script>`.

Do **not** run `pnpm run dev` unless the user asks (redundant for agents).

Do **not** delete local convex state unless explicitly asked.

## Agent notes

- Prefer `pnpm run typecheck` in a loop while editing; avoid `build` for that.
- Identity is localStorage email (`src/lib/local-auth.ts`), not Convex Auth.
- `convex/_generated` is tracked in git (required for Vercel). Keep regenerating via `pnpm run build` / `convex codegen`; do not delete it casually.

## Agentation annotations

The Agentation toolbar (`src/app/layout.tsx`, dev only, endpoint `http://localhost:4747`) lets the user annotate the page; annotations reach agents through the `agentation` MCP server (`npx -y agentation-mcp server`, configured in `.cursor/mcp.json` and `opencode.json`).

- To receive feedback: call `agentation_watch_annotations` (blocks for new ones) or `agentation_get_all_pending`.
- Per annotation: `agentation_acknowledge` → fix the code → `agentation_resolve` (with summary), then watch again.
- `agentation_get_all_pending` returns **only** `pending`. Annotations left in `acknowledged` (child died mid-fix) are invisible to that call — scan `GET /sessions/:id` for `status=acknowledged` and finish/resolve those too. Also rehydrate `feedback-annotations-*` from browser localStorage when MCP pending is empty.
- If annotations seem missing: `npx -y agentation-mcp doctor`, restart the MCP server, and confirm the browser session appears via `agentation_list_sessions`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
