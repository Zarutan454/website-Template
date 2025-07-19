from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/chat/$', consumers.MessagingConsumer.as_asgi()),
    re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
    re_path(r'ws/mining/$', consumers.MiningConsumer.as_asgi()),
    re_path(r'ws/blockchain/$', consumers.BlockchainConsumer.as_asgi()),
] 