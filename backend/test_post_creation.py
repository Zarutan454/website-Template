#!/usr/bin/env python3
"""
Test script to debug post creation 400 error
"""
import requests
import json

def test_post_creation():
    """Test the post creation endpoint"""
    url = "http://localhost:8000/api/posts/"
    
    # Test data
    test_data = {
        "content": "Test post content",
        "media_url": None,
        "media_type": None
    }
    
    print("🔍 Testing post creation...")
    print(f"URL: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    
    try:
        # Test without authentication first
        response = requests.post(url, json=test_data)
        print(f"\n📊 Response without auth:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.post(url, json=test_data, headers=headers)
        print(f"\n📊 Response with invalid token:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        # Test with valid token (if available)
        # You would need to get a real token from login
        print(f"\n📝 To test with valid token:")
        print(f"1. Login to the frontend")
        print(f"2. Get token from localStorage: access_token")
        print(f"3. Update this script with the real token")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_post_creation() 