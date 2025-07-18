#!/usr/bin/env python3
"""
Test-Skript für die neuen Profil-API-Endpunkte
"""

import requests
import json

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def test_profile_apis():
    """Testet alle neuen Profil-API-Endpunkte"""
    
    # Test-Daten
    test_user_id = 2  # fabian
    test_username = "fabian"
    
    print("🧪 Teste Profil-API-Endpunkte...")
    print("=" * 50)
    
    # 1. Test: User Profile
    print("\n1. Testing: GET /users/profile/{username}/")
    try:
        response = requests.get(f"{API_BASE}/users/profile/{test_username}/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profil geladen: {data.get('username', 'N/A')}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 2. Test: User Photos
    print("\n2. Testing: GET /users/{user_id}/photos/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/photos/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Fotos geladen: {len(data.get('results', []))} Fotos")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 3. Test: User Activity
    print("\n3. Testing: GET /users/{user_id}/activity/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/activity/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Aktivitäten geladen: {len(data.get('results', []))} Aktivitäten")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 4. Test: User Analytics
    print("\n4. Testing: GET /users/{user_id}/analytics/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/analytics/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Analytics geladen: {data}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 5. Test: User Privacy
    print("\n5. Testing: GET /users/{user_id}/privacy/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/privacy/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Privacy-Einstellungen geladen: {data}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 6. Test: User Social Links
    print("\n6. Testing: GET /users/{user_id}/social-links/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/social-links/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Social Links geladen: {data}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 API-Tests abgeschlossen!")

if __name__ == "__main__":
    test_profile_apis() 