"""Small, rate-conscious adapter for Convex HTTP mutations.

The scraper and NDJSON replay tools deliberately send one bounded mutation per
batch. Keeping transport here prevents the two entry points from growing
different retry or batching behavior that could amplify Convex usage.
"""

from __future__ import annotations

import json
import time
from typing import Any

import requests

from convex_payload import strip_json_nones

MAX_INGEST_BATCH_ITEMS = 100


def mutation_url(convex_url: str) -> str:
    return f"{convex_url.rstrip('/')}/api/mutation"


def post_mutation(
    convex_url: str,
    function_name: str,
    args: dict[str, Any],
    timeout_s: int = 120,
    retry_transient: bool = False,
) -> Any:
    """Send one bounded mutation request.

    Retries are limited to transport/startup failures. Convex application
    errors are returned immediately so a bad batch is never replayed.
    """
    normalized_args = strip_json_nones(args)
    if function_name in {"jobs:ingestBatch", "jobs.ingestBatch"}:
        items = normalized_args.get("items") if isinstance(normalized_args, dict) else None
        if isinstance(items, list) and len(items) > MAX_INGEST_BATCH_ITEMS:
            raise ValueError(f"Convex ingest batches are capped at {MAX_INGEST_BATCH_ITEMS} items")

    payload = json.dumps(
        {"path": function_name, "args": normalized_args, "format": "json"},
        ensure_ascii=False,
    )
    attempts = range(1, 9) if retry_transient else range(1, 2)
    last_error: Exception | None = None
    for attempt in attempts:
        try:
            response = requests.post(
                mutation_url(convex_url),
                data=payload.encode("utf-8"),
                headers={"Content-Type": "application/json; charset=utf-8"},
                timeout=timeout_s,
            )
            if response.status_code == 503:
                raise requests.exceptions.HTTPError("503 Service Unavailable", response=response)
            response.raise_for_status()
            data = response.json()
            if data.get("status") == "error":
                raise RuntimeError(data.get("errorMessage") or "Convex mutation error")
            return data.get("value")
        except (requests.exceptions.ConnectionError, requests.exceptions.Timeout, requests.exceptions.HTTPError) as error:
            last_error = error
            if attempt == 8 or not retry_transient:
                raise
            time.sleep(min(10.0, 0.75 * (2 ** (attempt - 1))))
    raise last_error if last_error is not None else RuntimeError("Failed to call Convex mutation")
