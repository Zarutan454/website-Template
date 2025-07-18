#!/usr/bin/env python
"""
Debug-Script für author_role Problem
"""
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from bsn_social_network.models import Post, Group, GroupMembership, User
from bsn_social_network.serializers import PostSerializer
from rest_framework.test import APIRequestFactory

def debug_author_role():
    print("=== DEBUG: Author Role Problem ===")
    
    # 1. Teste Posts mit Gruppen
    posts_with_group = Post.objects.filter(group__isnull=False)
    print(f"Posts mit Gruppe: {posts_with_group.count()}")
    
    if posts_with_group.exists():
        post = posts_with_group.first()
        print(f"\nErster Post:")
        print(f"  - ID: {post.id}")
        print(f"  - Author: {post.author.username}")
        print(f"  - Group: {post.group.name}")
        
        # 2. Teste Mitgliedschaft
        try:
            membership = GroupMembership.objects.get(group=post.group, user=post.author)
            print(f"  - Membership Role: {membership.role}")
        except GroupMembership.DoesNotExist:
            print(f"  - Keine Mitgliedschaft gefunden!")
        
        # 3. Teste Serializer
        factory = APIRequestFactory()
        request = factory.get('/')
        serializer = PostSerializer(post, context={'request': request})
        data = serializer.data
        print(f"  - Serializer author_role: {data.get('author_role')}")
        
        # 4. Debug get_author_role Methode
        author_role = serializer.get_author_role(post)
        print(f"  - get_author_role result: {author_role}")
        
    else:
        print("Keine Posts mit Gruppen gefunden!")
    
    # 5. Teste alle Gruppenmitgliedschaften
    memberships = GroupMembership.objects.all()
    print(f"\nAlle Gruppenmitgliedschaften: {memberships.count()}")
    for membership in memberships[:5]:
        print(f"  - {membership.user.username} in {membership.group.name}: {membership.role}")

if __name__ == "__main__":
    debug_author_role() 