import requests
import time

# Step 1: Device Flow Initialization
def initiate_device_flow(client_id):
    url = "https://github.com/login/device/code"
    payload = {
        "client_id": client_id,
    }
    response = requests.post(url, data=payload, headers={"Accept": "application/json"})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception("Failed to initiate device flow", response.text)

# Step 2 is handled manually by the user

# Step 3: Poll GitHub for the Access Token
def poll_for_access_token(client_id, device_code, interval):
    url = "https://github.com/login/oauth/access_token"
    payload = {
        "client_id": client_id,
        "device_code": device_code,
        "grant_type": "urn:ietf:params:oauth:grant-type:device_code"
    }
    headers = {
        "Accept": "application/json"
    }
    while True:
        response = requests.post(url, data=payload, headers=headers)
        if response.status_code == 200:
            json_response = response.json()
            if "access_token" in json_response:
                return json_response["access_token"]
            elif "error" in json_response:
                if json_response["error"] == "authorization_pending":
                    print("Authorization pending. Please authorize.")
                elif json_response["error"] == "slow_down":
                    interval += 5  # Increase the interval as instructed by GitHub
                else:
                    raise Exception("Authorization failed", json_response["error"])
        else:
            raise Exception("Failed to poll for access token", response.text)
        time.sleep(interval)

# Main script
client_id = "client_ID"  # Replace with your client ID
device_flow_response = initiate_device_flow(client_id)

print("Please go to {} and enter the code: {}".format(device_flow_response["verification_uri"], device_flow_response["user_code"]))
print("Waiting for authorization...")

try:
    access_token = poll_for_access_token(client_id, device_flow_response["device_code"], device_flow_response["interval"])
    print("Access token received:", access_token)
    # Now you can use the access token to perform actions on behalf of the user
    user_response = requests.get('https://api.github.com/user', headers={'Authorization': f'token {access_token}'})
    user_json = user_response.json()
    
    print(f"Hello, {user_json['login']}! You have successfully authenticated.")
except Exception as e:
    print(e)
