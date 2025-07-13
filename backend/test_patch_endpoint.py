#!/usr/bin/env python
import os
import sys
import django
import requests
import json

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

def test_patch_endpoint():
    """Test the PATCH endpoint directly"""
    
    # Test URL
    url = "http://localhost:8000/api/auth/profile/about/"
    
    # Test data
    data = {
        "bio": "Test bio from script",
        "occupation": "Developer",
        "company": "Test Company"
    }
    
    # Headers
    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'  # This will fail auth, but we can see if endpoint exists
    }
    
    print(f"Testing PATCH endpoint: {url}")
    print(f"Data: {json.dumps(data, indent=2)}")
    
    try:
        response = requests.patch(url, json=data, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✓ Endpoint exists but requires authentication")
        elif response.status_code == 405:
            print("✗ Method not allowed - endpoint doesn't support PATCH")
        else:
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("✗ Connection failed - Django server not running on port 8000")
    except Exception as e:
        print(f"✗ Error: {e}")

if __name__ == '__main__':
    test_patch_endpoint() 