#!/usr/bin/env python3
"""
Stream src/data/jobs_data.json into Convex without loading the full JSON into memory.

Requires:
  - pip install ijson requests

Prerequisites:
  - Run `npx convex dev --local` in another terminal.
  - Ensure `.env.local` contains NEXT_PUBLIC_CONVEX_URL (created by `npx convex dev --local --once`).

From repo root:
  python scraper/import_json_to_convex.py
"""

from __future__ import annotations

import json
import os
import sys
import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any, Dict, List, Optional, Tuple

import requests

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(REPO_ROOT, "src", "data", "jobs_data.json")
ENV_PATH = os.path.join(REPO_ROOT, ".env.local")

BATCH_SIZE = 200


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
    """Normalize Decimal/datetime/uuid for JSON dumps."""

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


def _normalize_job_raw(job: dict) -> dict:
    """Store Convex `raw` with neutral keys; source JSON may still use legacy names."""
    out = dict(job)
    if "v5_processed_job_data" in out:
        legacy_j = out.pop("v5_processed_job_data")
        if "processed_job_data" not in out:
            out["processed_job_data"] = legacy_j
    if "v5_processed_company_data" in out:
        legacy_c = out.pop("v5_processed_company_data")
        if "processed_company_data" not in out:
            out["processed_company_data"] = legacy_c
    return out


def _job_id(job: dict, fallback: int) -> str:
    jid = job.get("id") or job.get("objectID")
    if isinstance(jid, str) and jid:
        return jid
    return f"__synthetic_{fallback}"


def _company_name(job: dict) -> str:
    c = job.get("v5_processed_company_data") or {}
    j = job.get("v5_processed_job_data") or {}
    return (c.get("name") or j.get("company_name") or "") or ""


def _job_title(job: dict) -> str:
    v5 = job.get("v5_processed_job_data") or {}
    ji = job.get("job_information") or {}
    return (v5.get("core_job_title") or ji.get("title") or "") or ""


def _workplace_type(job: dict) -> Optional[str]:
    v5 = job.get("v5_processed_job_data") or {}
    wt = v5.get("workplace_type")
    if isinstance(wt, dict):
        # Sometimes there is a { text: "Remote" } shape in v5 datasets.
        t = wt.get("text")
        if isinstance(t, str) and t:
            return t.lower()
    if isinstance(wt, str) and wt:
        return wt.lower()
    return None


def _search_text(job_title: str, company_name: str, raw: dict) -> str:
    parts = [job_title, company_name]
    ji = raw.get("job_information") or {}
    if isinstance(ji, dict):
        for k in ("title", "description", "location"):
            v = ji.get(k)
            if isinstance(v, str) and v:
                parts.append(v)
    return "\n".join(p for p in parts if p).lower()


def _convex_mutation_url(convex_url: str, fn: str) -> str:
    convex_url = convex_url.rstrip("/")
    # Convex HTTP API expects POST /api/mutation with {"path","args","format"}.
    # (The function identifier is in the JSON body, not the URL path.)
    return f"{convex_url}/api/mutation"


def _post_mutation(convex_url: str, fn: str, args: dict, timeout_s: int = 60) -> Any:
    url = _convex_mutation_url(convex_url, fn)
    # `requests.post(..., json=...)` uses Python's default JSON encoder, which
    # can't serialize Decimal/datetime/uuid that may appear in job payloads.
    payload = json.dumps(
        {"path": fn, "args": args, "format": "json"},
        cls=JobJSONEncoder,
        ensure_ascii=False,
    )
    r = requests.post(
        url,
        data=payload.encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        timeout=timeout_s,
    )
    r.raise_for_status()
    data = r.json()
    if "status" in data and data["status"] == "error":
        raise RuntimeError(data.get("errorMessage") or "Convex mutation error")
    return data.get("value")


def main() -> int:
    try:
        import ijson  # type: ignore[import-untyped]
    except ImportError:
        print("Missing dependency: pip install ijson", file=sys.stderr)
        return 1

    if not os.path.isfile(JSON_PATH):
        print(f"File not found: {JSON_PATH}", file=sys.stderr)
        return 1

    env = _load_env_local(ENV_PATH)
    convex_url = os.environ.get("NEXT_PUBLIC_CONVEX_URL") or env.get("NEXT_PUBLIC_CONVEX_URL")
    if not convex_url:
        print("Missing NEXT_PUBLIC_CONVEX_URL. Run `npx convex dev --local --once` first.", file=sys.stderr)
        return 1

    total = 0
    fallback_i = 0
    batch: List[Dict[str, Any]] = []

    print(f"Importing jobs from {JSON_PATH}")
    print(f"Target Convex URL: {convex_url}")

    with open(JSON_PATH, "rb") as f:
        for job in ijson.items(f, "jobs.item"):
            if not isinstance(job, dict):
                continue
            fallback_i += 1
            external_id = _job_id(job, fallback_i)
            company = _company_name(job)
            title = _job_title(job)
            wt = _workplace_type(job)
            search_text = _search_text(title, company, job)

            batch.append(
                {
                    "externalId": external_id,
                    "jobTitle": title,
                    "companyName": company,
                    "workplaceType": wt,
                    "searchText": search_text,
                    "raw": _normalize_job_raw(job),
                }
            )

            if len(batch) >= BATCH_SIZE:
                _post_mutation(convex_url, "jobs:upsertBatch", {"jobs": batch})
                total += len(batch)
                print(f"Upserted {total} jobs...")
                batch.clear()

    if batch:
        _post_mutation(convex_url, "jobs:upsertBatch", {"jobs": batch})
        total += len(batch)

    print(f"Done. Upserted {total} jobs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

