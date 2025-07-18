#!/usr/bin/env python
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from bsn_social_network.models import Post, User
from bsn_social_network.serializers import PostSerializer, UserProfileSerializer
from rest_framework.test import APIRequestFactory

def debug_users():
    """Debug User-Daten und Posts"""
    print("=== USER DEBUG ===")
    
    # Alle User abrufen
    users = User.objects.all()
    print(f"Anzahl User: {users.count()}")
    
    if users.count() == 0:
        print("Keine User gefunden!")
        return
    
    # Ersten User analysieren
    user = users.first()
    print(f"\n=== ERSTER USER ===")
    print(f"User ID: {user.id}")
    print(f"Username: {user.username}")
    print(f"Email: {user.email}")
    print(f"First Name: '{user.first_name}'")
    print(f"Last Name: '{user.last_name}'")
    print(f"Is Active: {user.is_active}")
    
    # UserProfileSerializer testen
    serializer = UserProfileSerializer(user)
    user_data = serializer.data
    print(f"\n=== USERPROFILE SERIALIZER ===")
    print(f"Display Name: {user_data.get('display_name')}")
    print(f"Username: {user_data.get('username')}")
    print(f"Avatar URL: {user_data.get('avatar_url')}")
    print(f"Is Verified: {user_data.get('is_verified')}")
    
    # Posts abrufen
    posts = Post.objects.all().select_related('author')[:3]
    print(f"\n=== POSTS DEBUG ===")
    print(f"Anzahl Posts: {posts.count()}")
    
    if posts.count() == 0:
        print("Keine Posts gefunden!")
        return
    
    # Ersten Post analysieren
    post = posts.first()
    print(f"\n=== ERSTER POST ===")
    print(f"Post ID: {post.id}")
    print(f"Content: {post.content[:50]}...")
    print(f"Author ID: {post.author_id}")
    print(f"Author: {post.author}")
    
    if post.author:
        print(f"Author Username: {post.author.username}")
        print(f"Author First Name: '{post.author.first_name}'")
        print(f"Author Last Name: '{post.author.last_name}'")
        print(f"Author Is Active: {post.author.is_active}")
    else:
        print("WARNUNG: Post hat keinen Author!")
    
    # PostSerializer testen
    factory = APIRequestFactory()
    request = factory.get('/')
    request.user = user  # Authentifizierter User für Context
    
    serializer = PostSerializer(post, context={'request': request})
    post_data = serializer.data
    print(f"\n=== POST SERIALIZER ===")
    print(f"Post ID: {post_data.get('id')}")
    print(f"Author: {post_data.get('author')}")
    
    if post_data.get('author'):
        author_data = post_data['author']
        print(f"Author ID: {author_data.get('id')}")
        print(f"Author Username: {author_data.get('username')}")
        print(f"Author Display Name: {author_data.get('display_name')}")
        print(f"Author Avatar URL: {author_data.get('avatar_url')}")
        print(f"Author Is Verified: {author_data.get('is_verified')}")
    else:
        print("WARNUNG: Post hat keine Author-Daten im Serializer!")

if __name__ == "__main__":
    debug_users() 