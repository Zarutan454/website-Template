#!/usr/bin/env python
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.urls import get_resolver

def test_url_patterns():
    """Test if the profile about URL pattern exists"""
    resolver = get_resolver()
    
    print("Testing URL patterns...")
    
    # Check if the specific URL pattern exists
    try:
        from users.urls import urlpatterns
        print("URL patterns found in users app:")
        for pattern in urlpatterns:
            print(f"  - {pattern.pattern}")
            if 'profile/about' in str(pattern.pattern):
                print(f"    ✓ Found profile/about pattern: {pattern.pattern}")
    except Exception as e:
        print(f"Error checking URL patterns: {e}")
    
    # Test the full URL resolution
    try:
        from django.urls import reverse
        url = reverse('users_app:profile-about-update')
        print(f"✓ URL reverse lookup successful: {url}")
    except Exception as e:
        print(f"✗ URL reverse lookup failed: {e}")

if __name__ == '__main__':
    test_url_patterns() 