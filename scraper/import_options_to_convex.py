#!/usr/bin/env python3
import json
import os
import sys
import glob

import requests

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "src", "data")
ENV_PATH = os.path.join(REPO_ROOT, ".env.local")

BATCH_SIZE = 500

def _load_env_local(path: str):
    env = {}
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

def _convex_mutation_url(convex_url: str) -> str:
    convex_url = convex_url.rstrip("/")
    return f"{convex_url}/api/mutation"

def _post_mutation(convex_url: str, fn: str, args: dict, timeout_s: int = 60) -> None:
    url = _convex_mutation_url(convex_url)
    payload = json.dumps(
        {"path": fn, "args": args, "format": "json"},
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

def main() -> int:
    env = _load_env_local(ENV_PATH)
    convex_url = os.environ.get("NEXT_PUBLIC_CONVEX_URL") or env.get("NEXT_PUBLIC_CONVEX_URL")
    if not convex_url:
        print("Missing NEXT_PUBLIC_CONVEX_URL. Run `npx convex dev --local --once` first.", file=sys.stderr)
        return 1

    json_files = glob.glob(os.path.join(DATA_DIR, "*.json"))
    json_files = [f for f in json_files if "jobs_data.json" not in os.path.basename(f)]
    
    for json_file in json_files:
        basename = os.path.basename(json_file)
        type_name = basename.replace(".json", "")
        print(f"Importing {type_name} from {basename}...")

        try:
            with open(json_file, "r", encoding="utf-8") as f:
                content = f.read()
                # If json is truncated, find the last valid string quote and close it
                try:
                    data = json.loads(content)
                except json.JSONDecodeError:
                    last_quote = content.rfind('"')
                    if last_quote != -1:
                        content = content[:last_quote+1] + '\n    ]\n}'
                        data = json.loads(content)
                    else:
                        raise
        except Exception as e:
            print(f"  Skipping {basename} due to error: {e}")
            continue
            
        suggestions = data.get("suggestions", [])
        if not suggestions:
            continue
            
        print(f"  Found {len(suggestions)} items.")
        
        # Batch insert
        for i in range(0, len(suggestions), BATCH_SIZE):
            batch = suggestions[i:i + BATCH_SIZE]
            _post_mutation(convex_url, "searchOptions:insertOptionsBatch", {
                "type": type_name,
                "values": batch
            })
            print(f"  Upserted {len(batch)} items...")

    print("Done handling data files.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
