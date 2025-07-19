#!/usr/bin/env python
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def generate_token_for_user(username):
    try:
        user = User.objects.get(username=username)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        print(f"Token für User '{username}' (ID: {user.id}):")
        print(f"Access Token: {access_token}")
        print(f"Refresh Token: {refresh_token}")
        print(f"Token Type: {refresh.access_token.token_type}")
        print(f"Expires: {refresh.access_token.current_time + refresh.access_token.lifetime}")
        
        return access_token, refresh_token
    except User.DoesNotExist:
        print(f"User '{username}' nicht gefunden")
        return None, None

if __name__ == "__main__":
    if len(sys.argv) > 1:
        username = sys.argv[1]
    else:
        username = "Fabian"  # Default user
    
    generate_token_for_user(username) 