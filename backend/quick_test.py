import requests
import json

# Test login
response = requests.post("http://127.0.0.1:8000/api/auth/login/", json={
    "username": "testuser",
    "password": "TestPass123!"
})

print(f"Login Status: {response.status_code}")
print(f"Login Response: {response.text}")

if response.status_code == 200:
    data = response.json()
    token = data.get('tokens', {}).get('access')
    
    print(f"Token: {token[:50]}...")
    
    # Test authenticated endpoint
    headers = {'Authorization': f'Bearer {token}'}
    
    wallet_response = requests.get("http://127.0.0.1:8000/api/wallet/", headers=headers)
    print(f"Wallet Status: {wallet_response.status_code}")
    print(f"Wallet Response: {wallet_response.text}")
    
    profile_response = requests.get("http://127.0.0.1:8000/api/auth/profile/", headers=headers)
    print(f"Profile Status: {profile_response.status_code}")
    print(f"Profile Response: {profile_response.text}") 