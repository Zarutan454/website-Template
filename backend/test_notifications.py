#!/usr/bin/env python
"""
Simple script to test notifications API
"""

import requests
import json

def test_notifications():
    """Test the notifications API"""
    
    # Test without authentication first
    print("Testing notifications without authentication...")
    response = requests.get('http://localhost:8000/api/notifications/')
    print(f"Status: {response.status_code}")
    if response.status_code == 401:
        print("✅ Correctly requires authentication")
    else:
        print(f"❌ Unexpected response: {response.text[:200]}")
    
    # Test with a simple token
    print("\nTesting notifications with test token...")
    headers = {'Authorization': 'Bearer test_token'}
    response = requests.get('http://localhost:8000/api/notifications/', headers=headers)
    print(f"Status: {response.status_code}")
    if response.status_code == 401:
        print("✅ Correctly rejects invalid token")
    else:
        print(f"❌ Unexpected response: {response.text[:200]}")
    
    # Test the API root to see what's available
    print("\nTesting API root...")
    response = requests.get('http://localhost:8000/api/')
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Available endpoints:")
        for key, value in data.items():
            print(f"  - {key}: {value}")
    else:
        print(f"❌ API root failed: {response.text[:200]}")

if __name__ == '__main__':
    test_notifications() 