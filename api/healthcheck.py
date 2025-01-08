import requests

try:
    response = requests.get("http://localhost:8000/api/health")
    if response.status_code == 200:
        print("Healthcheck: OK")
        exit(0)
    else:
        print("Healthcheck: Failed")
        exit(1)
except requests.exceptions.RequestException:
    print("Healthcheck: Failed")
    exit(1)
