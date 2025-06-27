import requests
import json

# Test login API
def test_login():
    url = "http://localhost:8000/api/auth/login/"
    
    # Test data - using email and password
    data = {
        "email": "fabian@bsn.com",
        "password": "testpass123"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("✅ Login successful!")
        else:
            print("❌ Login failed!")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_login() 