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

| Command                       | Purpose                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `pnpm run typecheck`          | TypeScript only (`tsc --noEmit`). **Use this for type errors — do not use `pnpm run build` as a substitute.** |
| `pnpm run lint`               | ESLint                                                                                                        |
| `pnpm run lint:fix`           | ESLint with fixes                                                                                             |
| `pnpm run format`             | Prettier                                                                                                      |
| `pnpm run build`              | Production build (slow; not for routine type checking)                                                        |
| `pnpm run start`              | Serve production build                                                                                        |
| `pnpm run import-jobs-convex` | Live scrape to Convex (`scraper/scrape_to_convex.py`)                                                         |

Do **not** run `pnpm run dev` unless the user asks (redundant for agents).

Do **not** delete local convex state unless explicitly asked.

## Agent notes

- Prefer `pnpm run typecheck` in a loop while editing; avoid `build` for that.
- Identity is localStorage email (`src/lib/local-auth.ts`), not Convex Auth.
- `convex/_generated` is tracked in git (required for Vercel). Keep regenerating via `pnpm run build` / `convex codegen`; do not delete it casually.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
