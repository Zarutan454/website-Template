#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from bsn_social_network.models import Comment, Post, User
from rest_framework.test import APIRequestFactory
from bsn_social_network.views import CommentViewSet

def test_comment_like():
    print("=== Testing Comment Like Endpoint ===")
    
    # Get a user and comment
    user = User.objects.first()
    comment = Comment.objects.first()
    
    if not user or not comment:
        print("❌ No user or comment found")
        return
    
    print(f"Testing like for comment {comment.id} by user {user.username}")
    
    # Create API request
    factory = APIRequestFactory()
    request = factory.post(f'/api/comments/{comment.id}/like/')
    request.user = user
    
    # Test the like endpoint
    view = CommentViewSet()
    view.request = request
    view.kwargs = {'pk': comment.id}
    
    try:
        response = view.like(request, pk=comment.id)
        print(f"✅ Like response: {response.data}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test like again (should unlike)
    try:
        response = view.like(request, pk=comment.id)
        print(f"✅ Unlike response: {response.data}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_comment_like() 