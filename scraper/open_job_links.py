import csv
import os
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options

def read_job_links_from_csv(csv_file_path="job_links.csv"):
    """
    Read job links from the CSV file.
    Returns a list of tuples (job_title, application_link, company_name, location).
    """
    job_links = []
    
    if not os.path.exists(csv_file_path):
        print(f"CSV file not found: {csv_file_path}")
        print("Please run extract_links.py first to generate job_links.csv")
        return job_links
    
    try:
        with open(csv_file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                job_title = row['Job Title']
                application_link = row['Application Link']
                company_name = row['Company']
                location = row['Location']
                job_links.append((job_title, application_link, company_name, location))
    except Exception as e:
        print(f"Error reading CSV file: {e}")
        return job_links
    
    print(f"Loaded {len(job_links)} job links from CSV")
    return job_links

def open_all_job_links(job_links):
    """
    Open all job links in Chrome with extensions preserved.
    All links open in one window with multiple tabs.
    """
    print(f"Opening {len(job_links)} job application links in Chrome...")
    print("Extensions will be preserved!")
    print("All links will open in one window with multiple tabs.")
    
    # Chrome options to preserve extensions and user data
    options = Options()
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option('useAutomationExtension', False)
    
    # Use your existing Chrome profile to preserve extensions
    chrome_path = r"C:\Drivers\Chrome\chrome-win64\chrome.exe"
    if os.path.exists(chrome_path):
        options.binary_location = chrome_path
    
    # Try to use existing Chrome profile (this preserves extensions)
    user_data_dir = os.path.expanduser("~\\AppData\\Local\\Google\\Chrome\\User Data")
    if os.path.exists(user_data_dir):
        options.add_argument(f"--user-data-dir={user_data_dir}")
        print("Using existing Chrome profile - extensions will be preserved!")
    else:
        print("Chrome profile not found, extensions may not work")
    
    try:
        service = ChromeService(executable_path=r"C:\Drivers\Chrome\chromedriver-win64\chromedriver.exe")
        driver = webdriver.Chrome(service=service, options=options)
        
        print("Opening all job application links...")
        
        # Open first link in current tab
        if job_links:
            first_job = job_links[0]
            print(f"1/{len(job_links)}: {first_job[0]} at {first_job[2]}")
            driver.get(first_job[1])
        
        # Open remaining links in new tabs (no delays)
        for i in range(1, len(job_links)):
            job_title, application_link, company_name, location = job_links[i]
            print(f"{i+1}/{len(job_links)}: {job_title} at {company_name}")
            
            try:
                # Open new tab
                driver.execute_script("window.open('');")
                driver.switch_to.window(driver.window_handles[-1])
                driver.get(application_link)
            except Exception as e:
                print(f"Error opening link: {e}")
        
        print(f"\nSuccessfully opened {len(job_links)} job application tabs!")
        print("Chrome will remain open. Close it manually when you're done applying.")
        
        # Keep the browser open for user interaction
        input("Press Enter to close all Chrome windows...")
        driver.quit()
        
    except Exception as e:
        print(f"Error initializing Chrome driver: {e}")
        print("Please check your Chrome driver installation.")

def main():
    print("Job Application Link Opener")
    print("=" * 40)
    
    # Read job links from CSV
    job_links = read_job_links_from_csv()
    
    if not job_links:
        print("No job links found. Please run extract_links.py first.")
        return
    
    print(f"\nFound {len(job_links)} job application links.")
    print("Opening all links in Chrome with extensions preserved...")
    
    # Open all job links
    open_all_job_links(job_links)

if __name__ == "__main__":
    main()
