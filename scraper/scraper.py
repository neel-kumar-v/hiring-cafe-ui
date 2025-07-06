import time
import json
import requests
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
import urllib.parse

# --- Configuration ---
SEARCH_STATE = (
    '{"locations":[{"formatted_address":"United States","types":["country"],'
    '"geometry":{"location":{"lat":"40.0146","lon":"-75.7136"}},'
    '"id":"user_country","address_components":[{"long_name":"United States",'
    '"short_name":"US","types":["country"]}],"options":{"flexible_regions":'
    '["anywhere_in_continent","anywhere_in_world"]}}],"commitmentTypes":'
    '["Full Time","Part Time","Contract","Internship"],"departments":'
    '["Engineering","Software Development","Information Technology",'
    '"Data and Analytics","Product Management"],"roleTypes":'
    '["Individual Contributor"],"mastersDegreeRequirements":'
    '["Not Mentioned"],"doctorateDegreeRequirements":["Not Mentioned"],'
    '"seniorityLevel":["No Prior Experience Required","Entry Level"],'
    '"jobTitleQuery":"\\"software engineer\\" OR \\"application developer\\" OR \\"frontend developer\\" OR \\"backend engineer\\" OR \\"full stack developer\\" OR \\"android developer\\" OR \\"ios developer\\" OR \\"ai engineer\\""}'
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

# 1. Use Selenium to get session cookies and intercept the request
options = webdriver.ChromeOptions()
options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
options.add_argument('--no-sandbox')
options.add_argument('--disable-dev-shm-usage')
options.add_argument('--headless=new')
options.add_argument('--disable-blink-features=AutomationControlled')
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option('useAutomationExtension', False)

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
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

print(f"Loading {SESSION_URL}")
driver.get(SESSION_URL)
print(f"Page loaded. Waiting for network requests...")

# Wait longer for the page to fully load and make requests
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
                break
    except Exception:
        continue

selenium_cookies = driver.get_cookies()
driver.quit()

# Use the intercepted payload if available, otherwise use a more realistic default
if intercepted_payload:
    try:
        json_payload = json.loads(intercepted_payload)
    except json.JSONDecodeError:
        json_payload = {
            "query": "",
            "sortBy": "compensation_desc",
            "filters": {},
            "dateFetchedPastNDays": -1
        }
else:
    json_payload = {
        "query": "",
        "sortBy": "compensation_desc",
        "filters": {},
        "dateFetchedPastNDays": -1
    }

# 2. Use requests to re-execute the POST request
session = requests.Session()
for cookie in selenium_cookies:
    session.cookies.set(cookie['name'], cookie['value'])

# Ensure logs directory exists
LOGS_DIR = 'logs'
os.makedirs(LOGS_DIR, exist_ok=True)

try:
    response = session.post(POST_URL, headers=headers, json=json_payload, timeout=30)
    log_path = os.path.join(LOGS_DIR, 'scraper.log')
    with open(log_path, 'a', encoding='utf-8') as logf:
        logf.write(f"Response status: {response.status_code}\n")
    print(f"Response status: {response.status_code}")
    if response.status_code == 200:
        try:
            response_data = response.json()
            # Save response to JSON file in src/data
            filename = "src/data/jobs_data.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(response_data, f, indent=2)
            print(f"Response saved to {filename}")
            with open(log_path, 'a', encoding='utf-8') as logf:
                logf.write(f"Response saved to {filename}\n")
        except Exception as e:
            print(f"Failed to parse JSON: {e}")
            # Save raw response to logs as .bin if not decodable
            raw_path = os.path.join(LOGS_DIR, 'raw_response.bin')
            try:
                with open(raw_path, 'wb') as rawf:
                    rawf.write(response.content)
                print(f"Raw response saved to {raw_path}")
                with open(log_path, 'a', encoding='utf-8') as logf:
                    logf.write(f"Raw response saved to {raw_path}\n")
            except Exception as file_err:
                print(f"Failed to write raw response: {file_err}")
    else:
        print(f"Error response: {response.text}")
        with open(log_path, 'a', encoding='utf-8') as logf:
            logf.write(f"Error response: {response.text}\n")
except requests.exceptions.HTTPError as e:
    print(f"An HTTP error occurred: {e.response.status_code} - {e.response.text}")
    print(f"Response headers: {dict(e.response.headers)}")
    with open(log_path, 'a', encoding='utf-8') as logf:
        logf.write(f"HTTP error: {e.response.status_code} - {e.response.text}\n")
except requests.exceptions.RequestException as e:
    print(f"A request error occurred: {e}")
    with open(log_path, 'a', encoding='utf-8') as logf:
        logf.write(f"Request error: {e}\n")