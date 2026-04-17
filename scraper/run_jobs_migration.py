#!/usr/bin/env python3
"""
Run a small Convex migration loop to backfill jobDetails and strip heavy fields.

Prerequisites:
  - Run `npx convex dev --local` (or have a Convex URL)
  - Ensure `.env.local` contains NEXT_PUBLIC_CONVEX_URL (created by `npx convex dev --local --once`)

From repo root:
  python scraper/run_jobs_migration.py
"""

from __future__ import annotations

import json
import os
import sys
import time
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict

import requests
from requests.exceptions import ConnectionError, HTTPError, Timeout

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(REPO_ROOT, ".env.local")


def _load_env_local(path: str) -> Dict[str, str]:
    env: Dict[str, str] = {}
    if not os.path.isfile(path):
        return env
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            k, v = s.split("=", 1)
            env[k.strip()] = v.strip()
    return env


class JobJSONEncoder(json.JSONEncoder):
    def default(self, o: object) -> object:
        if isinstance(o, Decimal):
            return float(o)
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        if isinstance(o, bytes):
            return o.decode("utf-8", errors="replace")
        if isinstance(o, uuid.UUID):
            return str(o)
        return super().default(o)


def _post_mutation(
    convex_url: str,
    fn: str,
    args: dict,
    timeout_s: int = 60,
    max_attempts: int = 12,
) -> Any:
    convex_url = convex_url.rstrip("/")
    url = f"{convex_url}/api/mutation"
    payload = json.dumps({"path": fn, "args": args, "format": "json"}, cls=JobJSONEncoder, ensure_ascii=False)
    last_err: Exception | None = None
    for attempt in range(1, max_attempts + 1):
        try:
            r = requests.post(
                url,
                data=payload.encode("utf-8"),
                headers={"Content-Type": "application/json; charset=utf-8"},
                timeout=timeout_s,
            )
            if r.status_code in (502, 503, 504):
                raise HTTPError(f"{r.status_code} from Convex (not ready)", response=r)
            r.raise_for_status()
            data = r.json()
            break
        except (ConnectionError, Timeout, HTTPError) as e:
            last_err = e
            # Convex local often restarts after schema changes; retry with backoff.
            backoff_s = min(0.25 * (2 ** (attempt - 1)), 8.0)
            print(f"Convex not ready (attempt {attempt}/{max_attempts}). Retrying in {backoff_s:.2f}s...")
            time.sleep(backoff_s)
    else:
        assert last_err is not None
        raise last_err

    if "status" in data and data["status"] == "error":
        raise RuntimeError(data.get("errorMessage") or "Convex mutation error")
    return data.get("value")


def main() -> int:
    env = _load_env_local(ENV_PATH)
    convex_url = os.environ.get("NEXT_PUBLIC_CONVEX_URL") or env.get("NEXT_PUBLIC_CONVEX_URL")
    if not convex_url:
        print("Missing NEXT_PUBLIC_CONVEX_URL. Run `npx convex dev --local --once` first.", file=sys.stderr)
        return 1

    # Default smaller batch to reduce per-call load; override with env if desired.
    batch_size = int(os.environ.get("MIGRATION_BATCH_SIZE", "100"))
    sleep_s = float(os.environ.get("MIGRATION_SLEEP_S", "0.05"))

    print(f"Target Convex URL: {convex_url}", flush=True)
    print(f"Running jobs:migrateSplitRaw in batches of {batch_size}...", flush=True)

    total = 0
    cursor: str | None = None
    while True:
        args: Dict[str, Any] = {"batchSize": batch_size}
        if cursor is not None:
            args["cursor"] = cursor
        res = _post_mutation(
            convex_url,
            "jobs:migrateSplitRawCursor",
            args,
        )
        migrated = int((res or {}).get("migrated") or 0)
        scanned = int((res or {}).get("scanned") or 0)
        cursor = (res or {}).get("continueCursor") or None
        is_done = bool((res or {}).get("isDone"))
        total += migrated
        print(f"scanned={scanned} migrated={migrated} total_migrated={total} isDone={is_done}", flush=True)
        if is_done or migrated == 0:
            break
        time.sleep(sleep_s)

    print("Done.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

