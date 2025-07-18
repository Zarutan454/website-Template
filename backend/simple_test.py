#!/usr/bin/env python
"""
Einfaches Test-Skript für Gruppen-Endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_login():
    """Teste Login"""
    print("=== Testing Login ===")
    
    login_data = {
        "username": "testuser",
        "password": "test123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login/", json=login_data)
        print(f"Login Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            return data.get('token')  # Django REST Framework verwendet 'token' statt 'access'
        else:
            return None
    except Exception as e:
        print(f"Login Error: {e}")
        return None

def test_groups(token):
    """Teste Gruppen-Endpoints"""
    print("\n=== Testing Groups ===")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Test groups list
    try:
        response = requests.get(f"{BASE_URL}/groups/", headers=headers)
        print(f"Groups Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Groups found: {len(data.get('results', []))}")
        else:
            print(f"Groups Error: {response.text}")
    except Exception as e:
        print(f"Groups Error: {e}")

if __name__ == "__main__":
    token = test_login()
    if token:
        test_groups(token)
    else:
        print("Login failed!") 