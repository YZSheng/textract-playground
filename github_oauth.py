import requests

# Replace these with your GitHub app's values
CLIENT_ID = 'YOUR_CLIENT_ID'
CLIENT_SECRET = 'YOUR_CLIENT_SECRET'
# This redirect URI should match the one you set in the GitHub app settings, it can be a dummy for this flow
REDIRECT_URI = 'http://localhost:3000'

def main():
    # Direct user to navigate to this URL and authorize the app
    auth_url = f"https://github.com/login/oauth/authorize?client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}&scope=user"
    print(f"Please go to this URL and authorize the app:\n{auth_url}\n")
    
    # Prompt user to enter the code after authorization
    code = input("Enter the code from the URL here: ")
    
    # Exchange the code for an access token
    token_response = requests.post(
        'https://github.com/login/oauth/access_token',
        data={'client_id': CLIENT_ID, 'client_secret': CLIENT_SECRET, 'code': code, 'redirect_uri': REDIRECT_URI},
        headers={'Accept': 'application/json'}
    )
    token_json = token_response.json()
    access_token = token_json.get('access_token')
    
    # Use the access token to access the GitHub API
    user_response = requests.get('https://api.github.com/user', headers={'Authorization': f'token {access_token}'})
    user_json = user_response.json()
    
    print(f"Hello, {user_json['login']}! You have successfully authenticated.")

if __name__ == '__main__':
    main()
