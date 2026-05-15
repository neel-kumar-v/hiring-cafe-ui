import schedule
import time
import logging
from datetime import datetime
import subprocess
import sys
import os

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler()
    ]
)

def run_scraper():
    """Run the scraper script"""
    try:
        logging.info("Starting daily scraper run...")
        
        # Change to the project directory
        project_dir = r"C:\Users\green\Documents\GitHub\hiring-cafe-ui"
        os.chdir(project_dir)
        
        # Run Convex ingest scraper (uses filtered hiring.cafe search URL from scraper.py)
        result = subprocess.run(
            [sys.executable, os.path.join("scraper", "scrape_to_convex.py")],
            capture_output=True,
            text=True,
            timeout=3600,
        )
        
        if result.returncode == 0:
            logging.info("Scraper completed successfully!")
            logging.info(f"Output: {result.stdout}")
        else:
            logging.error(f"Scraper failed with return code {result.returncode}")
            logging.error(f"Error: {result.stderr}")
            
    except subprocess.TimeoutExpired:
        logging.error("Scraper timed out after 5 minutes")
    except Exception as e:
        logging.error(f"Unexpected error: {e}")

def main():
    """Main function to schedule and run the scraper"""
    logging.info("Scheduler started. Scraper will run daily at 9:00 PM")
    
    # Schedule the scraper to run daily at 9:00 PM
    schedule.every().day.at("21:00").do(run_scraper)
    
    # Run immediately on startup (optional)
    run_scraper()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    main() 