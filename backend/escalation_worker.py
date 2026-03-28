import time
import logging
import requests

logging.basicConfig(level=logging.INFO, format='%(asctime)s - WORKER - %(message)s')

# Configuration
API_URL = "http://localhost:5000/api/trigger_escalation"
SECRET_KEY = "super_secret_triage_key_123"
INTERVAL_SECONDS = 60  # Scan every 1 minute

def run_worker():
    logging.info(f"Escalation worker started. Pinging {API_URL} every {INTERVAL_SECONDS} seconds.")
    
    headers = {
        "Authorization": f"Bearer {SECRET_KEY}",
        "Content-Type": "application/json"
    }

    while True:
        try:
            # Ping the main application
            response = requests.post(API_URL, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                logging.info(f"Success: {data.get('message')}")
            else:
                logging.warning(f"Failed with status {response.status_code}: {response.text}")

        except requests.exceptions.ConnectionError:
            logging.error("Could not connect to the main server. Is app.py running?")
        except Exception as e:
            logging.error(f"Unexpected error: {str(e)}")
            
        # Wait for the next cycle
        time.sleep(INTERVAL_SECONDS)

if __name__ == "__main__":
    run_worker()