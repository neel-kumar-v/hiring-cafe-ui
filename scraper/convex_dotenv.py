"""
Load Convex deployment settings from repo-root env files (hosted or local).

Uses python-dotenv: `.env` first, then `.env.local` (overrides), matching Next.js.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def load_convex_environment() -> None:
    """
    Populate os.environ from `.env` then `.env.local` at the repo root.
    Does not override variables already set in the process environment.
    """
    try:
        from dotenv import load_dotenv
    except ImportError as e:  # pragma: no cover - exercised at runtime
        raise ImportError(
            "python-dotenv is required. Install scraper deps: pip install -r scraper/requirements.txt"
        ) from e

    root = repo_root()
    load_dotenv(root / ".env", override=False)
    load_dotenv(root / ".env.local", override=True)


def get_convex_deployment_url() -> Optional[str]:
    """
    Convex HTTP deployment URL (no trailing slash required).

    Resolution order:
    1. NEXT_PUBLIC_CONVEX_URL — Next.js / browser client URL (typical for hosted).
    2. CONVEX_URL — server-side or scraper-only `.env` without NEXT_PUBLIC_ prefix.
    3. VITE_CONVEX_URL — if a Vite env file is reused.
    """
    raw = (
        os.environ.get("NEXT_PUBLIC_CONVEX_URL")
        or os.environ.get("CONVEX_URL")
        or os.environ.get("VITE_CONVEX_URL")
    )
    if not isinstance(raw, str):
        return None
    url = raw.strip().strip('"').strip("'")
    return url or None


MISSING_CONVEX_URL_MESSAGE = (
    "Missing Convex deployment URL. Set NEXT_PUBLIC_CONVEX_URL or CONVEX_URL in .env or .env.local "
    "(hosted example: https://<deployment>.convex.cloud from the Convex dashboard)."
)
