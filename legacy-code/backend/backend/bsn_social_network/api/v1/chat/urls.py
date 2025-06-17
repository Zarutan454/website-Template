from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from .views import ChatViewSet, ChatMessageViewSet

# Hauptrouter für Chats
router = DefaultRouter()
router.register(r'', ChatViewSet, basename='chat')

# Verschachtelter Router für Nachrichten innerhalb eines Chats
chat_messages_router = NestedDefaultRouter(router, r'', lookup='chat')
chat_messages_router.register(r'messages', ChatMessageViewSet, basename='chat-messages')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(chat_messages_router.urls)),
] 