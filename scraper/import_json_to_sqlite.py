#!/usr/bin/env python3
"""
Stream src/data/jobs_data.json into src/data/jobs.db without loading the full JSON into memory.
Avoids V8/Node "Invalid string length" on multi‑GB exports.

Requires: pip install ijson
From repo root: python scraper/import_json_to_sqlite.py
"""

from __future__ import annotations

import json
import os
import sqlite3
import sys
import uuid
from datetime import date, datetime
from decimal import Decimal

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JSON_PATH = os.path.join(REPO_ROOT, "src", "data", "jobs_data.json")
DB_PATH = os.path.join(REPO_ROOT, "src", "data", "jobs.db")
BATCH_SIZE = 500


class JobJSONEncoder(json.JSONEncoder):
    """ijson may emit Decimal (and occasionally other non-JSON types); normalize for dumps."""

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


def _dumps_job(job: dict) -> str:
    return json.dumps(
        job,
        cls=JobJSONEncoder,
        separators=(",", ":"),
        ensure_ascii=False,
    )


def _company_name(job: dict) -> str:
    c = job.get("v5_processed_company_data") or {}
    j = job.get("v5_processed_job_data") or {}
    return (c.get("name") or j.get("company_name") or "") or ""


def _job_title(job: dict) -> str:
    v5 = job.get("v5_processed_job_data") or {}
    ji = job.get("job_information") or {}
    return (v5.get("core_job_title") or ji.get("title") or "") or ""


def _job_id(job: dict, fallback: int) -> str:
    jid = job.get("id") or job.get("objectID")
    if isinstance(jid, str) and jid:
        return jid
    return f"__synthetic_{fallback}"


def main() -> int:
    try:
        import ijson  # type: ignore[import-untyped]
    except ImportError:
        print("Missing dependency: pip install ijson", file=sys.stderr)
        return 1

    if not os.path.isfile(JSON_PATH):
        print(f"File not found: {JSON_PATH}", file=sys.stderr)
        return 1

    if os.path.isfile(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    try:
        conn.execute(
            """
            CREATE TABLE jobs (
                id TEXT NOT NULL UNIQUE,
                data TEXT NOT NULL,
                company_name TEXT,
                job_title TEXT
            )
            """
        )

        batch: list[tuple[str, str, str, str]] = []
        total = 0
        fallback_i = 0

        with open(JSON_PATH, "rb") as f:
            for job in ijson.items(f, "jobs.item"):
                if not isinstance(job, dict):
                    continue
                fallback_i += 1
                jid = _job_id(job, fallback_i)
                row = (
                    jid,
                    _dumps_job(job),
                    _company_name(job),
                    _job_title(job),
                )
                batch.append(row)
                if len(batch) >= BATCH_SIZE:
                    conn.executemany(
                        "INSERT OR REPLACE INTO jobs (id, data, company_name, job_title) VALUES (?,?,?,?)",
                        batch,
                    )
                    conn.commit()
                    total += len(batch)
                    print(f"Inserted {total} jobs...")
                    batch.clear()

        if batch:
            conn.executemany(
                "INSERT OR REPLACE INTO jobs (id, data, company_name, job_title) VALUES (?,?,?,?)",
                batch,
            )
            conn.commit()
            total += len(batch)

        conn.execute("CREATE INDEX idx_jobs_job_title ON jobs(job_title)")
        conn.execute("CREATE INDEX idx_jobs_company ON jobs(company_name)")
        conn.commit()

        print(f"Done. {total} jobs in {DB_PATH}")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
