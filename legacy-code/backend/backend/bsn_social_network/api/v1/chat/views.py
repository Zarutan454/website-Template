from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from django.conf import settings

from bsn_social_network.models import Chat, ChatMessage
from .serializers import ChatSerializer, ChatMessageSerializer, ChatCreateSerializer

class ChatViewSet(viewsets.ModelViewSet):
    """
    API Endpunkt für Chats
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChatSerializer

    def get_queryset(self):
        """
        Gibt alle Chats zurück, an denen der aktuelle Benutzer teilnimmt
        """
        user = self.request.user
        return Chat.objects.filter(participants=user).order_by('-updated_at')

    def get_serializer_class(self):
        """
        Gibt den passenden Serializer je nach Aktion zurück
        """
        if self.action == 'create':
            return ChatCreateSerializer
        return ChatSerializer

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        """
        Markiert alle Nachrichten in einem Chat als gelesen
        """
        chat = self.get_object()
        user = request.user
        
        # Alle ungelesenen Nachrichten finden, die nicht vom aktuellen Benutzer stammen
        unread_messages = ChatMessage.objects.filter(
            chat=chat,
            is_read=False
        ).exclude(sender=user)
        
        # Als gelesen markieren
        unread_messages.update(is_read=True)
        
        return Response({'status': 'messages marked as read'})

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """
        Gibt alle Nachrichten eines Chats zurück
        """
        chat = self.get_object()
        messages = chat.messages.all()
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['get'])
    def websocket_url(self, request, pk=None):
        """
        Gibt die WebSocket-URL für einen Chat zurück
        """
        chat = self.get_object()
        protocol = 'wss' if request.is_secure() else 'ws'
        host = request.get_host()
        
        # Stelle sicher, dass der Benutzer am Chat teilnimmt
        if not chat.participants.filter(id=request.user.id).exists():
            return Response({'error': 'Sie sind kein Teilnehmer dieses Chats'}, 
                           status=status.HTTP_403_FORBIDDEN)
        
        ws_url = f"{protocol}://{host}/ws/chat/{chat.id}/"
        
        return Response({'websocket_url': ws_url})

    def create(self, request, *args, **kwargs):
        """
        Erstellt einen neuen Chat
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        chat = serializer.save()
        
        # Verwende den Standard-Serializer für die Antwort
        response_serializer = ChatSerializer(chat, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

class ChatMessageViewSet(viewsets.ModelViewSet):
    """
    API Endpunkt für Chatnachrichten
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """
        Gibt alle Nachrichten zurück, die zu einem bestimmten Chat gehören
        """
        chat_id = self.kwargs.get('chat_pk')
        return ChatMessage.objects.filter(chat_id=chat_id).order_by('created_at')
    
    def perform_create(self, serializer):
        """
        Erstellt eine neue Nachricht im Chat
        """
        chat_id = self.kwargs.get('chat_pk')
        chat = Chat.objects.get(id=chat_id)
        
        # Prüfen, ob der Benutzer am Chat teilnimmt
        if not chat.participants.filter(id=self.request.user.id).exists():
            raise permissions.PermissionDenied("Sie sind kein Teilnehmer dieses Chats")
        
        # Nachricht erstellen
        serializer.save(
            sender=self.request.user, 
            chat_id=chat_id
        )
        
        # Chat-updated_at aktualisieren
        chat.updated_at = timezone.now()
        chat.save(update_fields=['updated_at']) 