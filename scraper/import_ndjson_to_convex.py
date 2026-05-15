#!/usr/bin/env python3
"""
Replay NDJSON backups (written by `scraper/scrape_to_convex.py`) into Convex.

Each NDJSON line is expected to be either:
  - {"page": <int>, "job": <HiringCafe job object>}
  - or a raw HiringCafe job object

This importer streams line-by-line (low memory) and upserts via `jobs:ingestBatch`,
so it is safe to run multiple times (dedup happens by `externalId` in Convex).
"""

from __future__ import annotations

import argparse
import glob
import importlib.util
import json
import os
import sys
import time
from typing import Any, Dict, List

import requests

from convex_dotenv import MISSING_CONVEX_URL_MESSAGE, get_convex_deployment_url, load_convex_environment
from convex_payload import strip_json_nones

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "src", "data")


def _convex_mutation_url(convex_url: str) -> str:
    convex_url = convex_url.rstrip("/")
    return f"{convex_url}/api/mutation"


def _post_mutation(convex_url: str, fn: str, args: dict, timeout_s: int = 30) -> Any:
    args = strip_json_nones(args)
    payload = json.dumps({"path": fn, "args": args, "format": "json"}, ensure_ascii=False)
    url = _convex_mutation_url(convex_url)

    # Convex local dev can briefly return 503 during startup/restart. Retry with backoff.
    last_err: Exception | None = None
    for attempt in range(1, 9):
        try:
            r = requests.post(
                url,
                data=payload.encode("utf-8"),
                headers={"Content-Type": "application/json; charset=utf-8"},
                timeout=timeout_s,
            )
            if r.status_code == 503:
                raise requests.exceptions.HTTPError("503 Service Unavailable", response=r)
            r.raise_for_status()
            data = r.json()
            if data.get("status") == "error":
                raise RuntimeError(data.get("errorMessage") or "Convex mutation error")
            return data.get("value")
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.HTTPError) as e:
            last_err = e
            sleep_s = min(10.0, 0.75 * (2 ** (attempt - 1)))
            # Keep output sparse but visible so it doesn't look hung.
            msg = str(e)
            if isinstance(e, requests.exceptions.HTTPError) and getattr(e, "response", None) is not None:
                msg = f"HTTP {e.response.status_code}"
            print(f"[convex] attempt {attempt}/8 failed ({msg}); retrying in {sleep_s:0.1f}s", file=sys.stderr)
            time.sleep(sleep_s)

    raise last_err if last_err is not None else RuntimeError("Failed to call Convex mutation")


def _iter_paths(pattern_or_path: str) -> List[str]:
    # Allow passing a directory, a file, or a glob pattern.
    if os.path.isdir(pattern_or_path):
        return sorted(glob.glob(os.path.join(pattern_or_path, "*.ndjson")))
    if any(ch in pattern_or_path for ch in "*?[]"):
        return sorted(glob.glob(pattern_or_path))
    return [pattern_or_path]


def _extract_job_obj(obj: Any) -> Any:
    if isinstance(obj, dict) and "job" in obj and isinstance(obj["job"], dict):
        return obj["job"]
    return obj


def _load_build_ingest_item():
    """
    Load `_build_ingest_item` from `scraper/scrape_to_convex.py` without requiring
    `scraper` to be a Python package (works when running `python scraper/...py`).
    """
    scrape_path = os.path.join(REPO_ROOT, "scraper", "scrape_to_convex.py")
    spec = importlib.util.spec_from_file_location("_hcu_scrape_to_convex", scrape_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Failed to load module spec for {scrape_path}")
    mod = importlib.util.module_from_spec(spec)
    # Register before execution so decorators (e.g. dataclass) can resolve __module__.
    sys.modules[spec.name] = mod
    spec.loader.exec_module(mod)  # type: ignore[union-attr]
    fn = getattr(mod, "_build_ingest_item", None)
    if not callable(fn):
        raise RuntimeError("scrape_to_convex.py did not expose _build_ingest_item")
    return fn


def import_file(convex_url: str, path: str, batch_size: int) -> int:
    _build_ingest_item = _load_build_ingest_item()

    total = 0
    fallback_i = 0
    batch: List[Dict[str, Any]] = []
    lines_read = 0

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            lines_read += 1
            if lines_read % 5000 == 0:
                print(f"[ndjson] {os.path.basename(path)} lines_read={lines_read} queued={len(batch)} upserted={total}", file=sys.stderr)
            s = line.strip()
            if not s:
                continue
            try:
                parsed = json.loads(s)
            except Exception:
                continue

            raw = _extract_job_obj(parsed)
            if not isinstance(raw, dict):
                continue

            fallback_i += 1
            batch.append(_build_ingest_item(raw, fallback_i))

            if len(batch) >= batch_size:
                print(f"[convex] sending batch size={len(batch)} (upserted_so_far={total})", file=sys.stderr)
                _post_mutation(convex_url, "jobs:ingestBatch", {"items": batch})
                total += len(batch)
                batch.clear()

    if batch:
        print(f"[convex] sending final batch size={len(batch)} (upserted_so_far={total})", file=sys.stderr)
        _post_mutation(convex_url, "jobs:ingestBatch", {"items": batch})
        total += len(batch)

    return total


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--path",
        default=DATA_DIR,
        help="NDJSON path / glob / directory. Default: src/data (imports *.ndjson).",
    )
    ap.add_argument("--batch", type=int, default=200, help="ingestBatch items per request (default 200)")
    ap.add_argument("--delete", action="store_true", help="Delete imported NDJSON file(s) after success")
    args = ap.parse_args()

    if args.batch < 1 or args.batch > 500:
        print("Batch size must be between 1 and 500.", file=sys.stderr)
        return 2

    try:
        load_convex_environment()
    except ImportError as e:
        print(str(e), file=sys.stderr)
        return 1

    convex_url = get_convex_deployment_url()
    if not convex_url:
        print(MISSING_CONVEX_URL_MESSAGE, file=sys.stderr)
        return 1

    paths = _iter_paths(args.path)
    paths = [p for p in paths if p.endswith(".ndjson") and os.path.isfile(p)]
    if not paths:
        print(f"No NDJSON files found for: {args.path}", file=sys.stderr)
        return 1

    print(f"Target Convex URL: {convex_url}")
    grand_total = 0

    for p in paths:
        print(f"Importing {p} ...")
        imported = import_file(convex_url, p, args.batch)
        grand_total += imported
        print(f"Upserted {imported} jobs from {os.path.basename(p)}")
        if args.delete:
            os.remove(p)
            print(f"Deleted {p}")

    print(f"Done. Upserted {grand_total} jobs total.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

