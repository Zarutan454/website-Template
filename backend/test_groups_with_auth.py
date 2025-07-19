#!/usr/bin/env python
"""
Test-Skript für Gruppen-Endpoints mit Authentifizierung
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def get_auth_token():
    """Hole einen Auth-Token für den ersten Benutzer"""
    try:
        # Login mit dem Testbenutzer
        login_data = {
            "username": "testuser",
            "password": "test123"  # Standard-Passwort
        }
        
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data.get('token')  # Django REST Framework verwendet 'token' statt 'access'
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

def test_groups_endpoints_with_auth():
    print("=== Testing Groups Endpoints with Authentication ===")
    
    # Hole Auth-Token
    token = get_auth_token()
    if not token:
        print("Could not get auth token. Creating test user...")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Gruppen-Liste abrufen
    print("\n1. Testing GET /groups/")
    try:
        response = requests.get(f"{BASE_URL}/groups/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Groups found: {len(data.get('results', []))}")
            if data.get('results'):
                group = data['results'][0]
                print(f"First group: {group.get('name')} (ID: {group.get('id')})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Gruppen-Details abrufen
    print("\n2. Testing GET /groups/1/")
    try:
        response = requests.get(f"{BASE_URL}/groups/1/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Group details: {data.get('name')}")
            print(f"Is member: {data.get('is_member')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Gruppen-Mitglieder abrufen
    print("\n3. Testing GET /groups/1/members/")
    try:
        response = requests.get(f"{BASE_URL}/groups/1/members/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Members found: {len(data)}")
            if data:
                print(f"First member: {data[0].get('user', {}).get('username')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 4: Gruppen-Analytics abrufen
    print("\n4. Testing GET /groups/1/analytics/")
    try:
        response = requests.get(f"{BASE_URL}/groups/1/analytics/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Analytics: {data.get('total_members', 0)} members, {data.get('total_posts', 0)} posts")
            print(f"Engagement rate: {data.get('engagement_rate', 0):.1f}%")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 5: Gruppen-Reports abrufen
    print("\n5. Testing GET /groups/1/reports/")
    try:
        response = requests.get(f"{BASE_URL}/groups/1/reports/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Reports: {data.get('report_stats', {}).get('total_reports', 0)} total reports")
            print(f"Pending reports: {data.get('report_stats', {}).get('pending_reports', 0)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_groups_endpoints_with_auth() 