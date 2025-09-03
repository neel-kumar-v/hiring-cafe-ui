import json
import os
import time
import urllib.parse

import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuration ---
SEARCH_STATE = (
    '{"locations":[{"formatted_address":"United States",'
    '"types":["country"],'
    '"geometry":{"location":{"lat":"40.0146","lon":"-75.7136"}},'
    '"id":"user_country",'
    '"address_components":[{"long_name":"United States",'
    '"short_name":"US","types":["country"]}],'
    '"options":{"flexible_regions":["anywhere_in_continent","anywhere_in_world"]}}],'
    '"searchQuery":"software engineer intern",'
    '"roleYoeRange":[0,1],'
    '"roleTypes":["Individual Contributor"],'
    '"seniorityLevel":["No Prior Experience Required","Entry Level"],'
    '"sortBy":"date"}'
)
ENCODED_SEARCH_STATE = urllib.parse.quote(SEARCH_STATE, safe='')

SESSION_URL = f"https://hiring.cafe/?searchState={ENCODED_SEARCH_STATE}"
POST_URL = f"https://hiring.cafe/api/search-jobs?searchState={ENCODED_SEARCH_STATE}"

# More specific Chrome user agent
headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "Content-Type": "application/json",
    "Origin": "https://hiring.cafe",
    "Referer": "https://hiring.cafe/",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
}

def get_session_cookies():
    """Get session cookies using Selenium with better anti-detection"""
    options = Options()
    
    # Performance logging for network interception
    options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
    
    # Anti-detection options
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-blink-features=AutomationControlled')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-plugins')
    options.add_argument('--disable-images')
    options.add_argument('--disable-javascript-harmony-shipping')
    options.add_argument('--disable-background-timer-throttling')
    options.add_argument('--disable-backgrounding-occluded-windows')
    options.add_argument('--disable-renderer-backgrounding')
    options.add_argument('--disable-features=TranslateUI')
    options.add_argument('--disable-ipc-flooding-protection')
    
    # More realistic browser behavior
    options.add_argument('--disable-web-security')
    options.add_argument('--allow-running-insecure-content')
    options.add_argument('--disable-features=VizDisplayCompositor')
    
    # Use the manually specified Chrome binary and driver
    chrome_path = r"C:\Drivers\Chrome\chrome-win64\chrome.exe"
    chromedriver_path = r"C:\Drivers\Chrome\chromedriver-win64\chromedriver.exe"
    
    if os.path.exists(chrome_path):
        options.binary_location = chrome_path
    else:
        print("Chrome browser not found at expected location. Please check your installation.")
        exit(1)

    try:
        service = ChromeService(executable_path=chromedriver_path)
        driver = webdriver.Chrome(service=service, options=options)
    except Exception as e:
        print(f"Failed to initialize Chrome driver: {e}")
        exit(1)
    
    # Hide webdriver property
    driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
    
    # Set window size to be more realistic
    driver.set_window_size(1920, 1080)
    
    print(f"Loading {SESSION_URL}")
    driver.get(SESSION_URL)
    
    # Wait for page to load and handle security checkpoint
    print("Page loaded. Waiting for security checkpoint to resolve...")
    
    # Wait longer for the security checkpoint to resolve
    time.sleep(15)
    
    # Check if we're still on a security page
    current_url = driver.current_url
    if "vercel.link" in current_url or "security-checkpoint" in current_url:
        print("Detected security checkpoint, waiting longer...")
        time.sleep(30)
        
        # Try to wait for the actual page to load
        try:
            WebDriverWait(driver, 60).until(
                lambda d: "hiring.cafe" in d.current_url and "vercel.link" not in d.current_url
            )
            print("Security checkpoint resolved, page loaded successfully")
        except:
            print("Security checkpoint may still be active, proceeding anyway...")
    
    # Wait additional time for network requests
    print("Waiting for network requests to complete...")
    time.sleep(10)
    
    # Get performance logs
    logs = driver.get_log('performance')
    intercepted_payload = None

    # Process logs to find the POST request
    for log in logs:
        try:
            log_entry = json.loads(log['message'])['message']
            if ('Network.requestWillBeSent' in log_entry['method'] and 
                'api/search-jobs' in log_entry['params']['request']['url']):
                request_data = log_entry['params']['request']
                if 'postData' in request_data:
                    intercepted_payload = request_data['postData']
                    print("Successfully intercepted API request payload")
                    break
        except Exception:
            continue

    selenium_cookies = driver.get_cookies()
    driver.quit()
    
    return selenium_cookies, intercepted_payload

def fetch_page(session, page, json_payload):
    """Fetch a single page of results"""
    # Add page parameter to the payload
    payload_with_page = json_payload.copy()
    payload_with_page['page'] = page
    
    print(f"Fetching page {page}...")
    
    try:
        response = session.post(POST_URL, headers=headers, json=payload_with_page, timeout=60)
        
        # Check for security checkpoint
        if response.status_code == 403 and "vercel.link" in response.text:
            print(f"Security checkpoint detected on page {page}, waiting and retrying...")
            time.sleep(30)
            
            # Retry once
            response = session.post(POST_URL, headers=headers, json=payload_with_page, timeout=60)
            
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error on page {page}: {response.status_code}")
            if response.status_code == 403:
                print("Access forbidden - likely blocked by security measures")
            elif response.status_code == 429:
                print("Rate limited - waiting before retry...")
                time.sleep(60)
                # Retry once after rate limit
                response = session.post(POST_URL, headers=headers, json=payload_with_page, timeout=60)
                if response.status_code == 200:
                    return response.json()
            return None
    except Exception as e:
        print(f"Exception on page {page}: {e}")
        return None

def main():
    # Get session cookies and intercepted payload
    selenium_cookies, intercepted_payload = get_session_cookies()
    
    # Use the intercepted payload if available, otherwise use a more realistic default
    if intercepted_payload:
        try:
            json_payload = json.loads(intercepted_payload)
            print("Using intercepted payload")
        except json.JSONDecodeError:
            json_payload = {
                "query": "",
                "sortBy": "compensation_desc",
                "filters": {},
                "dateFetchedPastNDays": -1
            }
            print("Using default payload (intercepted payload was invalid)")
    else:
        json_payload = {
            "query": "",
            "sortBy": "compensation_desc",
            "filters": {},
            "dateFetchedPastNDays": -1
        }
        print("Using default payload (no intercepted payload)")

    # 2. Use requests to re-execute the POST request with pagination
    session = requests.Session()
    for cookie in selenium_cookies:
        session.cookies.set(cookie['name'], cookie['value'])

    # Ensure logs directory exists
    LOGS_DIR = 'logs'
    os.makedirs(LOGS_DIR, exist_ok=True)
    
    # Ensure src/data directory exists for output files
    OUTPUT_DIR = r'C:\Users\green\Documents\GitHub\hiring-cafe-ui\src\data'
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Initialize variables for pagination
    all_jobs = []
    page = 0
    total_pages = None
    jobs_per_page = None
    consecutive_failures = 0
    max_consecutive_failures = 3
    
    print("Starting paginated scraping...")
    
    while True:
        response_data = fetch_page(session, page, json_payload)
        
        if not response_data:
            consecutive_failures += 1
            print(f"Failed to fetch page {page} (failure {consecutive_failures}/{max_consecutive_failures})")
            
            if consecutive_failures >= max_consecutive_failures:
                print(f"Too many consecutive failures ({consecutive_failures}), stopping pagination")
                break
                
            # Wait longer before retrying
            time.sleep(30)
            continue
        else:
            consecutive_failures = 0  # Reset failure counter on success
            
        # Extract jobs from the response
        if 'jobs' in response_data:
            jobs = response_data['jobs']
            if not jobs:  # No more jobs on this page
                print(f"No more jobs on page {page}, stopping pagination")
                break
                
            all_jobs.extend(jobs)
            print(f"Page {page}: Found {len(jobs)} jobs (Total so far: {len(all_jobs)})")
            
            # Check if we have pagination info
            if total_pages is None and 'pagination' in response_data:
                pagination = response_data['pagination']
                total_pages = pagination.get('totalPages', None)
                jobs_per_page = pagination.get('jobsPerPage', None)
                if total_pages:
                    print(f"Total pages: {total_pages}, Jobs per page: {jobs_per_page}")
            
            # If we know total pages, check if we've reached the end
            if total_pages is not None and page >= total_pages - 1:
                print(f"Reached last page ({total_pages}), stopping pagination")
                break
        elif 'results' in response_data:
            # Handle the actual API response structure
            results = response_data['results']
            if not results:  # No more results on this page
                print(f"No more results on page {page}, stopping pagination")
                break
                
            all_jobs.extend(results)
            print(f"Page {page}: Found {len(results)} results (Total so far: {len(all_jobs)})")
            
            # Check if we have pagination info
            if total_pages is None and 'pagination' in response_data:
                pagination = response_data['pagination']
                total_pages = pagination.get('totalPages', None)
                jobs_per_page = pagination.get('jobsPerPage', None)
                if total_pages:
                    print(f"Total pages: {total_pages}, Jobs per page: {jobs_per_page}")
            
            # If we know total pages, check if we've reached the end
            if total_pages is not None and page >= total_pages - 1:
                print(f"Reached last page ({total_pages}), stopping pagination")
                break
                
        else:
            print(f"No 'jobs' or 'results' key found in page {page} response")
            print(f"Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Not a dict'}")
            # Try to find any array that might contain job data
            for key, value in response_data.items():
                if isinstance(value, list) and len(value) > 0:
                    print(f"Found potential job data in key '{key}' with {len(value)} items")
                    all_jobs.extend(value)
                    print(f"Page {page}: Found {len(value)} items in '{key}' (Total so far: {len(all_jobs)})")
                    break
            else:
                print("No array data found, stopping pagination")
                break
            
        page += 1
        
        # Add a longer delay between requests to be more respectful
        time.sleep(2)
    
    # Compile all results into one comprehensive JSON file
    if all_jobs:
        # Create a comprehensive result structure
        comprehensive_result = {
            "metadata": {
                "total_jobs": len(all_jobs),
                "pages_fetched": page + 1,
                "scraped_at": time.strftime("%Y-%m-%d %H:%M:%S"),
                "search_state": json.loads(SEARCH_STATE)
            },
            "jobs": all_jobs
        }
        
        # Save comprehensive result to the main jobs_data.json file
        filename = os.path.join(OUTPUT_DIR, "jobs_data.json")
        
        # Force delete the old file first to ensure complete replacement
        try:
            if os.path.exists(filename):
                os.remove(filename)
                print(f"Removed old {filename}")
        except Exception as e:
            print(f"Warning: Could not remove old file: {e}")
        
        # Write the new file
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(comprehensive_result, f, indent=2)
            print(f"\nComprehensive results saved to {filename}")
            print(f"Total jobs collected: {len(all_jobs)}")
            print(f"Pages processed: {page + 1}")
            
            # Verify the file was written correctly
            if os.path.exists(filename):
                file_size = os.path.getsize(filename)
                print(f"File size: {file_size} bytes")
            else:
                print("ERROR: File was not created!")
                
        except Exception as e:
            print(f"ERROR: Failed to write file: {e}")
            # Try to write to a backup location
            backup_filename = os.path.join(OUTPUT_DIR, "jobs_data_backup.json")
            try:
                with open(backup_filename, 'w', encoding='utf-8') as f:
                    json.dump(comprehensive_result, f, indent=2)
                print(f"Saved backup to {backup_filename}")
            except Exception as backup_e:
                print(f"ERROR: Failed to write backup file: {backup_e}")
        
        # Log the results
        log_path = os.path.join(LOGS_DIR, 'scraper.log')
        with open(log_path, 'a', encoding='utf-8') as logf:
            logf.write(f"Comprehensive scraping completed. Total jobs: {len(all_jobs)}, Pages: {page + 1}\n")
            logf.write(f"Results saved to {filename}\n")
    else:
        print("No jobs were collected")
        log_path = os.path.join(LOGS_DIR, 'scraper.log')
        with open(log_path, 'a', encoding='utf-8') as logf:
            logf.write("No jobs were collected during scraping\n")

if __name__ == "__main__":
    main()