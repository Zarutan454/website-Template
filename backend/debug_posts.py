#!/usr/bin/env python
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn_social_network.settings')
django.setup()

from bsn_social_network.models import Post, User
from bsn_social_network.serializers import PostSerializer
from rest_framework.test import APIRequestFactory

def debug_posts():
    """Debug Posts und User-Daten"""
    print("=== POST DEBUG ===")
    
    # Alle Posts abrufen
    posts = Post.objects.all().select_related('author')
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
        print(f"Author First Name: {post.author.first_name}")
        print(f"Author Last Name: {post.author.last_name}")
        print(f"Author Email: {post.author.email}")
        print(f"Author is_active: {post.author.is_active}")
    else:
        print("❌ POST HAT KEINEN AUTHOR!")
    
    # Serializer testen
    print(f"\n=== SERIALIZER TEST ===")
    factory = APIRequestFactory()
    request = factory.get('/')
    request.user = post.author if post.author else None
    
    serializer = PostSerializer(post, context={'request': request})
    data = serializer.data
    print(f"Serialized data:")
    print(f"  - id: {data.get('id')}")
    print(f"  - content: {data.get('content')[:50]}...")
    
    author_data = data.get('author')
    if author_data:
        print(f"  - author.id: {author_data.get('id')}")
        print(f"  - author.username: {author_data.get('username')}")
        print(f"  - author.display_name: {author_data.get('display_name')}")
        print(f"  - author.avatar_url: {author_data.get('avatar_url')}")
        print(f"  - author.is_verified: {author_data.get('is_verified')}")
    else:
        print("❌ KEINE AUTHOR-DATEN IM SERIALIZER!")
    
    # Alle User überprüfen
    print(f"\n=== ALLE USER ===")
    users = User.objects.all()
    print(f"Anzahl User: {users.count()}")
    
    for user in users[:5]:  # Erste 5 User
        print(f"  - ID: {user.id}, Username: {user.username}, Name: {user.first_name} {user.last_name}, Active: {user.is_active}")
    
    # Posts ohne Author finden
    posts_without_author = Post.objects.filter(author__isnull=True)
    if posts_without_author.exists():
        print(f"\n❌ WARNUNG: {posts_without_author.count()} Posts ohne Author gefunden!")
        for p in posts_without_author:
            print(f"  - Post ID {p.id}: {p.content[:30]}...")
    else:
        print(f"\n✅ Alle Posts haben einen Author")

if __name__ == "__main__":
    debug_posts() 