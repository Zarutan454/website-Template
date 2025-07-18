#!/usr/bin/env python
"""
Test-Skript für Admin-Funktionen
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def get_auth_token():
    """Hole einen Auth-Token für den Testbenutzer"""
    try:
        login_data = {
            "username": "testuser",
            "password": "test123"
        }
        
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        if response.status_code == 200:
            data = response.json()
            return data.get('token')
        else:
            print(f"Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

def test_admin_functions():
    print("=== Testing Admin Functions ===")
    
    # Hole Auth-Token
    token = get_auth_token()
    if not token:
        print("Could not get auth token")
        return
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    group_id = "1"
    
    # Test 1: Gruppen-Details abrufen
    print("\n1. Testing GET /groups/1/")
    try:
        response = requests.get(f"{BASE_URL}/groups/{group_id}/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Group: {data.get('name')}")
            print(f"Is member: {data.get('is_member')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Mitglieder abrufen
    print("\n2. Testing GET /groups/1/members/")
    try:
        response = requests.get(f"{BASE_URL}/groups/{group_id}/members/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Members found: {len(data)}")
            for member in data:
                print(f"  - {member.get('user', {}).get('username')} ({member.get('role')})")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Promote-Funktion testen (nur wenn andere Mitglieder existieren)
    print("\n3. Testing POST /groups/1/promote/2/")
    try:
        response = requests.post(f"{BASE_URL}/groups/{group_id}/promote/2/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Promote successful")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 4: Demote-Funktion testen
    print("\n4. Testing POST /groups/1/demote/2/")
    try:
        response = requests.post(f"{BASE_URL}/groups/{group_id}/demote/2/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Demote successful")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 5: Kick-Funktion testen
    print("\n5. Testing POST /groups/1/kick/2/")
    try:
        response = requests.post(f"{BASE_URL}/groups/{group_id}/kick/2/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("Kick successful")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 6: Analytics abrufen
    print("\n6. Testing GET /groups/1/analytics/")
    try:
        response = requests.get(f"{BASE_URL}/groups/{group_id}/analytics/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Analytics: {data.get('total_members', 0)} members, {data.get('total_posts', 0)} posts")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 7: Reports abrufen
    print("\n7. Testing GET /groups/1/reports/")
    try:
        response = requests.get(f"{BASE_URL}/groups/{group_id}/reports/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Reports: {data.get('report_stats', {}).get('total_reports', 0)} total reports")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_admin_functions() 