#!/usr/bin/env python
"""
Direct test of Django notifications API
"""

import os
import sys
import django
import requests
import json

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_notifications_api():
    """Test the notifications API directly"""
    
    # Get the first user
    user = User.objects.first()
    if not user:
        print("No users found!")
        return
    
    print(f"Testing with user: {user.username} (ID: {user.id})")
    
    # Create a JWT token for the user
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print(f"Access token: {access_token[:50]}...")
    
    # Test notifications endpoint
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    # Test notifications list
    print("\n=== Testing /api/notifications/ ===")
    response = requests.get('http://localhost:8000/api/notifications/', headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Response data: {json.dumps(data, indent=2)}")
        except:
            print(f"Raw response: {response.text}")
    else:
        print(f"Error response: {response.text}")
    
    # Test unread count endpoint
    print("\n=== Testing /api/notifications/unread-count/ ===")
    response = requests.get('http://localhost:8000/api/notifications/unread-count/', headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Response data: {json.dumps(data, indent=2)}")
        except:
            print(f"Raw response: {response.text}")
    else:
        print(f"Error response: {response.text}")
    
    # Test API root
    print("\n=== Testing /api/ ===")
    response = requests.get('http://localhost:8000/api/', headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        try:
            data = response.json()
            print(f"Available endpoints:")
            for key, value in data.items():
                print(f"  - {key}: {value}")
        except:
            print(f"Raw response: {response.text}")
    else:
        print(f"Error response: {response.text}")

if __name__ == '__main__':
    test_notifications_api() 