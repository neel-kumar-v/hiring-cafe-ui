# Hiring Cafe UI

UI clone of [hiring.cafe](https://hiring.cafe/). Next.js (App Router), React, Tailwind, TypeScript, and [Convex](https://convex.dev) for jobs, saved searches, and users.

## Setup

```bash
pnpm install
```

Copy `.env.local` with at least:

- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT` (for `pnpm convex` / scraper against your deployment)

```bash
pnpm dev
```

Opens [http://localhost:3000](http://localhost:3000) (Next + Convex).

## Scripts

| Command                       | Purpose                                   |
| ----------------------------- | ----------------------------------------- |
| `pnpm run typecheck`          | TypeScript (`tsc --noEmit`)               |
| `pnpm run lint` / `lint:fix`  | ESLint                                    |
| `pnpm run format`             | Prettier                                  |
| `pnpm run import-jobs-convex` | Live scrape → Convex (`jobs:ingestBatch`) |
| `pnpm run test:perf`          | Playwright perf smoke                     |

## Notes

- Job identity for hide/saved-search is a **localStorage email**, not real auth. Do not treat it as secure.
- Autocomplete options are seeded via `scripts/seed-autocomplete.ps1` into Convex `autocompleteValues`.
- Prefer `pnpm run typecheck` over `pnpm run build` for routine type checks.
