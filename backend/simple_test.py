#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.contrib.auth import get_user_model
from users.serializers import UserSerializer

User = get_user_model()

print("=== Testing User Model & Serializer ===")

# Check if users exist
user_count = User.objects.count()
print(f"Total users: {user_count}")

if user_count == 0:
    # Create a test user
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )
    print(f"Created test user: {user.username}")
else:
    user = User.objects.first()
    print(f"Using existing user: {user.username}")

# Test the serializer
print("\n=== Testing UserSerializer ===")
try:
    serializer = UserSerializer(user)
    data = serializer.data
    print("✅ Serializer works!")
    print("User data:")
    for key, value in data.items():
        print(f"  {key}: {value}")
except Exception as e:
    print(f"❌ Serializer error: {e}")

print("\n=== Testing User Model Properties ===")
print(f"User ID: {user.id}")
print(f"Username: {user.username}")
print(f"Email: {user.email}")
print(f"Full name: {user.full_name}")
print(f"First name: {user.first_name}")
print(f"Last name: {user.last_name}")
print(f"Is alpha user: {user.is_alpha_user}")
print(f"Wallet address: {user.wallet_address}")
print(f"Created at: {user.created_at}") 