from rest_framework import serializers
from django.contrib.auth import get_user_model
from bsn_social_network.models import Chat, ChatMessage

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar_url', 'display_name']
    
    def get_avatar_url(self, obj):
        # Hier müsste die tatsächliche Logik für die Avatar-URL implementiert werden
        # In diesem Fall verwenden wir einen Platzhalter
        return f'https://i.pravatar.cc/150?u={obj.username}'
    
    def get_display_name(self, obj):
        # Verwende username als display_name
        return obj.username

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'chat_id', 'sender', 'content', 'media_url', 'is_read', 'created_at']
        read_only_fields = ['id', 'chat_id', 'sender', 'is_read', 'created_at']

class ChatSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    websocket_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = ['id', 'name', 'type', 'participants', 'last_message', 'unread_count', 'websocket_url', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_last_message(self, obj):
        last_message = obj.messages.order_by('-created_at').first()
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'sender': UserSerializer(last_message.sender).data,
                'timestamp': last_message.created_at
            }
        return None
    
    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()
    
    def get_websocket_url(self, obj):
        request = self.context.get('request')
        if request is None:
            return None
            
        protocol = 'wss' if request.is_secure() else 'ws'
        host = request.get_host()
        
        return f"{protocol}://{host}/ws/chat/{obj.id}/"

class ChatCreateSerializer(serializers.ModelSerializer):
    participants = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=User.objects.all(),
        required=True
    )
    initial_message = serializers.CharField(required=False, write_only=True)
    
    class Meta:
        model = Chat
        fields = ['id', 'name', 'type', 'participants', 'initial_message']
        read_only_fields = ['id']
    
    def create(self, validated_data):
        participants = validated_data.pop('participants')
        initial_message = validated_data.pop('initial_message', None)
        
        user = self.context['request'].user
        
        # Stelle sicher, dass der aktuelle Benutzer in den Teilnehmern ist
        if user not in participants:
            participants.append(user)
        
        # Bei direkten Chats sollten nur 2 Teilnehmer sein
        if validated_data.get('type') == 'direct' and len(participants) != 2:
            raise serializers.ValidationError("Direkter Chat muss genau 2 Teilnehmer haben")
        
        # Bei Gruppenchats muss ein Name angegeben werden
        if validated_data.get('type') == 'group' and not validated_data.get('name'):
            raise serializers.ValidationError("Gruppenchats benötigen einen Namen")
        
        # Chat erstellen
        chat = Chat.objects.create(created_by=user, **validated_data)
        
        # Teilnehmer hinzufügen
        chat.participants.set(participants)
        
        # Optional: Erste Nachricht erstellen
        if initial_message:
            ChatMessage.objects.create(
                chat=chat,
                sender=user,
                content=initial_message
            )
        
        return chat 