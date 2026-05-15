# Project overview

UI clone of [hiring.cafe](https://hiring.cafe/). Stack: Next.js (App Router),
React, Tailwind, TypeScript, Convex for jobs, saved searches, and users. Job
documents store a full payload in Convex `jobs.raw` (normalized keys in app
TypeScript).

## Structure

| Path | Role |
|------|------|
| `src/app/` | Routes, layouts, API route handlers |
| `src/components/` | UI, job board, search, tracker |
| `src/lib/` | Server/client helpers (search, utils, job normalization) |
| `src/data/` | Static JSON and filter config |
| `convex/` | Convex schema, queries, mutations |
| `Search/` | Legacy JS modules (excluded from root `tsconfig`; separate types in `Search/search.d.ts`) |
| `scraper/` | Python import scripts (Convex JSON import) |

Path alias: `@/*` → `src/*`.

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm run typecheck` | TypeScript only (`tsc --noEmit`). **Use this for type errors — do not use `pnpm run build` as a substitute.** |
| `pnpm run lint` | ESLint (Next) |
| `pnpm run lint:fix` | ESLint with fixes |
| `pnpm run format` | Prettier |
| `pnpm run build` | Production build (slow; not for routine type checking) |
| `pnpm run start` | Serve production build |
| `pnpm run import-jobs-convex` | Import scraped JSON into Convex |

Do **not** run `pnpm run dev` unless the user asks (redundant for agents).

Do **not** delete local convex state unless explicitly asked.

## Agent notes

- Prefer `pnpm run typecheck` in a loop while editing; avoid `build` for that.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
