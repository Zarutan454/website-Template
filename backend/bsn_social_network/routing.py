from django.urls import re_path
from . import consumers
from .consumers import PresenceConsumer

websocket_urlpatterns = [
    # Test WebSocket - Simple connection test
    re_path(r'ws/test/$', consumers.TestConsumer.as_asgi()),
    
    # Generic Chat WebSocket - General chat endpoint (no conversation_id required)
    re_path(r'ws/chat/$', consumers.GenericChatConsumer.as_asgi()),
    
    # Messaging WebSocket - Conversation specific
    re_path(r'ws/messaging/(?P<conversation_id>\w+)/$', consumers.MessagingConsumer.as_asgi()),
    
    # Feed WebSocket - Real-time feed updates
    re_path(r'ws/feed/$', consumers.FeedConsumer.as_asgi()),
    
    # Notifications WebSocket - Real-time notifications
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
    
    # Mining WebSocket - Real-time mining updates
    re_path(r'ws/mining/$', consumers.MiningConsumer.as_asgi()),
    
    # Blockchain WebSocket - Real-time blockchain updates
    re_path(r'ws/blockchain/$', consumers.BlockchainConsumer.as_asgi()),
    
    # Video Call WebSocket - VideoCall Signaling
    re_path(r'ws/video-call/(?P<room_id>\w+)/$', consumers.VideoCallConsumer.as_asgi()),
    
    # Presence WebSocket - Real-time presence updates
    re_path(r'ws/presence/$', PresenceConsumer.as_asgi()),
] 