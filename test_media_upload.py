#!/usr/bin/env python3
"""
Test-Script für Media-Upload-Problem
Analysiert und testet das Foto/Video-Upload-System
"""

import requests
import json
import os
import time
from pathlib import Path

# Konfiguration
BASE_URL = "http://localhost:8000"
API_BASE = f"{BASE_URL}/api"

def print_section(title):
    print(f"\n{'='*50}")
    print(f" {title}")
    print(f"{'='*50}")

def print_step(step, description):
    print(f"\n--- Schritt {step}: {description}")

def test_backend_health():
    """Test 1: Backend-Verfügbarkeit prüfen"""
    print_step(1, "Backend-Verfügbarkeit prüfen")
    
    try:
        response = requests.get(f"{BASE_URL}/admin/", timeout=5)
        print(f"✅ Backend erreichbar: {response.status_code}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend nicht erreichbar: {e}")
        return False

def test_media_directory():
    """Test 2: Media-Verzeichnis prüfen"""
    print_step(2, "Media-Verzeichnis prüfen")
    
    media_dir = Path("backend/media/posts")
    if media_dir.exists():
        print(f"✅ Media-Verzeichnis existiert: {media_dir}")
        files = list(media_dir.glob("*"))
        print(f"   Dateien im Verzeichnis: {len(files)}")
        for file in files[:5]:  # Zeige erste 5 Dateien
            print(f"   - {file.name}")
        return True
    else:
        print(f"❌ Media-Verzeichnis fehlt: {media_dir}")
        print("   Erstelle Verzeichnis...")
        media_dir.mkdir(parents=True, exist_ok=True)
        print(f"✅ Media-Verzeichnis erstellt: {media_dir}")
        return True

def create_test_image():
    """Test 3: Test-Bild erstellen"""
    print_step(3, "Test-Bild erstellen")
    
    # Erstelle ein einfaches Test-Bild (1x1 Pixel PNG)
    test_image_path = "test_image.png"
    
    # PNG Header für 1x1 Pixel transparentes Bild
    png_data = bytes.fromhex(
        "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c489"
        "0000000d4944415478da636400000000020001e565b8d00000000049454e44ae42"
        "6082"
    )
    
    with open(test_image_path, "wb") as f:
        f.write(png_data)
    
    print(f"✅ Test-Bild erstellt: {test_image_path}")
    return test_image_path

def test_upload_without_auth():
    """Test 4: Upload ohne Authentifizierung"""
    print_step(4, "Upload ohne Authentifizierung testen")
    
    test_image = create_test_image()
    
    try:
        with open(test_image, "rb") as f:
            files = {"file": f}
            response = requests.post(f"{API_BASE}/upload/media/", files=files)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ Erwartetes Verhalten: Upload ohne Auth verweigert")
            return True
        else:
            print("❌ Unerwartetes Verhalten: Upload ohne Auth sollte verweigert werden")
            return False
            
    except Exception as e:
        print(f"❌ Fehler beim Test: {e}")
        return False
    finally:
        if os.path.exists(test_image):
            os.remove(test_image)

def get_auth_token():
    """Test 5: Authentifizierung und Token holen"""
    print_step(5, "Authentifizierung und Token holen")
    
    # Test-User erstellen/anmelden
    login_data = {
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    try:
        # Versuche Login
        response = requests.post(f"{API_BASE}/login/", json=login_data)
        
        if response.status_code == 200:
            token_data = response.json()
            access_token = token_data.get('access')
            print(f"✅ Login erfolgreich, Token erhalten")
            return access_token
        elif response.status_code == 400:
            # User existiert nicht, erstelle ihn
            print("User existiert nicht, erstelle Test-User...")
            register_data = {
                "email": "test@example.com",
                "password": "testpass123",
                "username": "testuser"
            }
            
            register_response = requests.post(f"{API_BASE}/register/", json=register_data)
            if register_response.status_code == 201:
                print("✅ Test-User erstellt")
                # Jetzt Login versuchen
                login_response = requests.post(f"{API_BASE}/login/", json=login_data)
                if login_response.status_code == 200:
                    token_data = login_response.json()
                    access_token = token_data.get('access')
                    print(f"✅ Login erfolgreich nach Registrierung")
                    return access_token
                else:
                    print(f"❌ Login nach Registrierung fehlgeschlagen: {login_response.text}")
                    return None
            else:
                print(f"❌ Registrierung fehlgeschlagen: {register_response.text}")
                return None
        else:
            print(f"❌ Login fehlgeschlagen: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Fehler bei Authentifizierung: {e}")
        return None

def test_upload_with_auth(token):
    """Test 6: Upload mit Authentifizierung"""
    print_step(6, "Upload mit Authentifizierung testen")
    
    if not token:
        print("❌ Kein Token verfügbar")
        return False
    
    test_image = create_test_image()
    
    try:
        headers = {
            "Authorization": f"Bearer {token}"
        }
        
        with open(test_image, "rb") as f:
            files = {"file": f}
            print(f"Sende Upload-Request...")
            print(f"Headers: {headers}")
            print(f"Files: {[f.name for f in files.values()]}")
            
            response = requests.post(
                f"{API_BASE}/upload/media/", 
                headers=headers, 
                files=files
            )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Upload erfolgreich!")
            print(f"   URL: {data.get('url')}")
            print(f"   Filename: {data.get('filename')}")
            print(f"   Size: {data.get('size')}")
            print(f"   Content-Type: {data.get('content_type')}")
            return data.get('url')
        else:
            print(f"❌ Upload fehlgeschlagen")
            return None
            
    except Exception as e:
        print(f"❌ Fehler beim Upload: {e}")
        return None
    finally:
        if os.path.exists(test_image):
            os.remove(test_image)

def test_post_creation_with_media(token, media_url):
    """Test 7: Post mit Media erstellen"""
    print_step(7, "Post mit Media erstellen")
    
    if not token or not media_url:
        print("❌ Token oder Media-URL fehlt")
        return False
    
    post_data = {
        "content": "Test-Post mit Bild - erstellt von Test-Script",
        "media_url": media_url,
        "media_type": "image",
        "hashtags": ["test", "upload", "script"]
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/posts/",
            headers=headers,
            json=post_data
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            data = response.json()
            print(f"✅ Post erfolgreich erstellt!")
            print(f"   Post ID: {data.get('id')}")
            print(f"   Content: {data.get('content')}")
            print(f"   Media URL: {data.get('media_url')}")
            return data.get('id')
        else:
            print(f"❌ Post-Erstellung fehlgeschlagen")
            return None
            
    except Exception as e:
        print(f"❌ Fehler bei Post-Erstellung: {e}")
        return None

def test_media_accessibility(media_url):
    """Test 8: Media-Zugriff testen"""
    print_step(8, "Media-Zugriff testen")
    
    if not media_url:
        print("❌ Keine Media-URL verfügbar")
        return False
    
    try:
        response = requests.get(media_url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        print(f"Content-Length: {response.headers.get('content-length')}")
        
        if response.status_code == 200:
            print("✅ Media ist zugänglich")
            return True
        else:
            print("❌ Media ist nicht zugänglich")
            return False
            
    except Exception as e:
        print(f"❌ Fehler beim Media-Zugriff: {e}")
        return False

def analyze_frontend_upload():
    """Test 9: Frontend-Upload-Logik analysieren"""
    print_step(9, "Frontend-Upload-Logik analysieren")
    
    # Prüfe die aktuelle Upload-Implementierung
    upload_function = """
    const uploadMediaToDjango = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/upload/media/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.url;
        } catch (error) {
            console.error('Media upload error:', error);
            throw new Error('Failed to upload media');
        }
    };
    """
    
    print("Frontend Upload-Funktion:")
    print(upload_function)
    print("\nMögliche Probleme:")
    print("1. Authorization Header fehlt oder ist falsch")
    print("2. FormData wird nicht korrekt erstellt")
    print("3. File-Objekt ist nicht gültig")
    print("4. CORS-Probleme")
    print("5. Backend-URL ist falsch")

def main():
    """Hauptfunktion für alle Tests"""
    print_section("MEDIA UPLOAD PROBLEM ANALYSE")
    
    # Tests durchführen
    tests = [
        ("Backend Health", test_backend_health),
        ("Media Directory", test_media_directory),
        ("Upload ohne Auth", test_upload_without_auth),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ Test '{test_name}' fehlgeschlagen: {e}")
            results[test_name] = False
    
    # Authentifizierung testen
    token = get_auth_token()
    if token:
        results["Authentication"] = True
        
        # Upload mit Auth testen
        media_url = test_upload_with_auth(token)
        if media_url:
            results["Upload with Auth"] = True
            
            # Post mit Media erstellen
            post_id = test_post_creation_with_media(token, media_url)
            if post_id:
                results["Post Creation"] = True
            else:
                results["Post Creation"] = False
            
            # Media-Zugriff testen
            media_accessible = test_media_accessibility(media_url)
            results["Media Accessibility"] = media_accessible
        else:
            results["Upload with Auth"] = False
    else:
        results["Authentication"] = False
    
    # Frontend-Analyse
    analyze_frontend_upload()
    
    # Zusammenfassung
    print_section("TEST ERGEBNISSE")
    for test_name, result in results.items():
        status = "✅ BESTANDEN" if result else "❌ FEHLGESCHLAGEN"
        print(f"{test_name}: {status}")
    
    # Empfehlungen
    print_section("EMPFEHLUNGEN")
    if not results.get("Backend Health", False):
        print("1. Starte das Django-Backend: python manage.py runserver")
    if not results.get("Authentication", False):
        print("2. Überprüfe die Benutzerregistrierung/Login-API")
    if not results.get("Upload with Auth", False):
        print("3. Überprüfe die Upload-API und Berechtigungen")
    if not results.get("Media Accessibility", False):
        print("4. Überprüfe die Media-URL-Konfiguration")
    if not results.get("Post Creation", False):
        print("5. Überprüfe die Post-Erstellungs-API")

if __name__ == "__main__":
    main() 