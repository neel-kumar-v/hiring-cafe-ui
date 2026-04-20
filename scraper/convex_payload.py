"""Shared helpers for Convex HTTP mutation payloads."""

from __future__ import annotations

from typing import Any


def strip_json_nones(obj: Any) -> Any:
    """
    Convex `v.optional(v.string())` (and similar) means the key may be omitted — it does **not**
    accept JSON `null`. Python `None` becomes `null` in JSON, so strip recursively before POST.
    """
    if isinstance(obj, dict):
        return {k: strip_json_nones(v) for k, v in obj.items() if v is not None}
    if isinstance(obj, list):
        return [strip_json_nones(v) for v in obj if v is not None]
    return obj
