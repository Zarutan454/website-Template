#!/usr/bin/env python
"""
Skript zum Erstellen eines Testbenutzers für BSN
"""
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password

User = get_user_model()

def create_test_user():
    """Create test user with specified credentials"""
    email = 'fabian@bsn.com'
    username = 'fabian'
    password = 'Ostblokk1993'
    
    # Check if user exists
    user = User.objects.filter(email=email).first()
    
    if user:
        print(f"User exists: {user.username}")
        print(f"User active: {user.is_active}")
        # Update password
        user.set_password(password)
        user.is_active = True
        user.save()
        print("Password updated and user activated")
    else:
        # Create new user
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            is_active=True
        )
        print(f"User created: {user.username}")
    
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"Active: {user.is_active}")
    print("Test user ready!")

if __name__ == '__main__':
    create_test_user() 