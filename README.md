# Hiring Cafe UI

A production-shaped **UI clone** of [hiring.cafe](https://hiring.cafe/) — a job search product with filters, job details, and an application tracker.

Built as a portfolio / take-home style rebuild: same product surface as the original, backed by a real Convex database and scrape → ingest pipeline instead of mock fixtures.

**Live:** [hiring-cafe-ui-neelkumarvs-projects.vercel.app](https://hiring-cafe-ui-neelkumarvs-projects.vercel.app)

## What this demonstrates

- **Job board UX** — company-grouped results, infinite scroll, multi-select actions, dialog (desktop) / drawer (mobile) job details
- **Search & filters** — hiring.cafe-style filter dialog with workplace, company, compensation, location, role, and more (Convex query covers the filters that map cleanly to indexed fields)
- **Application tracker** — Kanban + list views for saved / applied / interviewing / rejected / hidden, with drag-and-drop
- **Backend data model** — Convex tables for jobs, denormalized `jobCards` for search, `jobDetails` for description payloads, companies, autocomplete, saved searches
- **Ingest path** — Python scraper → `jobs.ingestBatch` (admin-secret gated) with hide-list preservation on re-scrape

## Stack

| Layer | Choice |
| ----- | ------ |
| App | Next.js App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, Radix / shadcn-style primitives |
| Data | [Convex](https://convex.dev) (queries, mutations, search indexes) |
| Ingest | Python scraper + NDJSON import scripts |
| Deploy | Vercel (frontend) + Convex Cloud (backend) |

## Architecture (short)

```
Browser  →  Next.js (Vercel)  →  Convex (jobs / jobCards / users / savedSearches)
                ↑
         scrape_to_convex.py  (admin secret)
```

- Browse/search reads **`jobCards`** (search text + filter fields denormalized for speed).
- Opening a job loads **`getDetailsLite`** (description + company) by job or card id.
- “Sign in” is a **demo identity**: email in `localStorage`, not OAuth. Fine for a clone; not production auth.

## Local setup

```bash
pnpm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
CONVEX_DEPLOYMENT=<dev:your-deployment>   # for local convex / scraper
# optional but recommended for ingest:
INGEST_ADMIN_SECRET=<secret>              # also set on the Convex deployment
```

```bash
pnpm dev          # Next + convex dev
pnpm run typecheck
pnpm run lint
```

Populate jobs:

```bash
pnpm run import-jobs-convex
```

Seed autocomplete (PowerShell):

```powershell
./scripts/seed-autocomplete.ps1
```

## Scripts

| Command | Purpose |
| ------- | ------- |
| `pnpm dev` | Next + Convex watchers |
| `pnpm run typecheck` | `tsc --noEmit` (prefer this over `build` while iterating) |
| `pnpm run lint` / `lint:fix` | ESLint |
| `pnpm run format` | Prettier |
| `pnpm run build` | Next production build (expects `convex/_generated` present) |
| `pnpm run codegen` | Regenerate `convex/_generated` (usually via `pnpm convex dev`) |
| `pnpm run import-jobs-convex` | Live scrape → Convex ingest |
| `pnpm run test:perf` | Playwright perf smoke |

## Repo layout

| Path | Role |
| ---- | ---- |
| `src/app/` | Routes, layouts, API handlers |
| `src/components/` | Job board, search, tracker, UI |
| `src/lib/` | Search helpers, job mappers, auth stub |
| `convex/` | Schema, queries, mutations, generated API |
| `scraper/` | Python scrape + Convex ingest |
| `scripts/` | Autocomplete seed, backfill helpers |

## Notes for reviewers

- Identity, hides, and saved searches are **not** hardened multi-tenant auth — they use a client-supplied email string with server-side owner checks on saved-search mutations.
- Admin writes (`ingestBatch`, autocomplete seed, migrations) require `INGEST_ADMIN_SECRET` when that env is set on Convex.
- Not every filter chip in the UI is wired into the Convex search query; the clone keeps the full filter surface while the backend indexes the high-value facets.
- `convex/_generated` is committed so Vercel can build without a Convex login at build time. After schema/API changes, regenerate with `pnpm convex dev` or `pnpm run codegen`.
