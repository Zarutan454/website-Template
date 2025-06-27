#!/usr/bin/env python
"""
Test Email-basierte Anmeldung für BSN
"""
import requests
import json

def test_email_login():
    """Testet die Login-API mit Email"""
    url = "http://localhost:8000/api/v1/users/login/"
    data = {
        "email": "test@bsn.network",
        "password": "Ostblokk1993"
    }
    
    try:
        print("🧪 Teste Email-Login-API...")
        print(f"📡 URL: {url}")
        print(f"📝 Data: {json.dumps(data, indent=2)}")
        
        response = requests.post(url, json=data)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Email-Login erfolgreich!")
            print(f"🔑 Access Token: {result.get('access_token', 'N/A')[:50]}...")
            print(f"👤 User: {result.get('user', {}).get('username', 'N/A')}")
            print(f"📧 Email: {result.get('user', {}).get('email', 'N/A')}")
            return True
        else:
            print("❌ Email-Login fehlgeschlagen!")
            try:
                error_data = response.json()
                print(f"🚨 Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"🚨 Response Text: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Verbindungsfehler: Backend läuft nicht!")
        return False
    except Exception as e:
        print(f"❌ Unerwarteter Fehler: {e}")
        return False

if __name__ == '__main__':
    print("🚀 BSN Email-Login-Test wird gestartet...\n")
    
    success = test_email_login()
    
    if success:
        print("\n🎉 Email-Login funktioniert!")
        print("💡 Das Frontend kann jetzt Email-Anmeldung verwenden!")
    else:
        print("\n❌ Email-Login fehlgeschlagen!")
        print("💡 Prüfe Backend-Konfiguration") 