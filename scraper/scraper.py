import copy
import json
import os
import sys
import time
import urllib.parse

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support.ui import WebDriverWait

# --- Configuration ---
# Mirrors hiring.cafe ?searchState=... (locations, sort, job title query).
SEARCH_STATE = {
    "locations": [
        {
            "formatted_address": "United States",
            "types": ["country"],
            "geometry": {
                "location": {
                    "lat": "40.1047",
                    "lon": "-88.2062",
                }
            },
            "id": "user_country",
            "address_components": [
                {
                    "long_name": "United States",
                    "short_name": "US",
                    "types": ["country"],
                }
            ],
            "options": {
                "flexible_regions": [
                    "anywhere_in_continent",
                    "anywhere_in_world",
                ]
            },
        }
    ],
    "sortBy": "date",
    "jobTitleQuery": (
        '("software" OR "application" OR "frontend" OR "backend" OR '
        '"full stack" OR "full-stack" OR "fullstack" OR "android" OR '
        '"ios" OR "ai") AND ("developer" OR "engineer" OR "development") '
        'AND "intern"'
    ),
}

ENCODED_SEARCH_STATE = urllib.parse.quote(
    json.dumps(SEARCH_STATE, separators=(",", ":")), safe=""
)
SESSION_URL = f"https://hiring.cafe/?searchState={ENCODED_SEARCH_STATE}"
# Live site uses GET with query params (POST returns 405 Method Not Allowed).
SEARCH_JOBS_URL = "https://hiring.cafe/api/search-jobs"
_DEFAULT_SEARCH_STATE_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "default_search_state.json"
)


def _merged_api_search_state():
    """Full searchState for the API: default template plus every key from SEARCH_STATE."""
    with open(_DEFAULT_SEARCH_STATE_PATH, encoding="utf-8") as f:
        base = json.load(f)
    for key, value in SEARCH_STATE.items():
        base[key] = copy.deepcopy(value)
    return base


def _jobs_request_envelope_from_config(size=None) -> dict:
    env = _default_jobs_request_envelope()
    if size is not None:
        env["size"] = int(size)
    return env


def _default_jobs_request_envelope():
    return {
        "size": 1000,
        "page": 0,
        "searchState": _merged_api_search_state(),
    }


def _search_jobs_get_url(page: int, size: int, search_state: dict) -> str:
    enc = urllib.parse.quote(
        json.dumps(search_state, separators=(",", ":")), safe=""
    )
    return f"{SEARCH_JOBS_URL}?searchState={enc}&page={page}&size={size}"


# Cloudflare / bot interstitial markers (page HTML or URL)
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
    """Wait until we are on hiring.cafe and the interstitial is gone."""

    def ready(d):
        try:
            u = d.current_url.lower()
        except Exception:
            return False
        if "hiring.cafe" not in u:
            return False
        if "vercel.link" in u or "security-checkpoint" in u:
            return False
        try:
            s = d.page_source.lower()
        except Exception:
            return False
        if any(m in s for m in _CHALLENGE_MARKERS):
            return False
        return True

    print("Page loaded. Waiting for security checkpoint to resolve...")
    if _page_looks_like_challenge(driver):
        print(
            "\nA Cloudflare or security challenge may be showing in the Chrome window.\n"
            "If you see a checkbox, captcha, or 'Verify you are human', complete it.\n"
            "Wait until the normal hiring.cafe search page is visible."
        )
        if sys.stdin.isatty():
            input("When the site is ready, press Enter here to continue...\n")
        else:
            print(
                "stdin is not a TTY (e.g. scheduled task); waiting up to "
                f"{timeout_sec}s for auto-resolution..."
            )

    try:
        WebDriverWait(driver, timeout_sec).until(ready)
        print("Security checkpoint cleared; hiring.cafe UI ready.")
        return True
    except Exception:
        print(
            "Timed out waiting for the page to leave the challenge state. "
            "Proceeding anyway; API calls may still fail."
        )
        return False


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
                    size = 1000
                envelope = {"size": size, "page": 0, "searchState": state}
                print("Successfully intercepted search-jobs GET (searchState from URL)")
                return json.dumps(envelope)
        except Exception:
            continue
    return None


def build_chrome_driver():
    """Chrome with performance logging; paths match local Windows layout in repo."""
    options = Options()
    options.set_capability("goog:loggingPrefs", {"performance": "ALL"})
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-plugins")
    options.add_argument("--disable-features=TranslateUI")

    chrome_path = r"C:\Drivers\Chrome\chrome-win64\chrome.exe"
    chromedriver_path = r"C:\Drivers\Chrome\chromedriver-win64\chromedriver.exe"

    if os.path.exists(chrome_path):
        options.binary_location = chrome_path
    else:
        print(
            "Chrome browser not found at expected location. Please check your installation."
        )
        sys.exit(1)

    try:
        service = ChromeService(executable_path=chromedriver_path)
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
    then try to capture the real search-jobs request from network logs (GET or POST).

    Returns:
        (driver, intercepted_envelope_json_str | None)
    """
    driver = build_chrome_driver()
    print(f"Loading {SESSION_URL}")
    driver.get(SESSION_URL)

    _wait_for_hiring_cafe_ready(driver)

    # Let the SPA fire search-jobs after the wall is gone
    print("Waiting for network requests to complete...")
    time.sleep(12)

    if "vercel.link" in driver.current_url or "security-checkpoint" in driver.current_url:
        try:
            WebDriverWait(driver, 90).until(
                lambda d: "hiring.cafe" in d.current_url
                and "vercel.link" not in d.current_url
            )
            time.sleep(8)
        except Exception:
            print("Vercel/security URL may still be active.")

    intercepted_payload = _intercept_payload_from_performance_logs(driver)
    return driver, intercepted_payload


def fetch_page_in_browser(driver, page, json_payload):
    """
    GET the search API from inside the browser (same-origin + Cloudflare cookies).

    Hiring.cafe responds with 405 to POST on /api/search-jobs; the UI uses GET
    with ``searchState``, ``page``, and ``size`` query parameters.
    """
    payload_with_page = dict(json_payload)
    if "size" not in payload_with_page:
        payload_with_page["size"] = 1000
    if "searchState" not in payload_with_page:
        payload_with_page["searchState"] = _merged_api_search_state()
    size = int(payload_with_page["size"])
    search_state = payload_with_page["searchState"]
    full_url = _search_jobs_get_url(page, size, search_state)

    print(f"Fetching page {page}...")

    script = """
    const url = arguments[0];
    const cb = arguments[arguments.length - 1];
    fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/json, text/plain, */*'
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

    try:
        result = driver.execute_async_script(script, full_url)
    except Exception as e:
        print(f"Exception on page {page}: {e}")
        return None

    if not result:
        print(f"Error on page {page}: empty result from browser")
        return None

    status = result.get("status", 0)
    data = result.get("data")

    if result.get("error"):
        print(f"Error on page {page}: {result['error']}")
        return None

    if data and isinstance(data, dict) and data.get("_parseError"):
        print(
            f"Error on page {page}: non-JSON response (status {data.get('_status')}) "
            f"snippet: {data.get('_snippet', '')[:200]!r}"
        )
        return None

    if status == 200 and data is not None:
        return data

    print(f"Error on page {page}: {status}")
    if status == 403:
        print("Access forbidden - likely blocked by security measures")
    elif status == 405:
        print(
            "405 Method Not Allowed — if this persists, the API contract may have changed again."
        )
    elif status == 429:
        print("Rate limited - waiting before retry...")
        time.sleep(60)
        try:
            result = driver.execute_async_script(script, full_url)
        except Exception as e:
            print(f"Retry exception on page {page}: {e}")
            return None
        if result and result.get("status") == 200 and result.get("data") is not None:
            return result["data"]

    return None


def main():
    driver, intercepted_payload = start_browser_session()

    try:
        # Intercepted requests often reflect the site's *first* API call (empty filters)
        # before URL searchState is applied — that returns effectively all jobs.
        # Always send SEARCH_STATE merged into the full API shape; optionally reuse
        # intercepted page size only.
        json_payload = _jobs_request_envelope_from_config()
        if intercepted_payload:
            try:
                parsed = json.loads(intercepted_payload)
                if isinstance(parsed, dict) and parsed.get("size") is not None:
                    try:
                        json_payload["size"] = int(parsed["size"])
                    except (TypeError, ValueError):
                        pass
                    print(
                        "Using configured SEARCH_STATE (job title, location, sort); "
                        f"page size {json_payload['size']} from browser intercept."
                    )
                else:
                    print(
                        "Using configured SEARCH_STATE only (intercept had no size)."
                    )
            except json.JSONDecodeError:
                print("Using configured SEARCH_STATE (intercepted payload was invalid JSON).")
        else:
            print(
                "Using configured SEARCH_STATE (no intercepted payload; default size)."
            )

        LOGS_DIR = "logs"
        os.makedirs(LOGS_DIR, exist_ok=True)

        OUTPUT_DIR = r"C:\Users\green\Documents\GitHub\hiring-cafe-ui\src\data"
        os.makedirs(OUTPUT_DIR, exist_ok=True)

        all_jobs = []
        page = 0
        total_pages = None
        jobs_per_page = None
        consecutive_failures = 0
        max_consecutive_failures = 3

        print("Starting paginated scraping...")

        while True:
            response_data = fetch_page_in_browser(driver, page, json_payload)

            if not response_data:
                consecutive_failures += 1
                print(
                    f"Failed to fetch page {page} (failure {consecutive_failures}/{max_consecutive_failures})"
                )

                if consecutive_failures >= max_consecutive_failures:
                    print(
                        f"Too many consecutive failures ({consecutive_failures}), stopping pagination"
                    )
                    break

                time.sleep(30)
                continue

            consecutive_failures = 0

            if "jobs" in response_data:
                jobs = response_data["jobs"]
                if not jobs:
                    print(f"No more jobs on page {page}, stopping pagination")
                    break

                all_jobs.extend(jobs)
                print(
                    f"Page {page}: Found {len(jobs)} jobs (Total so far: {len(all_jobs)})"
                )

                if total_pages is None and "pagination" in response_data:
                    pagination = response_data["pagination"]
                    total_pages = pagination.get("totalPages", None)
                    jobs_per_page = pagination.get("jobsPerPage", None)
                    if total_pages:
                        print(
                            f"Total pages: {total_pages}, Jobs per page: {jobs_per_page}"
                        )

                if total_pages is not None and page >= total_pages - 1:
                    print(f"Reached last page ({total_pages}), stopping pagination")
                    break
            elif "results" in response_data:
                results = response_data["results"]
                if not results:
                    print(f"No more results on page {page}, stopping pagination")
                    break

                all_jobs.extend(results)
                print(
                    f"Page {page}: Found {len(results)} results (Total so far: {len(all_jobs)})"
                )

                if total_pages is None and "pagination" in response_data:
                    pagination = response_data["pagination"]
                    total_pages = pagination.get("totalPages", None)
                    jobs_per_page = pagination.get("jobsPerPage", None)
                    if total_pages:
                        print(
                            f"Total pages: {total_pages}, Jobs per page: {jobs_per_page}"
                        )

                if total_pages is not None and page >= total_pages - 1:
                    print(f"Reached last page ({total_pages}), stopping pagination")
                    break

            else:
                print(f"No 'jobs' or 'results' key found in page {page} response")
                print(
                    f"Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}"
                )
                for key, value in response_data.items():
                    if isinstance(value, list) and len(value) > 0:
                        print(
                            f"Found potential job data in key '{key}' with {len(value)} items"
                        )
                        all_jobs.extend(value)
                        print(
                            f"Page {page}: Found {len(value)} items in '{key}' (Total so far: {len(all_jobs)})"
                        )
                        break
                else:
                    print("No array data found, stopping pagination")
                    break

            page += 1
            time.sleep(2)

        if all_jobs:
            comprehensive_result = {
                "metadata": {
                    "total_jobs": len(all_jobs),
                    "pages_fetched": page + 1,
                    "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                    "search_state": SEARCH_STATE,
                },
                "jobs": all_jobs,
            }

            filename = os.path.join(OUTPUT_DIR, "jobs_data.json")

            try:
                if os.path.exists(filename):
                    os.remove(filename)
                    print(f"Removed old {filename}")
            except Exception as e:
                print(f"Warning: Could not remove old file: {e}")

            try:
                with open(filename, "w", encoding="utf-8") as f:
                    json.dump(comprehensive_result, f, indent=2)
                print(f"\nComprehensive results saved to {filename}")
                print(f"Total jobs collected: {len(all_jobs)}")
                print(f"Pages processed: {page + 1}")
                print(
                    "\nNext step (large files): build local SQLite for the Next app —\n"
                    "  pip install ijson\n"
                    "  python scraper/import_json_to_sqlite.py\n"
                )

                if os.path.exists(filename):
                    file_size = os.path.getsize(filename)
                    print(f"File size: {file_size} bytes")
                else:
                    print("ERROR: File was not created!")

            except Exception as e:
                print(f"ERROR: Failed to write file: {e}")
                backup_filename = os.path.join(OUTPUT_DIR, "jobs_data_backup.json")
                try:
                    with open(backup_filename, "w", encoding="utf-8") as f:
                        json.dump(comprehensive_result, f, indent=2)
                    print(f"Saved backup to {backup_filename}")
                except Exception as backup_e:
                    print(f"ERROR: Failed to write backup file: {backup_e}")

            log_path = os.path.join(LOGS_DIR, "scraper.log")
            with open(log_path, "a", encoding="utf-8") as logf:
                logf.write(
                    f"Comprehensive scraping completed. Total jobs: {len(all_jobs)}, Pages: {page + 1}\n"
                )
                logf.write(f"Results saved to {filename}\n")
        else:
            print("No jobs were collected")
            log_path = os.path.join(LOGS_DIR, "scraper.log")
            with open(log_path, "a", encoding="utf-8") as logf:
                logf.write("No jobs were collected during scraping\n")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
