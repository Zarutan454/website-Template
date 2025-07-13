import requests

BASE_URL = 'http://localhost:8000/api'
USERNAME = 'Fabian'
PASSWORD = 'Ostblokk1993'  # Korrigiertes Passwort

# 1. Login
login_url = f'{BASE_URL}/users/login/'
login_data = {'username': USERNAME, 'password': PASSWORD}
session = requests.Session()
resp = session.post(login_url, json=login_data)
print('Login-Response:', resp.text)  # Debug-Ausgabe
if resp.status_code != 200:
    print('Login fehlgeschlagen:', resp.text)
    exit(1)

data = resp.json()
access_token = data.get('access_token')
if not access_token:
    print('Kein access_token im Login-Response!')
    exit(1)

# 2. Profil-API abfragen (mit Bearer-Token)
profile_url = f'{BASE_URL}/users/profile/{USERNAME}/'
headers = {'Authorization': f'Bearer {access_token}'}
resp = session.get(profile_url, headers=headers)
if resp.status_code != 200:
    print('Profil-API-Fehler:', resp.text)
    exit(1)

profile = resp.json()
print('Profil-API-Response:')
import json
print(json.dumps(profile, indent=2, ensure_ascii=False))

# About-Felder gezielt ausgeben
about = profile.get('profile') or profile.get('userprofile') or {}
print('\nAbout-Felder:')
for key in ['bio', 'occupation', 'company', 'interests', 'skills', 'social_media_links']:
    print(f'{key}:', about.get(key)) 