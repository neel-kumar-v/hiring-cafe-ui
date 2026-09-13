import copy
import json
import os
import re
import sys
import time
import urllib.parse
from typing import Any

from selenium import webdriver
from selenium.common.exceptions import WebDriverException
from selenium.webdriver import ActionChains
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

# Exact search URL requested by user (do not mutate).
HIRING_CAFE_SESSION_URL = "https://hiring.cafe/?searchState=%7B%22locations%22%3A%5B%7B%22formatted_address%22%3A%22United+States%22%2C%22types%22%3A%5B%22country%22%5D%2C%22geometry%22%3A%7B%22location%22%3A%7B%22lat%22%3A%2240.1047%22%2C%22lon%22%3A%22-88.2062%22%7D%7D%2C%22id%22%3A%22user_country%22%2C%22address_components%22%3A%5B%7B%22long_name%22%3A%22United+States%22%2C%22short_name%22%3A%22US%22%2C%22types%22%3A%5B%22country%22%5D%7D%5D%2C%22options%22%3A%7B%22flexible_regions%22%3A%5B%22anywhere_in_continent%22%2C%22anywhere_in_world%22%5D%7D%7D%5D%2C%22sortBy%22%3A%22date%22%2C%22jobTitleQuery%22%3A%22%28%5C%22software%5C%22+OR+%5C%22application%5C%22+OR+%5C%22frontend%5C%22+OR+%5C%22backend%5C%22+OR+%5C%22full+stack%5C%22+OR+%5C%22full-stack%5C%22+OR+%5C%22fullstack%5C%22+OR+%5C%22android%5C%22+OR+%5C%22ios%5C%22+OR+%5C%22ai%5C%22%29+AND+%28%5C%22developer%5C%22+OR+%5C%22engineer%5C%22+OR+%5C%22development%5C%22+OR+%5C%22developer+intern%5C%22+OR+%5C%22engineer+intern%5C%22+OR+%5C%22development+intern%5C%22%29+AND+NOT+%28%5C%22thermal%5C%22%29%22%2C%22roleTypes%22%3A%5B%22Individual+Contributor%22%5D%2C%22roleYoeRange%22%3A%5B0%2C2%5D%7D"

HIRING_CAFE_ORIGIN = "https://hiring.cafe/"
SEARCH_JOBS_PATH = "/api/search-jobs"
_DEFAULT_SEARCH_STATE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "default_search_state.json"
)


def _search_state_from_url(url: str) -> dict:
    parsed = urllib.parse.urlparse(url)
    qs = urllib.parse.parse_qs(parsed.query)
    raw = qs.get("searchState", [None])[0]
    if not raw:
        raise ValueError("HIRING_CAFE_SESSION_URL must include ?searchState=...")
    return json.loads(raw)


SEARCH_STATE = _search_state_from_url(HIRING_CAFE_SESSION_URL)
SESSION_URL = HIRING_CAFE_SESSION_URL


def _merged_api_search_state():
    """Full searchState for the API: default template plus every key from SEARCH_STATE."""
    with open(_DEFAULT_SEARCH_STATE_PATH, encoding="utf-8") as f:
        base = json.load(f)
    for key, value in SEARCH_STATE.items():
        base[key] = copy.deepcopy(value)
    return base


def _default_jobs_request_envelope():
    return {
        "size": 250,
        "page": 0,
        "searchState": _merged_api_search_state(),
    }


def _jobs_request_envelope_from_config(size=None) -> dict:
    env = _default_jobs_request_envelope()
    if size is not None:
        env["size"] = int(size)
    return env


def _search_jobs_get_relative_url(page: int, size: int, search_state: dict) -> str:
    """Path + query only, for fetch() from the hiring.cafe tab (same origin)."""
    enc = urllib.parse.quote(
        json.dumps(search_state, separators=(",", ":")), safe=""
    )
    return f"{SEARCH_JOBS_PATH}?searchState={enc}&page={page}&size={size}"


def _intercept_payload_from_performance_logs(driver):
    """
    Parse Chrome performance logs for search-jobs calls.

    The site may use GET (?searchState=...&page=&size=) or POST (JSON body).
    Normalizes to a JSON envelope string: {\"size\", \"page\", \"searchState\"}.
    """
    logs = driver.get_log("performance")
    for log in logs:
        try:
            log_entry = json.loads(log["message"])["message"]
            if log_entry.get("method") != "Network.requestWillBeSent":
                continue
            params = log_entry.get("params") or {}
            request = params.get("request") or {}
            url = request.get("url") or ""
            if "api/search-jobs" not in url or "get-total-count" in url:
                continue
            method = (request.get("method") or "GET").upper()
            if method == "POST":
                post_data = request.get("postData")
                if post_data:
                    print("Successfully intercepted search-jobs POST body")
                    return post_data
            if method == "GET":
                parsed = urllib.parse.urlparse(url)
                qs = urllib.parse.parse_qs(parsed.query)
                if "searchState" not in qs or not qs["searchState"]:
                    continue
                state = json.loads(qs["searchState"][0])
                try:
                    size = int(qs["size"][0])
                except (KeyError, ValueError, IndexError):
                    size = 250
                envelope = {"size": size, "page": 0, "searchState": state}
                print("Successfully intercepted search-jobs GET (searchState from URL)")
                return json.dumps(envelope)
        except Exception:
            continue
    return None


def fetch_page_in_browser(driver, page, json_payload):
    """
    GET the search API from inside the browser (same-origin + Cloudflare cookies).

    Hiring.cafe responds with 405 to POST on /api/search-jobs; the UI uses GET
    with ``searchState``, ``page``, and ``size`` query parameters.
    """
    payload_with_page = dict(json_payload)
    if "size" not in payload_with_page:
        payload_with_page["size"] = 250
    if "searchState" not in payload_with_page:
        payload_with_page["searchState"] = _merged_api_search_state()
    base_size = int(payload_with_page["size"])
    search_state = payload_with_page["searchState"]

    size_candidates = [base_size]
    for s in (100, 50, 25):
        if base_size > s and s not in size_candidates:
            size_candidates.append(s)

    script = """
    const url = arguments[0];
    const cb = arguments[arguments.length - 1];
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': navigator.language || 'en-US,en;q=0.9',
            'Referer': window.location.href,
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
    })
    .then(function(r) {
        return r.text().then(function(t) {
            return { status: r.status, ok: r.ok, text: t };
        });
    })
    .then(function(res) {
        let data = null;
        try {
            data = JSON.parse(res.text);
        } catch (e) {
            data = {
                _parseError: true,
                _status: res.status,
                _snippet: res.text.substring(0, 500)
            };
        }
        cb({ status: res.status, ok: res.ok, data: data });
    })
    .catch(function(err) {
        cb({ status: 0, ok: false, error: String(err), data: null });
    });
    """

    for try_size in size_candidates:
        relative_url = _search_jobs_get_relative_url(page, try_size, search_state)
        if try_size != base_size:
            print(f"Fetching page {page} (fallback size={try_size})...")

        for attempt in range(1, 5):
            if attempt == 1 and try_size == base_size:
                print(f"Fetching page {page}...")
            elif attempt > 1:
                delay = min(12, 3 + attempt * 2)
                print(f"  Retry {attempt}/4 for page {page} after {delay}s...")
                time.sleep(delay)

            try:
                result = driver.execute_async_script(script, relative_url)
            except Exception as e:
                print(f"Exception on page {page}: {e}")
                return None

            if not result:
                print(f"Error on page {page}: empty result from browser")
                return None

            if result.get("error"):
                print(f"Error on page {page}: {result['error']}")
                return None

            status = result.get("status", 0)
            data = result.get("data")

            if data and isinstance(data, dict) and data.get("_parseError"):
                print(
                    f"Error on page {page}: non-JSON response (status {data.get('_status')}) "
                    f"snippet: {data.get('_snippet', '')[:200]!r}"
                )
                return None

            if status == 200 and data is not None:
                return data

            if attempt == 1:
                print(f"Error on page {page}: {status}")

            if status == 403:
                print("Access forbidden - likely blocked by security measures")
                if attempt < 4:
                    continue
                break
            if status == 401:
                if attempt == 1:
                    print(
                        "Unauthorized from hiring.cafe /api/search-jobs (not Convex). "
                        "Session or WAF may need more time, or the site now requires login."
                    )
                if attempt < 4:
                    continue
                break
            if status == 405:
                print(
                    "405 Method Not Allowed — if this persists, the API contract may have changed again."
                )
                return None
            if status == 429:
                print("Rate limited - waiting 60s before retry...")
                time.sleep(60)
                try:
                    result = driver.execute_async_script(script, relative_url)
                except Exception as e:
                    print(f"Retry exception on page {page}: {e}")
                    result = None
                if result and result.get("status") == 200 and result.get("data") is not None:
                    return result["data"]
                if attempt < 4:
                    continue
                break
            return None

    print(f"Error on page {page}: giving up after retries and smaller page sizes.")
    return None


_CHALLENGE_MARKERS = (
    "just a moment",
    "checking your browser",
    "cf-chl-",
    "challenges.cloudflare.com",
    "turnstile",
    "cf-browser-verification",
    "attention required",
    "one more step",
)


def _page_looks_like_challenge(driver) -> bool:
    try:
        url = driver.current_url.lower()
        src = driver.page_source.lower()
    except Exception:
        return True
    if "vercel.link" in url or "security-checkpoint" in url:
        return True
    return any(m in src for m in _CHALLENGE_MARKERS)


def _wait_for_hiring_cafe_ready(driver, timeout_sec: int = 180) -> bool:
    def ready(d):
        try:
            u = d.current_url.lower()
            s = d.page_source.lower()
        except Exception:
            return False
        return "hiring.cafe" in u and "vercel.link" not in u and "security-checkpoint" not in u and not any(
            m in s for m in _CHALLENGE_MARKERS
        )

    print("Page loaded. Waiting for security checkpoint to resolve...", flush=True)
    noninteractive = os.environ.get("SCRAPE_NONINTERACTIVE", "").strip().lower() in (
        "1",
        "true",
        "yes",
    )
    if _page_looks_like_challenge(driver):
        print(
            "\nComplete any anti-bot challenge in the browser window, then continue.",
            flush=True,
        )
        if sys.stdin.isatty() and not noninteractive:
            input("Press Enter once the normal hiring.cafe page is visible...\n")
        else:
            print(
                f"Non-interactive mode: waiting up to {timeout_sec}s for auto-clearance...",
                flush=True,
            )

    try:
        WebDriverWait(driver, timeout_sec).until(ready)
        print("Security checkpoint cleared; hiring.cafe UI ready.", flush=True)
        return True
    except Exception:
        print("Timed out waiting for challenge clearance; proceeding anyway.", flush=True)
        return False


def build_chrome_driver():
    """Chrome with performance logging; paths match local Windows layout in repo."""
    options = Options()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--log-level=3")
    options.add_experimental_option("excludeSwitches", ["enable-automation", "enable-logging"])
    options.add_experimental_option("useAutomationExtension", False)

    chrome_path = r"C:\Drivers\Chrome\chrome-win64\chrome.exe"
    chromedriver_path = r"C:\Drivers\Chrome\chromedriver-win64\chromedriver.exe"

    if os.path.exists(chrome_path):
        options.binary_location = chrome_path
    else:
        print("Chrome browser not found at expected location.")
        sys.exit(1)

    try:
        service = ChromeService(executable_path=chromedriver_path, log_output=os.devnull)
        driver = webdriver.Chrome(service=service, options=options)
    except Exception as e:
        print(f"Failed to initialize Chrome driver: {e}")
        sys.exit(1)

    driver.execute_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    driver.set_window_size(1920, 1080)
    driver.set_page_load_timeout(120)
    return driver


def start_browser_session():
    """
    Open hiring.cafe, pass Cloudflare/interstitials (with optional human help),
    then try to capture the real search-jobs request from network logs.
    """
    driver = build_chrome_driver()
    print(f"Loading {SESSION_URL}")
    driver.get(SESSION_URL)
    _wait_for_hiring_cafe_ready(driver)
    print("Waiting for network requests to complete...")
    time.sleep(16)
    intercepted_payload = _intercept_payload_from_performance_logs(driver)
    return driver, intercepted_payload


def _txt(driver, selectors: list[str]) -> str:
    for sel in selectors:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            t = (el.text or "").strip()
            if t:
                return t
        except Exception:
            continue
    return ""


def _attr(driver, selectors: list[str], attr: str) -> str:
    for sel in selectors:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            v = (el.get_attribute(attr) or "").strip()
            if v:
                return v
        except Exception:
            continue
    return ""


def _resolve_apply_url_via_click(driver) -> str:
    """Fallback when apply URL is not directly present in attributes."""
    btn_candidates = [
        "button.bg-white.py-2",
        "button:has(span)",
        "button",
    ]
    target_btn = None
    for sel in btn_candidates:
        try:
            for b in driver.find_elements(By.CSS_SELECTOR, sel):
                txt = (b.text or "").strip().lower()
                if "apply" in txt:
                    target_btn = b
                    break
            if target_btn is not None:
                break
        except Exception:
            continue
    if target_btn is None:
        return ""

    original_handle = driver.current_window_handle
    original_url = driver.current_url
    before_handles = set(driver.window_handles)

    try:
        driver.execute_script("arguments[0].click();", target_btn)
    except Exception:
        return ""

    time.sleep(0.9)
    after_handles = set(driver.window_handles)
    new_handles = list(after_handles - before_handles)

    # Case 1: new tab opened
    if new_handles:
        new_handle = new_handles[0]
        try:
            driver.switch_to.window(new_handle)
            time.sleep(0.6)
            url = driver.current_url or ""
            driver.close()
            driver.switch_to.window(original_handle)
            return (url or "").strip()
        except Exception:
            try:
                if len(driver.window_handles) > 1:
                    driver.close()
            except Exception:
                pass
            try:
                driver.switch_to.window(original_handle)
            except Exception:
                pass
            return ""

    # Case 2: same tab navigated
    try:
        current_url = driver.current_url or ""
        if current_url and current_url != original_url:
            driver.back()
            time.sleep(0.7)
            return current_url.strip()
    except Exception:
        pass

    return ""


def _split_csv_or_semicolon(raw: str) -> list[str]:
    if not raw:
        return []
    parts = [p.strip() for p in re.split(r"[,;]", raw) if p.strip()]
    return parts


def _parse_stats(raw: str) -> tuple[int, int, int]:
    nums = [int(x) for x in re.findall(r"(\d+)", raw)]
    while len(nums) < 3:
        nums.append(0)
    return nums[0], nums[1], nums[2]


def _extract_company_info(driver) -> dict[str, Any]:
    out: dict[str, Any] = {
        "name": "",
        "homepage_uri": "",
        "tagline": "",
        "description": "",
        "year_founded": None,
        "hq_country": "",
        "industries": [],
        "activities": [],
        "organization_type": "",
        "fields": {},
    }

    try:
        tab = driver.find_element(By.CSS_SELECTOR, "button.ml-4.whitespace-nowrap")
        if "Company" not in (tab.text or ""):
            tabs = driver.find_elements(By.CSS_SELECTOR, "button")
            for t in tabs:
                if "Company Info" in (t.text or ""):
                    tab = t
                    break
        tab.click()
        time.sleep(0.5)
    except Exception:
        return out

    out["name"] = _txt(driver, ["div.flex.justify-center span.text-4xl", "div.flex.justify-center h2", "span.text-4xl"])
    out["homepage_uri"] = _attr(driver, ["div.flex.justify-center a:has(button)", "div.flex.justify-center a"], "href")
    out["tagline"] = _txt(driver, ["div.flex.justify-center div.flex.flex-col > div.flex.flex-col > div:nth-child(3)"])

    rows = driver.find_elements(By.CSS_SELECTOR, "div.flex.justify-center div.flex.flex-col div.grid, div.flex.justify-center table tr")
    fields: dict[str, Any] = {}
    for row in rows:
        txt = (row.text or "").strip()
        if not txt:
            continue
        lines = [ln.strip() for ln in txt.split("\n") if ln.strip()]
        if len(lines) >= 2:
            key = lines[0]
            val = " ".join(lines[1:])
            fields[key] = val
    out["fields"] = fields

    out["description"] = out["tagline"]
    yf = fields.get("Year Founded", "")
    if yf.isdigit():
        out["year_founded"] = int(yf)
    out["hq_country"] = fields.get("Headquarters Country", "")
    out["organization_type"] = fields.get("Organization Type", "")
    out["industries"] = _split_csv_or_semicolon(fields.get("Industries", ""))
    out["activities"] = _split_csv_or_semicolon(fields.get("Activities", ""))

    return out


def _extract_job_from_open_drawer(driver) -> dict[str, Any] | None:
    title = _txt(driver, ["h2.font-extrabold.text-3xl", "h2"])
    company_raw = _txt(driver, ["span.text-xl.font-semibold", "span.text-2xl.font-semibold"])
    company = company_raw.lstrip("@").strip()
    if not title or not company:
        return None

    posted = _txt(driver, ["span.text-xs.text-cyan-700", "span.text-cyan-700"])
    location_raw = _txt(driver, ["div.flex.space-x-2 span", "span.whitespace-pre-wrap"])
    locations = [x.strip() for x in location_raw.split(" or ") if x.strip()] if location_raw else []

    chip_line = _txt(driver, ["div.flex.flex-wrap"])
    chips = [x.strip() for x in chip_line.split("\n") if x.strip()]
    salary = chips[0] if chips else ""
    workplace_type = chips[1] if len(chips) > 1 else ""
    commitment = chips[2:] if len(chips) > 2 else []

    responsibilities_raw = _txt(driver, ["div.flex.flex-col:nth-of-type(5) span:nth-of-type(2)"])
    requirements_raw = _txt(driver, ["div.flex.flex-col:nth-of-type(6) span:nth-of-type(2)"])
    tools_raw = _txt(driver, ["div.flex.flex-col:nth-of-type(7) span:nth-of-type(2)"])

    stats_raw = _txt(driver, ["div.w-full.pt-2", "div.flex.items-center.gap-4"])
    views, saves, applies = _parse_stats(stats_raw)

    desc_html = ""
    for sel in ["article.prose.pt-4 div.max-w-sm.overflow-auto", "article.prose"]:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            desc_html = (el.get_attribute("innerHTML") or "").strip()
            if desc_html:
                break
        except Exception:
            continue

    apply_url = _attr(driver, ["a[href] > button.bg-white.py-2", "a[href]:has(button)", "a[href*='http']"], "href")
    if not apply_url:
        apply_url = _attr(driver, ["button.bg-white.py-2", "button"], "data-url")
    if not apply_url:
        apply_url = _resolve_apply_url_via_click(driver)

    website_url = _attr(driver, ["a[href]:has(button)", "a[href]"] , "href")

    company_info = _extract_company_info(driver)

    responsibilities = _split_csv_or_semicolon(responsibilities_raw)
    requirements = _split_csv_or_semicolon(requirements_raw)
    technical_tools = _split_csv_or_semicolon(tools_raw)

    job_information = {
        "title": title,
        "company": company,
        "location": location_raw,
        "description": desc_html,
        "published_text": posted,
        "viewedByUsers": [0] * max(views, 0),
        "savedFromUsers": [0] * max(saves, 0),
        "appliedFromUsers": [0] * max(applies, 0),
        "responsibilities": responsibilities,
        "requirements": requirements,
        "technical_tools": technical_tools,
    }

    processed = {
        "core_job_title": title,
        "company_name": company,
        "formatted_workplace_location": location_raw,
        "workplace_cities": locations,
        "workplace_type": workplace_type,
        "commitment": commitment,
        "requirements_summary": requirements_raw,
        "role_activities": responsibilities,
        "technical_tools": technical_tools,
        "estimated_publish_date": posted,
    }

    enriched_company = {
        "name": company_info.get("name") or company,
        "homepage_uri": company_info.get("homepage_uri") or website_url,
        "tagline": company_info.get("tagline") or "",
        "description": company_info.get("description") or "",
        "year_founded": company_info.get("year_founded"),
        "hq_country": company_info.get("hq_country") or "",
        "industries": company_info.get("industries") or [],
        "activities": company_info.get("activities") or [],
        "organization_type": company_info.get("organization_type") or "",
        "raw_fields": company_info.get("fields") or {},
    }

    fingerprint = f"{title}|{company}|{posted}|{apply_url}"
    job_id = str(abs(hash(fingerprint)))

    return {
        "id": job_id,
        "apply_url": apply_url,
        "job_information": job_information,
        "processed_job_data": processed,
        "enriched_company_data": enriched_company,
        "_meta": {
            "fingerprint": fingerprint,
            "stats_text": stats_raw,
            "salary": salary,
            "website_url": website_url,
        },
    }


def _close_drawer(driver):
    def drawer_open() -> bool:
        checks = [
            "div[role='dialog']",
            "button[aria-label='Close']",
            "button:has(svg.lucide-x)",
            "button:has(svg[data-lucide='x'])",
        ]
        for sel in checks:
            try:
                els = driver.find_elements(By.CSS_SELECTOR, sel)
                if any(el.is_displayed() for el in els):
                    return True
            except Exception:
                continue
        return False

    def wait_closed(timeout_s: float = 2.5) -> bool:
        end = time.time() + timeout_s
        while time.time() < end:
            if not drawer_open():
                return True
            time.sleep(0.08)
        return not drawer_open()

    # 1) Try explicit close buttons (top-right X, aria close, svg x parents)
    close_candidates = [
        "button[aria-label='Close']",
        "button:has(svg.lucide-x)",
        "button:has(svg[data-lucide='x'])",
    ]
    for sel in close_candidates:
        try:
            for el in driver.find_elements(By.CSS_SELECTOR, sel):
                if not el.is_displayed():
                    continue
                try:
                    ActionChains(driver).move_to_element(el).perform()
                except Exception:
                    pass
                driver.execute_script("arguments[0].click();", el)
                if wait_closed():
                    return
        except Exception:
            continue

    # 2) Esc fallback (often closes shadcn/dialog drawers)
    try:
        body = driver.find_element(By.TAG_NAME, "body")
        body.send_keys("\uE00C")
        if wait_closed():
            return
    except Exception:
        pass

    # 3) Click near top-right inside dialog as last resort
    try:
        dlg = driver.find_element(By.CSS_SELECTOR, "div[role='dialog']")
        driver.execute_script(
            "const r=arguments[0].getBoundingClientRect();"
            "const x=r.right-20,y=r.top+20;"
            "document.elementFromPoint(x,y)?.click();",
            dlg,
        )
        wait_closed()
    except Exception:
        pass


def _click_next_in_stack(driver) -> bool:
    # Avoid clicking "View all". Prefer nearby stack-header controls first.
    try:
        header_rows = driver.find_elements(By.CSS_SELECTOR, "div.flex.justify-between")
        for row in header_rows:
            try:
                ActionChains(driver).move_to_element(row).perform()
                time.sleep(0.1)
            except Exception:
                pass
            buttons = row.find_elements(By.CSS_SELECTOR, "button")
            for b in buttons:
                txt = (b.text or "").strip().lower()
                if "view all" in txt:
                    continue
                if txt in {">", "›", "→", "<", "‹", "←"}:
                    try:
                        driver.execute_script("arguments[0].click();", b)
                        time.sleep(0.4)
                        return True
                    except Exception:
                        continue
    except Exception:
        pass

    # Global fallback scan.
    buttons = driver.find_elements(By.CSS_SELECTOR, "button")
    for b in buttons:
        txt = (b.text or "").strip().lower()
        if "view all" in txt:
            continue
        if txt in {">", "›", "→", "<", "‹", "←"}:
            try:
                try:
                    ActionChains(driver).move_to_element(b).perform()
                    time.sleep(0.05)
                except Exception:
                    pass
                driver.execute_script("arguments[0].click();", b)
                time.sleep(0.4)
                return True
            except Exception:
                continue
    # Fallback: by aria-label.
    for b in buttons:
        label = (b.get_attribute("aria-label") or "").lower()
        if "next" in label:
            try:
                driver.execute_script("arguments[0].click();", b)
                time.sleep(0.4)
                return True
            except Exception:
                continue
    return False


def _stack_card_containers(driver):
    selectors = [
        "div.relative.bg-white:has(div.flex.justify-between):has(div.w-full.pt-2)",
        "div.relative:has(div.flex.justify-between):has(div.w-full.pt-2)",
    ]
    for sel in selectors:
        try:
            cards = driver.find_elements(By.CSS_SELECTOR, sel)
            if cards:
                return cards
        except Exception:
            continue
    return []


def _activate_stack_by_index(driver, idx: int) -> bool:
    cards = _stack_card_containers(driver)
    if idx < 0 or idx >= len(cards):
        return False
    try:
        card = cards[idx]
        time.sleep(0.05)
        try:
            ActionChains(driver).move_to_element(card).perform()
            time.sleep(0.2)
        except Exception:
            pass
        header = None
        try:
            header = card.find_element(By.CSS_SELECTOR, "div.flex.justify-between")
        except Exception:
            header = card
        driver.execute_script("arguments[0].click();", header)
        time.sleep(0.35)
        return True
    except Exception:
        return False


def _open_current_card(driver) -> bool:
    selectors = [
        "div.relative.bg-white:has(div.w-full.pt-2) h2.font-extrabold.text-3xl",
        "h2.font-extrabold.text-3xl",
    ]
    for sel in selectors:
        try:
            el = driver.find_element(By.CSS_SELECTOR, sel)
            try:
                ActionChains(driver).move_to_element(el).perform()
                time.sleep(0.1)
            except Exception:
                pass
            driver.execute_script("arguments[0].click();", el)
            time.sleep(0.7)
            return True
        except Exception:
            continue
    return False


def _visible_identity(driver) -> str:
    title = _txt(
        driver,
        [
            "div.relative.bg-white:has(div.w-full.pt-2) h2.font-extrabold.text-3xl",
            "h2.font-extrabold.text-3xl",
        ],
    )
    company = _txt(driver, ["span.text-xl.font-semibold", "span.text-2xl.font-semibold"]).lstrip("@").strip()
    posted = _txt(driver, ["span.text-xs.text-cyan-700", "span.text-cyan-700"])
    return f"{title}|{company}|{posted}"


def _scrape_stacks(driver) -> list[dict[str, Any]]:
    all_jobs: list[dict[str, Any]] = []
    seen_global: set[str] = set()

    # Crawl each visible stack card and iterate via next-arrow until loop.
    stack_cards = _stack_card_containers(driver)
    print(f"Found {len(stack_cards)} visible stack cards.")
    for stack_idx in range(len(stack_cards)):
        if not _activate_stack_by_index(driver, stack_idx):
            print(f"Skipping stack {stack_idx}: unable to activate.")
            continue

        max_steps = 200
        seen_stack: set[str] = set()
        stall_count = 0
        print(f"Traversing stack {stack_idx + 1}/{len(stack_cards)}...")

        for step in range(max_steps):
            ident = _visible_identity(driver)
            if not ident or ident == "||":
                stall_count += 1
                if stall_count >= 4:
                    print(f"Stopping stack {stack_idx}: identity unavailable repeatedly.")
                    break
            else:
                if ident in seen_stack:
                    print(f"Stack loop detected on stack {stack_idx}.")
                    break
                seen_stack.add(ident)

            # Prefer scraping already-open drawer content for this stack state.
            job = _extract_job_from_open_drawer(driver)
            if not job:
                if not _open_current_card(driver):
                    stall_count += 1
                    print(
                        f"Stack {stack_idx + 1} step {step + 1}: failed to open card "
                        f"(stall {stall_count})."
                    )
                    if stall_count >= 4:
                        print(f"Stopping stack {stack_idx}: unable to open card repeatedly.")
                        break
                    if not _click_next_in_stack(driver):
                        print(f"Stopping stack {stack_idx}: next-arrow unavailable after open failure.")
                        break
                    continue
                job = _extract_job_from_open_drawer(driver)
            _close_drawer(driver)

            if job:
                fp = job.get("_meta", {}).get("fingerprint", "")
                if fp and fp not in seen_global:
                    seen_global.add(fp)
                    all_jobs.append(job)
                    print(
                        f"[stack {stack_idx + 1} step {step + 1}] scraped: "
                        f"{job.get('job_information', {}).get('title', 'unknown')}"
                    )
            else:
                print(f"Stack {stack_idx + 1} step {step + 1}: no job parsed from drawer.")

            if not _click_next_in_stack(driver):
                print(f"Stopping stack {stack_idx}: next-arrow not found/clickable.")
                break
            time.sleep(0.35)

    return all_jobs


def main():
    raise SystemExit(
        "Legacy JSON dump entrypoint removed. Use scraper/scrape_to_convex.py "
        "(or `pnpm run import-jobs-convex`) to scrape into Convex."
    )


if __name__ == "__main__":
    main()
