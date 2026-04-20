#!/usr/bin/env python3
"""
Scrape HiringCafe -> (NDJSON backup + checkpoint) -> Convex ingestion.

Design goals:
- Keep a durable on-disk backup while scraping (NDJSON append per page).
- Two-phase commit per page: only advance checkpoint after Convex ingest succeeds.
- Resume without restarting the whole scrape if Convex fails.

Requires:
  pip install requests

Notes:
- This script intentionally uses the existing Selenium session helpers from `scraper/scraper.py`
  (Cloudflare challenges, browser session reuse, API fetching).
"""

from __future__ import annotations

import hashlib
import json
import os
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List, Optional, Tuple

import requests

from convex_payload import strip_json_nones
from scraper import SEARCH_STATE, _jobs_request_envelope_from_config, fetch_page_in_browser, start_browser_session

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(REPO_ROOT, "src", "data")
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


def _search_state_hash(state: dict) -> str:
    raw = json.dumps(state, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def _now_stamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")


def _normalize_domain(homepage_uri: Optional[str]) -> Optional[str]:
    if not homepage_uri or not isinstance(homepage_uri, str):
        return None
    s = homepage_uri.strip().lower()
    if not s:
        return None
    # Common inputs: "rogersandhollands.com", "https://example.com/path"
    s = s.replace("http://", "").replace("https://", "")
    s = s.split("/")[0]
    if s.startswith("www."):
        s = s[4:]
    # Very light validation
    if "." not in s:
        return None
    return s


def _slugify(text: str) -> str:
    s = (text or "").strip().lower()
    out = []
    prev_dash = False
    for ch in s:
        if ch.isalnum():
            out.append(ch)
            prev_dash = False
        else:
            if not prev_dash:
                out.append("-")
                prev_dash = True
    slug = "".join(out).strip("-")
    return slug or "unknown"


def _job_external_id(job: dict, fallback: int) -> str:
    jid = job.get("id") or job.get("objectID")
    if isinstance(jid, str) and jid:
        return jid
    return f"__synthetic_{fallback}"


def _get(obj: dict, *path: str) -> Any:
    cur: Any = obj
    for key in path:
        if not isinstance(cur, dict):
            return None
        cur = cur.get(key)
    return cur


def _as_list_str(x: Any) -> List[str]:
    if not isinstance(x, list):
        return []
    out: List[str] = []
    for v in x:
        if isinstance(v, str) and v:
            out.append(v)
    return out


def _as_bool(x: Any) -> Optional[bool]:
    return x if isinstance(x, bool) else None


def _as_num(x: Any) -> Optional[float]:
    return float(x) if isinstance(x, (int, float)) else None


def _merged_dict(preferred: Optional[dict], secondary: Optional[dict]) -> dict:
    """Prefer keys from `preferred` when both API shapes exist (matches TS `normalizeJob`)."""
    p = dict(preferred) if isinstance(preferred, dict) else {}
    s = dict(secondary) if isinstance(secondary, dict) else {}
    if not p:
        return s
    if not s:
        return p
    return {**s, **p}


def _job_processed(raw: dict) -> dict:
    return _merged_dict(
        raw.get("processed_job_data") if isinstance(raw.get("processed_job_data"), dict) else None,
        raw.get("v5_processed_job_data") if isinstance(raw.get("v5_processed_job_data"), dict) else None,
    )


def _company_enriched(raw: dict) -> dict:
    return _merged_dict(
        raw.get("enriched_company_data") if isinstance(raw.get("enriched_company_data"), dict) else None,
        raw.get("v5_processed_company_data") if isinstance(raw.get("v5_processed_company_data"), dict) else None,
    )


def _as_workplace_type(x: Any) -> Optional[str]:
    if isinstance(x, str):
        s = x.strip()
        return s or None
    if isinstance(x, dict):
        t = x.get("text")
        if isinstance(t, str) and t.strip():
            return t.strip()
    return None


def _as_text_object_list(x: Any) -> List[str]:
    """Commitment / similar fields may be string[] or { text: string }[]."""
    if not isinstance(x, list):
        return []
    out: List[str] = []
    for v in x:
        if isinstance(v, str) and v.strip():
            out.append(v.strip())
        elif isinstance(v, dict):
            t = v.get("text")
            if isinstance(t, str) and t.strip():
                out.append(t.strip())
    return out


def _as_skill_list(x: Any) -> List[str]:
    if not isinstance(x, list):
        return []
    out: List[str] = []
    for v in x:
        if isinstance(v, str) and v.strip():
            out.append(v.strip())
        elif isinstance(v, dict):
            t = v.get("name") or v.get("text") or v.get("skill")
            if isinstance(t, str) and t.strip():
                out.append(t.strip())
    return out


def _workplace_cities_from_processed(processed: dict) -> List[str]:
    cities = _as_list_str(processed.get("workplace_cities"))
    if cities:
        return cities
    fmt = processed.get("formatted_workplace_location")
    if isinstance(fmt, str) and fmt.strip():
        return [fmt.strip()]
    return []


def _company_from_job(raw: dict) -> Tuple[dict, dict]:
    enriched = _company_enriched(raw)
    processed = _job_processed(raw)

    homepage_uri = enriched.get("homepage_uri") if isinstance(enriched.get("homepage_uri"), str) else None
    canonical_domain = _normalize_domain(homepage_uri)
    name = (
        enriched.get("name")
        or processed.get("company_name")
        or _get(raw, "job_information", "company")
        or ""
    )
    if not isinstance(name, str):
        name = ""

    company_id = canonical_domain if canonical_domain else _slugify(name)

    industries = _as_list_str(enriched.get("industries")) or (
        [processed.get("company_sector_and_industry")] if isinstance(processed.get("company_sector_and_industry"), str) and processed.get("company_sector_and_industry") else []
    )
    activities = _as_list_str(enriched.get("activities")) or _as_list_str(processed.get("company_activities"))

    desc = enriched.get("description") if isinstance(enriched.get("description"), str) else None

    company = {
        "companyId": company_id,
        "canonicalDomain": canonical_domain,
        "name": name,
        "homepageUri": homepage_uri or (processed.get("company_website") if isinstance(processed.get("company_website"), str) else None),
        "imageUrl": None,
        "tagline": enriched.get("tagline") if isinstance(enriched.get("tagline"), str) else (processed.get("company_tagline") if isinstance(processed.get("company_tagline"), str) else None),
        "description": desc,
        "yearFounded": enriched.get("year_founded") if isinstance(enriched.get("year_founded"), int) else None,
        "numEmployees": enriched.get("nb_employees") if isinstance(enriched.get("nb_employees"), int) else None,
        "hqCountry": enriched.get("hq_country") if isinstance(enriched.get("hq_country"), str) else None,
        "industries": industries,
        "activities": activities,
    }

    # Denormalized fields for job search
    profit = None
    org = enriched.get("organization_type")
    if isinstance(org, str) and org:
        lo = org.lower()
        if "nonprofit" in lo or "non-profit" in lo:
            profit = "Non-Profit"
        elif "private" in lo or "public" in lo:
            profit = "For-Profit"
    stage = None
    if isinstance(org, str) and org:
        lo = org.lower()
        if lo == "public":
            stage = "Public"
        elif lo == "private":
            stage = "Private"

    company_filter_fields = {
        "companyProfit": profit,
        "companyStage": stage,
        "companyFoundedYear": company["yearFounded"],
        "companyNumEmployees": company["numEmployees"],
        "companyIndustries": industries,
        "companyActivities": activities,
    }

    return company, company_filter_fields


def _build_ingest_item(raw: dict, fallback_i: int) -> dict:
    processed = _job_processed(raw)
    ji = raw.get("job_information") if isinstance(raw.get("job_information"), dict) else {}

    external_id = _job_external_id(raw, fallback_i)
    title = processed.get("core_job_title") if isinstance(processed.get("core_job_title"), str) else None
    if not title:
        title = ji.get("title") if isinstance(ji.get("title"), str) else ""

    apply_url = raw.get("apply_url") if isinstance(raw.get("apply_url"), str) else None
    description = ji.get("description") if isinstance(ji.get("description"), str) else ""

    company, company_filter_fields = _company_from_job(raw)

    geoloc = raw.get("_geoloc")
    geoloc_out: List[dict] = []
    if isinstance(geoloc, list):
        for g in geoloc:
            if isinstance(g, dict) and isinstance(g.get("lat"), (int, float)) and isinstance(g.get("lon"), (int, float)):
                geoloc_out.append({"lat": float(g["lat"]), "lon": float(g["lon"])})

    skills = _as_skill_list(processed.get("technical_tools"))
    requirements_summary = processed.get("requirements_summary") if isinstance(processed.get("requirements_summary"), str) else None

    # Stats: use array lengths if present
    viewed = _get(raw, "job_information", "viewedByUsers")
    saved = _get(raw, "job_information", "savedFromUsers")
    applied = _get(raw, "job_information", "appliedFromUsers")
    views = len(viewed) if isinstance(viewed, list) else 0
    saves = len(saved) if isinstance(saved, list) else 0
    applies = len(applied) if isinstance(applied, list) else 0

    # Search text: keep cheap but useful
    parts = [
        title,
        company.get("name") or "",
        requirements_summary or "",
        " ".join(skills),
        " ".join(_workplace_cities_from_processed(processed)),
    ]
    search_text = "\n".join([p for p in parts if isinstance(p, str) and p]).lower()

    item = {
        "externalId": external_id,
        "applyUrl": apply_url,
        "title": title,
        "description": description,
        "roleActivities": _as_list_str(processed.get("role_activities")),
        "searchText": search_text,
        "company": company,

        "workplaceType": _as_workplace_type(processed.get("workplace_type")),
        "commitment": _as_text_object_list(processed.get("commitment")),
        "workplaceCities": _workplace_cities_from_processed(processed),
        "workplaceStates": _as_list_str(processed.get("workplace_states")),
        "workplaceCountries": _as_list_str(processed.get("workplace_countries")),
        "workplaceContinents": _as_list_str(processed.get("workplace_continents")),
        "geoloc": geoloc_out,

        "minIcYoe": processed.get("min_industry_and_role_yoe"),
        "minMgmtYoe": processed.get("min_management_and_leadership_yoe"),
        "requirementsSummary": requirements_summary,
        "skills": skills,
        "estimatedPublishDate": processed.get("estimated_publish_date"),
        "estimatedPublishDateMillis": processed.get("estimated_publish_date_millis"),

        "views": views,
        "saves": saves,
        "applies": applies,

        "department": processed.get("job_category"),

        "listedCompensationCurrency": processed.get("listed_compensation_currency"),
        "listedCompensationFrequency": processed.get("listed_compensation_frequency"),
        "isCompensationTransparent": _as_bool(processed.get("is_compensation_transparent")),
        "hourlyMinComp": _as_num(processed.get("hourly_min_compensation")),
        "hourlyMaxComp": _as_num(processed.get("hourly_max_compensation")),
        "dailyMinComp": _as_num(processed.get("daily_min_compensation")),
        "dailyMaxComp": _as_num(processed.get("daily_max_compensation")),
        "weeklyMinComp": _as_num(processed.get("weekly_min_compensation")),
        "weeklyMaxComp": _as_num(processed.get("weekly_max_compensation")),
        "biWeeklyMinComp": _as_num(processed.get("bi-weekly_min_compensation")),
        "biWeeklyMaxComp": _as_num(processed.get("bi-weekly_max_compensation")),
        "monthlyMinComp": _as_num(processed.get("monthly_min_compensation")),
        "monthlyMaxComp": _as_num(processed.get("monthly_max_compensation")),
        "yearlyMinComp": _as_num(processed.get("yearly_min_compensation")),
        "yearlyMaxComp": _as_num(processed.get("yearly_max_compensation")),

        "workplaceEnvironment": processed.get("workplace_physical_environment"),
        "workplaceMobility": processed.get("physical_position"),
        "physicalLaborIntensity": processed.get("physical_labor_intensity"),
        "cognitiveDemand": processed.get("cognitive_demand"),
        "computerUsage": processed.get("computer_usage"),
        "oralCommunicationLevel": processed.get("oral_communication_level"),

        "associatesDegreeRequirement": processed.get("associates_degree_requirement"),
        "associatesDegreeFieldsOfStudy": _as_list_str(processed.get("associates_degree_fields_of_study")),
        "bachelorsDegreeRequirement": processed.get("bachelors_degree_requirement"),
        "bachelorsDegreeFieldsOfStudy": _as_list_str(processed.get("bachelors_degree_fields_of_study")),
        "mastersDegreeRequirement": processed.get("masters_degree_requirement"),
        "mastersDegreeFieldsOfStudy": _as_list_str(processed.get("masters_degree_fields_of_study")),
        "doctorateDegreeRequirement": processed.get("doctorate_degree_requirement"),
        "doctorateDegreeFieldsOfStudy": _as_list_str(processed.get("doctorate_degree_fields_of_study")),

        "licensesOrCertifications": _as_list_str(processed.get("licenses_or_certifications")),
        "licensesOrCertificationsNotMentioned": _as_bool(processed.get("licenses_or_certifications_not_mentioned")),
        "securityClearance": processed.get("security_clearance"),
        "languageRequirements": _as_list_str(processed.get("language_requirements")),

        "morningShiftWork": processed.get("morning_shift_work"),
        "eveningShiftWork": processed.get("evening_shift_work"),
        "overnightWork": processed.get("overnight_work"),
        "weekendAvailabilityRequired": _as_bool(processed.get("weekend_availability_required")),
        "holidayAvailabilityRequired": _as_bool(processed.get("holiday_availability_required")),
        "overtimeRequired": _as_bool(processed.get("overtime_required")),
        "onCallRequirement": processed.get("on_call_requirement"),
        "airTravelRequirement": processed.get("air_travel_requirement"),
        "landTravelRequirement": processed.get("land_travel_requirement"),

        "generousPaidTimeOff": _as_bool(processed.get("generous_paid_time_off")),
        "fourDayWorkWeek": _as_bool(processed.get("four_day_work_week")),
        "matching401k": _as_bool(processed.get("401k_matching")),
        "generousParentalLeave": _as_bool(processed.get("generous_parental_leave")),
        "retirementPlan": _as_bool(processed.get("retirement_plan")),
        "tuitionReimbursement": _as_bool(processed.get("tuition_reimbursement")),
        "visaSponsorship": _as_bool(processed.get("visa_sponsorship")),
        "relocationAssistance": _as_bool(processed.get("relocation_assistance")),
        "militaryVeterans": _as_bool(processed.get("military_veterans")),
        "fairChance": _as_bool(processed.get("fair_chance")),

        **company_filter_fields,
    }

    # Coerce optional numeric yoE fields to numbers if present
    for k in ("minIcYoe", "minMgmtYoe"):
        v = item.get(k)
        if isinstance(v, (int, float)):
            item[k] = float(v)
        else:
            item[k] = None
    if item["minIcYoe"] is None:
        item.pop("minIcYoe")
    if item["minMgmtYoe"] is None:
        item.pop("minMgmtYoe")

    return strip_json_nones(item)


def _convex_mutation_url(convex_url: str) -> str:
    convex_url = convex_url.rstrip("/")
    return f"{convex_url}/api/mutation"


def _post_mutation(convex_url: str, fn: str, args: dict, timeout_s: int = 120) -> Any:
    args = strip_json_nones(args)
    payload = json.dumps({"path": fn, "args": args, "format": "json"}, ensure_ascii=False)
    r = requests.post(
        _convex_mutation_url(convex_url),
        data=payload.encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        timeout=timeout_s,
    )
    r.raise_for_status()
    data = r.json()
    if data.get("status") == "error":
        raise RuntimeError(data.get("errorMessage") or "Convex mutation error")
    return data.get("value")


@dataclass
class State:
    search_hash: str
    committed_page: int


def _load_state(path: str) -> Optional[State]:
    if not os.path.isfile(path):
        return None
    try:
        with open(path, "r", encoding="utf-8") as f:
            o = json.load(f)
        if not isinstance(o, dict):
            return None
        sh = o.get("search_hash")
        cp = o.get("committed_page")
        if isinstance(sh, str) and isinstance(cp, int):
            return State(search_hash=sh, committed_page=cp)
    except Exception:
        return None
    return None


def _save_state(path: str, st: State) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump({"search_hash": st.search_hash, "committed_page": st.committed_page}, f, indent=2)
        f.flush()
        os.fsync(f.fileno())
    os.replace(tmp, path)


def main() -> int:
    os.makedirs(DATA_DIR, exist_ok=True)

    env = _load_env_local(ENV_PATH)
    convex_url = os.environ.get("NEXT_PUBLIC_CONVEX_URL") or env.get("NEXT_PUBLIC_CONVEX_URL")
    if not convex_url:
        print("Missing NEXT_PUBLIC_CONVEX_URL. Run `npx convex dev --local --once` first.", file=sys.stderr)
        return 1

    run_id = _now_stamp()
    ndjson_path = os.path.join(DATA_DIR, f"jobs_data_{run_id}.ndjson")
    state_path = os.path.join(DATA_DIR, "scrape_state.json")
    shash = _search_state_hash(SEARCH_STATE)

    st = _load_state(state_path)
    if st and st.search_hash == shash:
        start_page = st.committed_page + 1
        print(f"Resuming from page {start_page} (checkpoint {state_path})")
    else:
        start_page = 0
        st = State(search_hash=shash, committed_page=-1)
        _save_state(state_path, st)
        print("Starting fresh scrape (new search hash or no checkpoint).")

    driver, intercepted_payload = start_browser_session()
    try:
        envelope = _jobs_request_envelope_from_config()
        if intercepted_payload:
            try:
                parsed = json.loads(intercepted_payload)
                if isinstance(parsed, dict) and parsed.get("size") is not None:
                    envelope["size"] = int(parsed["size"])
            except Exception:
                pass

        page = start_page
        total_pages = None
        fallback_i = 0

        with open(ndjson_path, "a", encoding="utf-8") as backup_f:
            print(f"Backup NDJSON: {ndjson_path}")
            print(f"Convex URL: {convex_url}")
            while True:
                response_data = fetch_page_in_browser(driver, page, envelope)
                if not response_data:
                    print(f"Failed to fetch page {page}; stopping.")
                    break

                jobs = None
                if isinstance(response_data, dict):
                    if isinstance(response_data.get("jobs"), list):
                        jobs = response_data["jobs"]
                    elif isinstance(response_data.get("results"), list):
                        jobs = response_data["results"]

                if not jobs:
                    print(f"No results on page {page}; stopping.")
                    break

                # Step A: append raw page results to NDJSON
                for raw in jobs:
                    if not isinstance(raw, dict):
                        continue
                    backup_f.write(json.dumps({"page": page, "job": raw}, ensure_ascii=False) + "\n")
                backup_f.flush()
                os.fsync(backup_f.fileno())

                # Step B: ingest page to Convex
                items: List[dict] = []
                for raw in jobs:
                    if not isinstance(raw, dict):
                        continue
                    fallback_i += 1
                    items.append(_build_ingest_item(raw, fallback_i))

                # Batch within the page (Convex mutation arg limits)
                BATCH = 100
                for i in range(0, len(items), BATCH):
                    chunk = items[i : i + BATCH]
                    _post_mutation(convex_url, "jobs:ingestBatch", {"items": chunk})

                # Commit checkpoint only after Convex succeeds
                st.committed_page = page
                _save_state(state_path, st)

                print(f"Committed page {page} ({len(items)} jobs).")

                if total_pages is None and isinstance(response_data, dict) and isinstance(response_data.get("pagination"), dict):
                    total_pages = response_data["pagination"].get("totalPages")
                    if isinstance(total_pages, int) and total_pages > 0:
                        print(f"Total pages reported: {total_pages}")

                if isinstance(total_pages, int) and page >= total_pages - 1:
                    print("Reached last page.")
                    break

                page += 1
                time.sleep(1.5)

        print("Done.")
        return 0
    finally:
        driver.quit()


if __name__ == "__main__":
    raise SystemExit(main())

