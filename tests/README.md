## Playwright tests

This repo uses Playwright for end-to-end (E2E) and lightweight performance regression checks.

### Prereqs
- App server running at `http://localhost:3000`
- Convex running (because job details come from Convex)

### Run E2E

```bash
pnpm test:e2e
```

### Run perf tests (measures time-to-description-render)

```bash
pnpm test:perf
```

To enforce a hard threshold:

```bash
PERF_MAX_MS=1200 pnpm test:perf
```

