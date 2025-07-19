#!/usr/bin/env python
"""
Debug-Script für Gruppen-Posts
"""
import os
import sys
import django

# Django Setup
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from bsn_social_network.models import Post, Group, User
from django_filters import rest_framework as filters
from rest_framework.filters import DjangoFilterBackend

def test_group_posts():
    print("=== DEBUG: Gruppen-Posts Test ===")
    
    # 1. Teste ob Gruppen existieren
    groups = Group.objects.all()
    print(f"Anzahl Gruppen: {groups.count()}")
    for group in groups[:3]:
        print(f"  - Gruppe {group.id}: {group.name}")
    
    # 2. Teste ob Posts mit Gruppen existieren
    posts_with_group = Post.objects.filter(group__isnull=False)
    print(f"\nPosts mit Gruppe: {posts_with_group.count()}")
    for post in posts_with_group[:5]:
        print(f"  - Post {post.id}: '{post.content[:50]}...' -> Gruppe: {post.group.name if post.group else 'None'}")
    
    # 3. Teste Filterung
    if groups.exists():
        test_group = groups.first()
        print(f"\nTeste Filterung für Gruppe: {test_group.name} (ID: {test_group.id})")
        
        # Manuelle Filterung
        filtered_posts = Post.objects.filter(group=test_group)
        print(f"Manuell gefilterte Posts: {filtered_posts.count()}")
        for post in filtered_posts[:3]:
            print(f"  - Post {post.id}: '{post.content[:50]}...'")
        
        # Teste Django-Filter
        from django_filters import rest_framework as filters
        from rest_framework.filters import DjangoFilterBackend
        
        # Simuliere Request mit group Parameter
        class MockRequest:
            def __init__(self, group_id):
                self.query_params = {'group': str(group_id)}
        
        mock_request = MockRequest(test_group.id)
        
        # Teste FilterBackend
        filter_backend = DjangoFilterBackend()
        queryset = Post.objects.all()
        
        # Simuliere ViewSet
        class MockViewSet:
            filter_backends = [DjangoFilterBackend]
            filterset_fields = ['group', 'author']
        
        mock_viewset = MockViewSet()
        
        try:
            filtered_qs = filter_backend.filter_queryset(mock_request, queryset, mock_viewset)
            print(f"Django-Filter gefilterte Posts: {filtered_qs.count()}")
            for post in filtered_qs[:3]:
                print(f"  - Post {post.id}: '{post.content[:50]}...'")
        except Exception as e:
            print(f"Fehler beim Django-Filter: {e}")
    
    # 4. Teste API-Endpunkt
    print(f"\n=== API-Endpunkt Test ===")
    print(f"GET /api/posts/?group={test_group.id if groups.exists() else '1'}")
    print("Erwartete URL: http://localhost:8000/api/posts/?group=1")

if __name__ == '__main__':
    test_group_posts() 