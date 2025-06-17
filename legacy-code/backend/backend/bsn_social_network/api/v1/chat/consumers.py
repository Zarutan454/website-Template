import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from bsn_social_network.models import Chat, ChatMessage

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.room_group_name = f"chat_{self.chat_id}"

        # Prüfen, ob der Benutzer authentifiziert ist
        if self.user.is_anonymous:
            await self.close()
            return

        # Prüfen, ob der Benutzer ein Teilnehmer des Chats ist
        is_participant = await self.is_chat_participant(self.user.id, self.chat_id)
        if not is_participant:
            await self.close()
            return

        # Trete der Chat-Gruppe bei
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Verlasse die Chat-Gruppe
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Nachricht vom WebSocket empfangen
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_content = data["message"]
        
        # Speichere die Nachricht in der Datenbank
        message = await self.save_message(self.user.id, self.chat_id, message_content)
        
        # Aktualisiere den Chat
        await self.update_chat_timestamp(self.chat_id)
        
        # Sende die Nachricht an die Chat-Gruppe
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message_content,
                "user_id": self.user.id,
                "username": self.user.username,
                "message_id": message["id"],
                "timestamp": message["timestamp"]
            }
        )

    # Event vom Channel Layer empfangen
    async def chat_message(self, event):
        # Sende die Nachricht an den WebSocket
        await self.send(text_data=json.dumps({
            "message": event["message"],
            "user_id": event["user_id"],
            "username": event["username"],
            "message_id": event["message_id"],
            "timestamp": event["timestamp"]
        }))

    @database_sync_to_async
    def is_chat_participant(self, user_id, chat_id):
        try:
            chat = Chat.objects.get(id=chat_id)
            return chat.participants.filter(id=user_id).exists()
        except Chat.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, user_id, chat_id, content):
        user = User.objects.get(id=user_id)
        chat = Chat.objects.get(id=chat_id)
        
        message = ChatMessage.objects.create(
            chat=chat,
            sender=user,
            content=content,
            is_read=False
        )
        
        return {
            "id": message.id,
            "timestamp": message.created_at.isoformat()
        }
        
    @database_sync_to_async
    def update_chat_timestamp(self, chat_id):
        from django.utils import timezone
        Chat.objects.filter(id=chat_id).update(updated_at=timezone.now()) 