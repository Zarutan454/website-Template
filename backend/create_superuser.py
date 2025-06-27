#!/usr/bin/env python
"""
Erstellt automatisch einen Superuser
"""
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def create_superuser():
    """Erstellt einen Superuser mit festen Credentials"""
    
    username = 'admin'
    email = 'admin@bsn.network'
    password = 'admin123'
    
    # Prüfe, ob User bereits existiert
    if User.objects.filter(username=username).exists():
        print(f"✅ Superuser '{username}' existiert bereits")
        return
    
    # Erstelle Superuser
    try:
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        print(f"✅ Superuser erfolgreich erstellt!")
        print(f"   Username: {username}")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   ID: {user.id}")
        
    except Exception as e:
        print(f"❌ Fehler beim Erstellen des Superusers: {e}")

if __name__ == '__main__':
    create_superuser() 