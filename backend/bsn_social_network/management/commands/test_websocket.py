from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json

class Command(BaseCommand):
    help = 'Test WebSocket connections'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Testing WebSocket connections...'))
        
        channel_layer = get_channel_layer()
        
        # Test feed WebSocket
        try:
            async_to_sync(channel_layer.group_send)(
                'feed_updates',
                {
                    'type': 'new_post',
                    'post': {
                        'id': 1,
                        'content': 'Test post from management command',
                        'author': {
                            'id': 1,
                            'username': 'testuser',
                            'display_name': 'Test User'
                        }
                    }
                }
            )
            self.stdout.write(self.style.SUCCESS('✓ Feed WebSocket test message sent'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Feed WebSocket test failed: {e}'))
        
        # Test notification WebSocket
        try:
            async_to_sync(channel_layer.group_send)(
                'notifications',
                {
                    'type': 'new_notification',
                    'notification': {
                        'id': 1,
                        'type': 'test',
                        'message': 'Test notification from management command'
                    }
                }
            )
            self.stdout.write(self.style.SUCCESS('✓ Notification WebSocket test message sent'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Notification WebSocket test failed: {e}'))
        
        self.stdout.write(self.style.SUCCESS('WebSocket test completed')) 