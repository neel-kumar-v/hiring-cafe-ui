import os
import time
import threading
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options

def read_job_links_from_txt(txt_file_path="job_links.txt"):
    """
    Read job links from the TXT file.
    Returns a list of job links.
    """
    job_links = []
    
    if not os.path.exists(txt_file_path):
        print(f"TXT file not found: {txt_file_path}")
        print("Please run extract_links.py first to generate job_links.txt")
        return job_links
    
    try:
        with open(txt_file_path, 'r', encoding='utf-8') as txtfile:
            for line in txtfile:        
                line = line.strip()  # Remove whitespace and newlines
                if line:  # Only add non-empty lines
                    job_links.append(line)
    except Exception as e:
        print(f"Error reading TXT file: {e}")
        return job_links
    
    print(f"Loaded {len(job_links)} job links from TXT")
    
    return job_links

def open_job_links_batch(driver, job_links, start_index, batch_size, total_links):
    """
    Open a batch of job links in new tabs.
    """
    end_index = min(start_index + batch_size, len(job_links))
    
    for i in range(start_index, end_index):
        application_link = job_links[i].strip()  # Remove any whitespace/newlines
        print(f"{i+1}/{total_links}: {application_link}")
        
        try:
            # Open new tab
            driver.execute_script("window.open('');")
            driver.switch_to.window(driver.window_handles[-1])
            driver.get(application_link)
        except Exception as e:
            print(f"Error opening link: {e}")

def monitor_tabs_and_refill(driver, job_links, current_index, total_links):
    """
    Monitor the number of open tabs and open more when only 1 tab is left.
    """
    while current_index < len(job_links):
        try:
            # Count open tabs
            open_tabs = len(driver.window_handles)
            
            if open_tabs <= 1 and current_index < len(job_links):
                print(f"\nOnly {open_tabs} tab(s) left. Opening next 10 tabs...")
                
                # Open next 10 tabs (or remaining tabs if less than 10)
                batch_size = min(10, len(job_links) - current_index)
                open_job_links_batch(driver, job_links, current_index, batch_size, total_links)
                current_index += batch_size
                
                print(f"Opened {batch_size} more tabs. Total opened: {current_index}/{total_links}")
            
            # Check every 5 seconds
            time.sleep(5)
            
        except Exception as e:
            print(f"Error monitoring tabs: {e}")
            time.sleep(5)

def open_all_job_links(job_links):
    """
    Open job links in Chrome with extensions preserved.
    Opens 10 tabs initially, then opens 10 more when only 1 tab is left.
    """
    print(f"Opening job application links in Chrome...")
    print("Extensions will be preserved!")
    print("Will open 10 tabs initially, then 10 more when only 1 tab is left.")
    
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
        
        print("Opening initial 10 job application links...")
        
        # Open first 10 links (or all if less than 10)
        initial_batch_size = min(10, len(job_links))
        open_job_links_batch(driver, job_links, 0, initial_batch_size, len(job_links))
        
        current_index = initial_batch_size
        print(f"\nSuccessfully opened {initial_batch_size} job application tabs!")
        print("Monitoring tabs... Will open 10 more when only 1 tab is left.")
        
        # Start monitoring thread
        monitor_thread = threading.Thread(
            target=monitor_tabs_and_refill, 
            args=(driver, job_links, current_index, len(job_links))
        )
        monitor_thread.daemon = True
        monitor_thread.start()
        
        # Keep the browser open for user interaction
        input("Press Enter to close all Chrome windows...")
        driver.quit()
        
    except Exception as e:
        print(f"Error initializing Chrome driver: {e}")
        print("Please check your Chrome driver installation.")

def main():
    print("Job Application Link Opener")
    print("=" * 40)
    
    # Read job links from TXT
    job_links = read_job_links_from_txt("C:\\Users\\green\\Downloads\\saved-application-links(1).txt")
    
    if not job_links:
        print("No job links found. Please run extract_links.py first.")
        return
    
    print(f"\nFound {len(job_links)} job application links.")
    print("Opening all links in Chrome with extensions preserved...")
    
    # Open all job links
    open_all_job_links(job_links)

if __name__ == "__main__":
    main()
