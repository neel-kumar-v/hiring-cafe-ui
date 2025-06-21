import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager

# --- Configuration ---
SESSION_URL = "https://hiring.cafe/"
POST_URL = "https://hiring.cafe/api/search-jobs"

# More specific Chrome user agent
headers = {
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
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

driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")

print("Loading page...")
driver.get(SESSION_URL)
print("Page loaded. Waiting for network requests...")

# Wait longer for the page to fully load and make requests
time.sleep(10)

# Get performance logs
logs = driver.get_log('performance')
intercepted_payload = None

print(f"Processing {len(logs)} performance logs...")

# Process logs to find the POST request
for log in logs:
    try:
        log_entry = json.loads(log['message'])['message']
        if ('Network.requestWillBeSent' in log_entry['method'] and 
            'api/search-jobs' in log_entry['params']['request']['url']):
            request_data = log_entry['params']['request']
            print(f"Found request to: {request_data['url']}")
            if 'postData' in request_data:
                intercepted_payload = request_data['postData']
                print("Intercepted payload:", intercepted_payload)
                break
    except Exception as e:
        continue

selenium_cookies = driver.get_cookies()
print(f"Got {len(selenium_cookies)} cookies from Selenium")
driver.quit()

# Use the intercepted payload if available, otherwise use a more realistic default
if intercepted_payload:
    try:
        json_payload = json.loads(intercepted_payload)
        print("Using intercepted payload")
    except json.JSONDecodeError:
        print("Failed to parse intercepted payload, using default")
        json_payload = {
            "query": "",
            "sortBy": "compensation_desc",
            "filters": {},
            "dateFetchedPastNDays": -1
        }
else:
    print("No payload intercepted, using default")
    json_payload = {
        "query": "",
        "sortBy": "compensation_desc",
        "filters": {},
        "dateFetchedPastNDays": -1
    }

print(f"Final payload: {json.dumps(json_payload, indent=2)}")

# 2. Use requests to re-execute the POST request
session = requests.Session()
for cookie in selenium_cookies:
    session.cookies.set(cookie['name'], cookie['value'])

print(f"Making POST request to {POST_URL}...")
print(f"Headers: {json.dumps(dict(headers), indent=2)}")

try:
    response = session.post(POST_URL, headers=headers, json=json_payload, timeout=30)
    print(f"Response status: {response.status_code}")
    print(f"Response headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        print("Success!")
        # Save response to JSON file in src/data
        response_data = response.json()
        filename = "src/data/jobs_data.json"
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(response_data, f, indent=2)
        print(f"Response saved to {filename}")
    else:
        print(f"Error response: {response.text}")
        
except requests.exceptions.HTTPError as e:
    print(f"An HTTP error occurred: {e.response.status_code} - {e.response.text}")
    print(f"Response headers: {dict(e.response.headers)}")
except requests.exceptions.RequestException as e:
    print(f"A request error occurred: {e}")