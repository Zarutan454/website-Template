#!/usr/bin/env python
"""
Script to create test notifications for testing the notification system
"""

import os
import sys
import django
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bsn.settings')
django.setup()

from django.contrib.auth import get_user_model
from bsn_social_network.models import Notification, NotificationSettings

User = get_user_model()

def create_test_notifications():
    """Create test notifications for the first user"""
    
    # Get the first user (or create one if none exists)
    try:
        user = User.objects.first()
        if not user:
            print("No users found. Please create a user first.")
            return
        
        print(f"Creating test notifications for user: {user.username}")
        
        # Create notification settings if they don't exist
        settings, created = NotificationSettings.objects.get_or_create(user=user)
        if created:
            print("Created notification settings for user")
        
        # Create test notifications
        test_notifications = [
            {
                'type': 'like',
                'reference_id': 1,
                'content': 'Someone liked your post'
            },
            {
                'type': 'comment', 
                'reference_id': 1,
                'content': 'Someone commented on your post'
            },
            {
                'type': 'friend_request',
                'reference_id': 2,
                'content': 'New friend request received'
            },
            {
                'type': 'message',
                'reference_id': 1,
                'content': 'New message received'
            },
            {
                'type': 'group_invite',
                'reference_id': 1,
                'content': 'You were invited to join a group'
            }
        ]
        
        created_count = 0
        for notification_data in test_notifications:
            notification, created = Notification.objects.get_or_create(
                user=user,
                type=notification_data['type'],
                reference_id=notification_data['reference_id'],
                defaults={
                    'is_read': False
                }
            )
            if created:
                created_count += 1
                print(f"Created notification: {notification_data['type']}")
        
        print(f"Created {created_count} new test notifications")
        
        # Show all notifications for the user
        all_notifications = Notification.objects.filter(user=user).order_by('-created_at')
        print(f"\nTotal notifications for user: {all_notifications.count()}")
        
        for notification in all_notifications[:5]:  # Show last 5
            print(f"- {notification.type}: {notification.is_read} (created: {notification.created_at})")
            
    except Exception as e:
        print(f"Error creating test notifications: {e}")

if __name__ == '__main__':
    create_test_notifications() 