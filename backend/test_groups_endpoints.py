#!/usr/bin/env python
"""
Test-Skript für Gruppen-Endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_groups_endpoints():
    print("=== Testing Groups Endpoints ===")
    
    # Test 1: Gruppen-Liste abrufen
    print("\n1. Testing GET /groups/")
    try:
        response = requests.get(f"{BASE_URL}/groups/")
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
        response = requests.get(f"{BASE_URL}/groups/1/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Group details: {data.get('name')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 3: Gruppen-Mitglieder abrufen
    print("\n3. Testing GET /groups/1/members/")
    try:
        response = requests.get(f"{BASE_URL}/groups/1/members/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Members found: {len(data)}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 4: Gruppen-Analytics abrufen
    print("\n4. Testing GET /groups/1/analytics/")
    try:
        response = requests.get(f"{BASE_URL}/groups/1/analytics/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Analytics: {data.get('total_members', 0)} members, {data.get('total_posts', 0)} posts")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 5: Gruppen-Reports abrufen
    print("\n5. Testing GET /groups/1/reports/")
    try:
        response = requests.get(f"{BASE_URL}/groups/1/reports/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Reports: {data.get('report_stats', {}).get('total_reports', 0)} total reports")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_groups_endpoints() 