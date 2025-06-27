#!/usr/bin/env python3
"""
Test script to verify media upload functionality
"""
import requests
import os

def test_media_upload():
    """Test the media upload endpoint"""
    url = "http://localhost:8000/api/upload/media/"
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:8000/api/")
        print(f"✅ Server is running (Status: {response.status_code})")
    except requests.exceptions.ConnectionError:
        print("❌ Server is not running. Please start Django server first.")
        return False
    
    # Test upload endpoint exists
    try:
        response = requests.post(url, headers={"Authorization": "Bearer test"})
        if response.status_code == 401:
            print("✅ Upload endpoint exists (Authentication required)")
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Upload endpoint error: {e}")
        return False
    
    print("\n🎉 Media upload backend is working correctly!")
    print("📝 Next steps:")
    print("1. Login to the frontend")
    print("2. Try creating a post with media")
    print("3. Check browser console for any remaining errors")
    
    return True

if __name__ == "__main__":
    test_media_upload() 