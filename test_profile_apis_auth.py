#!/usr/bin/env python3
"""
Authentifiziertes Test-Skript für die neuen Profil-API-Endpunkte
"""

import requests
import json

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def get_auth_token():
    """Holt einen Auth-Token für die Tests"""
    login_data = {
        "email": "fabian@bsn.com",
        "password": "Ostblokk1993"  # Korrektes Passwort
    }
    
    try:
        print(f"Versuche Login mit: {login_data['email']}")
        response = requests.post(f"{API_BASE}/auth/login/", json=login_data)
        print(f"Login Response Status: {response.status_code}")
        print(f"Login Response Headers: {dict(response.headers)}")
        print(f"Login Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')  # Geändert von 'access' zu 'token'
            if token:
                print(f"✅ Token erhalten: {token[:20]}...")
                return token
            else:
                print("❌ Kein Token in Response gefunden")
                return None
        else:
            print(f"❌ Login fehlgeschlagen: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login Exception: {e}")
        return None

def test_profile_apis():
    """Testet alle neuen Profil-API-Endpunkte mit Authentifizierung"""
    
    # Authentifizierung
    print("🔐 Authentifiziere...")
    token = get_auth_token()
    if not token:
        print("❌ Authentifizierung fehlgeschlagen")
        return
    
    print("✅ Authentifizierung erfolgreich")
    
    # Headers für authentifizierte Requests
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    # Test-Daten
    test_user_id = 2  # fabian
    test_username = "fabian"
    
    print("\n🧪 Teste Profil-API-Endpunkte...")
    print("=" * 50)
    
    # 1. Test: User Profile
    print("\n1. Testing: GET /users/profile/{username}/")
    try:
        response = requests.get(f"{API_BASE}/users/profile/{test_username}/", headers=headers)
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
        response = requests.get(f"{API_BASE}/users/{test_user_id}/photos/", headers=headers)
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
        response = requests.get(f"{API_BASE}/users/{test_user_id}/activity/", headers=headers)
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
        response = requests.get(f"{API_BASE}/users/{test_user_id}/analytics/", headers=headers)
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
        response = requests.get(f"{API_BASE}/users/{test_user_id}/privacy/", headers=headers)
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
        response = requests.get(f"{API_BASE}/users/{test_user_id}/social-links/", headers=headers)
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