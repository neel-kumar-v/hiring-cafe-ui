# Hiring Cafe UI

I rebuilt [hiring.cafe](https://hiring.cafe/) as a full-stack product clone: search, filters, job details, and an application tracker, wired to a real Convex backend and a live scrape → ingest pipeline.

**Try it:** [hiring-cafe-ui-neelkumarvs-projects.vercel.app](https://hiring-cafe-ui-neelkumarvs-projects.vercel.app)

## What I built

### Product surface
- Job board with company grouping, infinite scroll, multi-select bulk actions (save / apply / hide / share)
- Desktop job dialog and mobile drawer with neighbor prefetch and fade transitions while paging jobs
- hiring.cafe-style search dialog (tabs on mobile, sidebar on desktop) with the full filter chrome of the original
- Application tracker with Kanban drag-and-drop and a list view across saved → applied → interviewing → rejected → hidden

### Backend and data
- Convex schema for jobs, companies, denormalized `jobCards` (search/browse), `jobDetails` (heavy description payloads), autocomplete, users, and saved searches
- Search over `jobCards` with indexed text search, pagination caps, and overscan so post-filters do not return empty pages while matches still exist
- Autocomplete seeded into Convex with type-scoped search (denormalized values on the type index)
- Python scraper that posts batches into Convex (`ingestBatch`), with an admin secret gate and NDJSON replay for offline imports

### Engineering choices I care about
- Split browse cards from job details so list/search stays cheap and opening a job only fetches what the UI needs (`getDetailsLite`)
- Preserved user hide lists across re-ingest (a scrape must not wipe hides)
- Locked world-writable admin paths (ingest / seed / migrations) behind `INGEST_ADMIN_SECRET`
- Owner checks on saved-search rename/delete so an id alone is not enough
- Collapsed duplicated UI paths: shared job preview hook, shared search content variants, typed job/company mappers, tracker loaded via `useQueries` instead of imperative chunked fetches
- Cut search read amplification (no per-page parent `jobs` fetches just to recover `detailsId`; stopped writing unused sort fields on cards)

### Honest scope
- “Sign in” is a demo identity (email in `localStorage`), not OAuth. Enough to exercise hides and saved searches; not production auth.
- The filter UI mirrors hiring.cafe; the Convex query implements the facets that map cleanly to indexes (workplace, company, department, commitment, salary, YOE, date, location, profit/stage). Extra chips stay for clone fidelity.

## Stack

Next.js App Router · React 19 · TypeScript · Tailwind CSS 4 · Convex · Python scraper · Vercel

## Run it locally

```bash
pnpm install
```

`.env.local`:

```bash
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
CONVEX_DEPLOYMENT=<dev:your-deployment>
INGEST_ADMIN_SECRET=<secret>   # optional locally; set on Convex for ingest
```

```bash
pnpm dev
pnpm run import-jobs-convex          # scrape → Convex
./scripts/seed-autocomplete.ps1      # autocomplete options
```

| Command | Purpose |
| ------- | ------- |
| `pnpm run typecheck` | TypeScript |
| `pnpm run lint` | ESLint |
| `pnpm run build` | Production build |
| `pnpm run import-jobs-convex` | Live scrape ingest |

## Repo map

| Path | What is here |
| ---- | ------------ |
| `src/` | App Router UI: board, search, tracker |
| `convex/` | Schema, search, ingest, autocomplete, migrations |
| `scraper/` | Scrape + Convex ingest |
| `scripts/` | Seed / backfill helpers |
