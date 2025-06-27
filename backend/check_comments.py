#!/usr/bin/env python
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from bsn_social_network.models import Comment, Post

def check_comments():
    print("=== Checking Comments in Database ===")
    
    # Check total comments
    total_comments = Comment.objects.count()
    print(f"Total comments in database: {total_comments}")
    
    # Check comments for post 16 specifically
    post_16_comments = Comment.objects.filter(post_id=16)
    print(f"Comments for post 16: {post_16_comments.count()}")
    
    # Show comment details for post 16
    if post_16_comments.exists():
        print("\nComments for post 16:")
        for comment in post_16_comments:
            print(f"  - Comment {comment.id}: '{comment.content}' by {comment.author.username}")
    
    # Check all comments
    print(f"\nAll comments:")
    for comment in Comment.objects.all():
        print(f"  - Comment {comment.id} on Post {comment.post_id}: '{comment.content}' by {comment.author.username}")
    
    # Test API serialization
    print(f"\n=== Testing API Serialization ===")
    from bsn_social_network.serializers import CommentSerializer
    from rest_framework.test import APIRequestFactory
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    user = User.objects.first()
    
    factory = APIRequestFactory()
    request = factory.get('/api/comments/')
    request.user = user
    
    comments = Comment.objects.filter(post_id=16)
    serializer = CommentSerializer(comments, many=True, context={'request': request})
    print(f"Serialized comments for post 16: {len(serializer.data)}")
    
    for comment_data in serializer.data:
        print(f"  - Serialized: ID={comment_data.get('id')}, Content='{comment_data.get('content')}', Author={comment_data.get('author', {}).get('username')}")

if __name__ == "__main__":
    check_comments() 