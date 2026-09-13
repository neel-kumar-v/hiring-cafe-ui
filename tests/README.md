## Playwright tests

This repo has a lightweight Playwright **perf** smoke (`tests/perf/`), not a full E2E suite.

### Prereqs

- App at `http://localhost:3000`
- Convex with job data

### Run

```bash
pnpm test:perf
```

Hard threshold:

```bash
PERF_MAX_MS=1200 pnpm test:perf
```

`pnpm test:e2e` runs the same Playwright project under `./tests`.
