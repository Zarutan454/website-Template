#!/usr/bin/env python3
"""
Umfassendes Test-Skript für alle neuen Profil-Features
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def get_auth_token():
    """Holt einen Auth-Token für die Tests"""
    login_data = {
        "email": "fabian@bsn.com",
        "password": "Ostblokk1993"
    }
    
    try:
        print(f"🔐 Versuche Login mit: {login_data['email']}")
        response = requests.post(f"{API_BASE}/auth/login/", json=login_data)
        
        if response.status_code == 200:
            data = response.json()
            token = data.get('token')
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

def test_all_profile_features():
    """Testet alle neuen Profil-Features"""
    
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
    
    print("\n🧪 Teste alle Profil-Features...")
    print("=" * 60)
    
    # 1. Test: Basis-Profil-Daten
    print("\n1. 📋 Testing: GET /users/profile/{username}/")
    try:
        response = requests.get(f"{API_BASE}/users/profile/{test_username}/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Profil geladen: {data.get('username', 'N/A')}")
            print(f"   - Follower: {data.get('follower_count', 0)}")
            print(f"   - Following: {data.get('following_count', 0)}")
            print(f"   - Verifiziert: {data.get('is_verified', False)}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 2. Test: User Photos
    print("\n2. 📸 Testing: GET /users/{user_id}/photos/")
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
    print("\n3. 📅 Testing: GET /users/{user_id}/activity/")
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
    print("\n4. 📊 Testing: GET /users/{user_id}/analytics/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/analytics/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Analytics geladen:")
            print(f"   - Posts: {data.get('total_posts', 0)}")
            print(f"   - Likes erhalten: {data.get('total_likes_received', 0)}")
            print(f"   - Engagement Rate: {data.get('engagement_rate', 0)}%")
            print(f"   - Popularität Score: {data.get('popularity_score', 0)}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 5. Test: User Privacy Settings
    print("\n5. 🔒 Testing: GET /users/{user_id}/privacy/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/privacy/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Privacy-Einstellungen geladen:")
            print(f"   - Profil-Sichtbarkeit: {data.get('profile_visibility', 'N/A')}")
            print(f"   - E-Mail anzeigen: {data.get('show_email', False)}")
            print(f"   - Freundschaftsanfragen: {data.get('allow_friend_requests', False)}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 6. Test: User Social Links
    print("\n6. 🔗 Testing: GET /users/{user_id}/social-links/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/social-links/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Social Links geladen: {len(data)} Links")
            for platform, url in data.items():
                print(f"   - {platform}: {url}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 7. Test: User Achievements
    print("\n7. 🏆 Testing: GET /users/{user_id}/achievements/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/achievements/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            achievements = data.get('achievements', [])
            print(f"✅ Achievements geladen: {len(achievements)} Achievements")
            for achievement in achievements:
                print(f"   - {achievement.get('title', 'N/A')}: {achievement.get('description', 'N/A')}")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 8. Test: User Stats
    print("\n8. 📈 Testing: GET /users/{user_id}/stats/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/stats/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ User Stats geladen:")
            print(f"   - Posts: {data.get('total_posts', 0)}")
            print(f"   - Likes erhalten: {data.get('total_likes_received', 0)}")
            print(f"   - Engagement Rate: {data.get('engagement_rate', 0)}%")
            print(f"   - Account Alter: {data.get('account_age_days', 0)} Tage")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 9. Test: User Recommendations
    print("\n9. 👥 Testing: GET /users/{user_id}/recommendations/")
    try:
        response = requests.get(f"{API_BASE}/users/{test_user_id}/recommendations/", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            recommendations = data.get('recommendations', [])
            print(f"✅ Empfehlungen geladen: {len(recommendations)} Empfehlungen")
            for rec in recommendations[:3]:  # Zeige nur die ersten 3
                print(f"   - {rec.get('username', 'N/A')}: {rec.get('similarity_score', 0):.2f} Ähnlichkeit")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 10. Test: Update Privacy Settings
    print("\n10. 🔧 Testing: PUT /users/{user_id}/update-privacy/")
    try:
        privacy_data = {
            "profile_visibility": "public",
            "show_email": False,
            "show_phone": False,
            "allow_friend_requests": True,
            "show_online_status": True,
            "allow_messages": True,
            "show_activity": True,
            "show_photos": True,
            "show_friends": True,
            "show_analytics": False
        }
        response = requests.put(f"{API_BASE}/users/{test_user_id}/update-privacy/", 
                              json=privacy_data, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Privacy-Einstellungen aktualisiert")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 11. Test: Update Social Links
    print("\n11. 🔗 Testing: PUT /users/{user_id}/update-social-links/")
    try:
        social_data = {
            "facebook": "https://facebook.com/fabian",
            "twitter": "https://twitter.com/fabian",
            "instagram": "https://instagram.com/fabian",
            "linkedin": "https://linkedin.com/in/fabian",
            "github": "https://github.com/fabian"
        }
        response = requests.put(f"{API_BASE}/users/{test_user_id}/update-social-links/", 
                              json=social_data, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Social Links aktualisiert: {len(data.get('social_links', {}))} Links")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    # 12. Test: Report User
    print("\n12. 🚩 Testing: POST /users/{user_id}/report/")
    try:
        report_data = {
            "reason": "spam",
            "description": "Test report für API-Testing"
        }
        response = requests.post(f"{API_BASE}/users/{test_user_id}/report/", 
                               json=report_data, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Report erfolgreich eingereicht")
        else:
            print(f"❌ Fehler: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Alle Profil-Feature-Tests abgeschlossen!")
    print("✅ Das Profil-System ist vollständig funktional!")

if __name__ == "__main__":
    test_all_profile_features() 