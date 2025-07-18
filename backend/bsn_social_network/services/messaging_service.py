import logging
import json
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ..models import Conversation, Message, MessageReaction, User, ConversationParticipant
from django.db.models import Count

logger = logging.getLogger(__name__)

class MessagingService:
    """
    Service for managing messaging functionality including encryption and voice messages
    """
    
    def __init__(self):
        self.channel_layer = get_channel_layer()
    
    @staticmethod
    def generate_encryption_key(user_id: int, conversation_id: int) -> bytes:
        """
        Generate encryption key for a conversation
        """
        try:
            # Use user_id and conversation_id to generate a unique key
            salt = f"{user_id}_{conversation_id}".encode()
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            key = base64.urlsafe_b64encode(kdf.derive(str(user_id).encode()))
            return key
        except Exception as e:
            logger.error(f"Error generating encryption key: {e}")
            return None
    
    @staticmethod
    def encrypt_message(content: str, user_id: int, conversation_id: int) -> str:
        """
        Encrypt message content
        """
        try:
            key = MessagingService.generate_encryption_key(user_id, conversation_id)
            if not key:
                return content
            
            fernet = Fernet(key)
            encrypted_content = fernet.encrypt(content.encode())
            return base64.urlsafe_b64encode(encrypted_content).decode()
        except Exception as e:
            logger.error(f"Error encrypting message: {e}")
            return content
    
    @staticmethod
    def decrypt_message(encrypted_content: str, user_id: int, conversation_id: int) -> str:
        """
        Decrypt message content
        """
        try:
            key = MessagingService.generate_encryption_key(user_id, conversation_id)
            if not key:
                return encrypted_content
            
            fernet = Fernet(key)
            decoded_content = base64.urlsafe_b64decode(encrypted_content.encode())
            decrypted_content = fernet.decrypt(decoded_content)
            return decrypted_content.decode()
        except Exception as e:
            logger.error(f"Error decrypting message: {e}")
            return encrypted_content
    
    @staticmethod
    def create_message(
        conversation_id: int,
        sender_id: int,
        content: str,
        message_type: str = 'text',
        media_url: str = None,
        voice_duration: int = None,
        voice_waveform: dict = None,
        encrypt: bool = True
    ) -> Message:
        """
        Create a new message with optional encryption
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            sender = User.objects.get(id=sender_id)
            
            # Encrypt content if requested
            if encrypt and message_type == 'text':
                encrypted_content = MessagingService.encrypt_message(
                    content, sender_id, conversation_id
                )
            else:
                encrypted_content = content
            
            # Create message
            message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                content=encrypted_content,
                message_type=message_type,
                media_url=media_url,
                voice_duration=voice_duration,
                voice_waveform=voice_waveform,
                is_read=False
            )
            
            # Update conversation
            conversation.updated_at = timezone.now()
            conversation.save()
            
            return message
            
        except Exception as e:
            logger.error(f"Error creating message: {e}")
            return None
    
    @staticmethod
    def get_messages_for_user(
        conversation_id: int,
        user_id: int,
        limit: int = 50,
        offset: int = 0,
        decrypt: bool = True
    ) -> list:
        """
        Get messages for a conversation with optional decryption
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user is participant
            if not conversation.participants.filter(user_id=user_id).exists():
                return []
            
            messages = conversation.messages.select_related('sender').order_by(
                '-created_at'
            )[offset:offset + limit]
            
            messages_data = []
            for message in messages:
                # Decrypt content if requested
                if decrypt and message.message_type == 'text':
                    decrypted_content = MessagingService.decrypt_message(
                        message.content, user_id, conversation_id
                    )
                else:
                    decrypted_content = message.content
                
                message_data = {
                    'id': message.id,
                    'content': decrypted_content,
                    'message_type': message.message_type,
                    'media_url': message.media_url,
                    'voice_duration': message.voice_duration,
                    'voice_waveform': message.voice_waveform,
                    'is_read': message.is_read,
                    'created_at': message.created_at.isoformat(),
                    'sender': {
                        'id': message.sender.id,
                        'username': message.sender.username,
                        'display_name': message.sender.display_name,
                        'avatar_url': message.sender.avatar_url,
                    },
                    'is_own_message': message.sender.id == user_id,
                }
                messages_data.append(message_data)
            
            return messages_data
            
        except Exception as e:
            logger.error(f"Error getting messages: {e}")
            return []
    
    @staticmethod
    def mark_messages_read(conversation_id: int, user_id: int, message_ids: list = None):
        """
        Mark messages as read
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user is participant
            if not conversation.participants.filter(user_id=user_id).exists():
                return False
            
            if message_ids:
                # Mark specific messages as read
                Message.objects.filter(
                    id__in=message_ids,
                    conversation=conversation,
                    sender__ne=user_id
                ).update(is_read=True)
            else:
                # Mark all unread messages as read
                Message.objects.filter(
                    conversation=conversation,
                    sender__ne=user_id,
                    is_read=False
                ).update(is_read=True)
            
            return True
            
        except Exception as e:
            logger.error(f"Error marking messages as read: {e}")
            return False
    
    @staticmethod
    def add_message_reaction(
        message_id: int,
        user_id: int,
        reaction_type: str
    ) -> bool:
        """
        Add reaction to a message
        """
        try:
            message = Message.objects.get(id=message_id)
            
            # Check if user is participant in conversation
            if not message.conversation.participants.filter(user_id=user_id).exists():
                return False
            
            reaction, created = MessageReaction.objects.get_or_create(
                message=message,
                user_id=user_id,
                reaction_type=reaction_type
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding message reaction: {e}")
            return False
    
    @staticmethod
    def remove_message_reaction(
        message_id: int,
        user_id: int,
        reaction_type: str
    ) -> bool:
        """
        Remove reaction from a message
        """
        try:
            message = Message.objects.get(id=message_id)
            
            # Check if user is participant in conversation
            if not message.conversation.participants.filter(user_id=user_id).exists():
                return False
            
            MessageReaction.objects.filter(
                message=message,
                user_id=user_id,
                reaction_type=reaction_type
            ).delete()
            
            return True
            
        except Exception as e:
            logger.error(f"Error removing message reaction: {e}")
            return False
    
    @staticmethod
    def notify_new_message(message: Message):
        """
        Notify participants about new message via WebSocket
        """
        try:
            conversation = message.conversation
            participants = conversation.participants.all()
            
            message_data = {
                'id': message.id,
                'content': message.content,  # Encrypted content
                'message_type': message.message_type,
                'media_url': message.media_url,
                'voice_duration': message.voice_duration,
                'voice_waveform': message.voice_waveform,
                'is_read': message.is_read,
                'created_at': message.created_at.isoformat(),
                'sender': {
                    'id': message.sender.id,
                    'username': message.sender.username,
                    'display_name': message.sender.display_name,
                    'avatar_url': message.sender.avatar_url,
                },
            }
            
            # Send to all participants except sender
            for participant in participants:
                if participant.user.id != message.sender.id:
                    room_name = f"user_{participant.user.id}"
                    async_to_sync(get_channel_layer().group_send)(
                        room_name,
                        {
                            'type': 'message_received',
                            'message': message_data
                        }
                    )
            
            logger.info(f"Notified {participants.count() - 1} participants about new message")
            
        except Exception as e:
            logger.error(f"Error notifying new message: {e}")
    
    @staticmethod
    def notify_typing_indicator(
        conversation_id: int,
        user_id: int,
        is_typing: bool
    ):
        """
        Notify participants about typing indicator
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            user = User.objects.get(id=user_id)
            participants = conversation.participants.all()
            
            # Send to all participants except sender
            for participant in participants:
                if participant.user.id != user_id:
                    room_name = f"user_{participant.user.id}"
                    async_to_sync(get_channel_layer().group_send)(
                        room_name,
                        {
                            'type': 'typing_indicator',
                            'conversation_id': conversation_id,
                            'user_id': user_id,
                            'user_name': user.username,
                            'is_typing': is_typing
                        }
                    )
            
        except Exception as e:
            logger.error(f"Error notifying typing indicator: {e}")
    
    @staticmethod
    def notify_read_receipt(
        conversation_id: int,
        user_id: int,
        message_ids: list
    ):
        """
        Notify message sender about read receipts
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            user = User.objects.get(id=user_id)
            
            # Get unique message senders
            message_senders = Message.objects.filter(
                id__in=message_ids,
                conversation=conversation
            ).values_list('sender_id', flat=True).distinct()
            
            # Send read receipt to each message sender
            for sender_id in message_senders:
                if sender_id != user_id:
                    room_name = f"user_{sender_id}"
                    async_to_sync(get_channel_layer().group_send)(
                        room_name,
                        {
                            'type': 'read_receipt',
                            'conversation_id': conversation_id,
                            'message_ids': message_ids,
                            'read_by_id': user_id,
                            'read_by_name': user.username
                        }
                    )
            
        except Exception as e:
            logger.error(f"Error notifying read receipt: {e}")
    
    @staticmethod
    def create_voice_message(
        conversation_id: int,
        sender_id: int,
        voice_file_path: str,
        duration: int,
        waveform: dict = None
    ) -> Message:
        """
        Create a voice message
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            sender = User.objects.get(id=sender_id)
            
            # Create message with voice data
            message = Message.objects.create(
                conversation=conversation,
                sender=sender,
                content="",  # Voice messages don't have text content
                message_type='voice',
                voice_file=voice_file_path,
                voice_duration=duration,
                voice_waveform=waveform,
                is_read=False
            )
            
            # Update conversation
            conversation.updated_at = timezone.now()
            conversation.save()
            
            return message
            
        except Exception as e:
            logger.error(f"Error creating voice message: {e}")
            return None
    
    @staticmethod
    def get_conversation_stats(conversation_id: int, user_id: int) -> dict:
        """
        Get detailed conversation statistics
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user is participant
            if not conversation.participants.filter(user_id=user_id).exists():
                return {}
            
            # Get message statistics
            total_messages = conversation.messages.count()
            text_messages = conversation.messages.filter(message_type='text').count()
            voice_messages = conversation.messages.filter(message_type='voice').count()
            media_messages = conversation.messages.filter(message_type='media').count()
            
            # Get participant statistics
            participants = conversation.participants.all()
            active_participants = participants.filter(
                user__last_login__gte=timezone.now() - timezone.timedelta(days=7)
            ).count()
            
            # Get recent activity
            recent_messages = conversation.messages.filter(
                created_at__gte=timezone.now() - timezone.timedelta(days=7)
            ).count()
            
            # Get unread count for user
            unread_count = conversation.messages.filter(
                sender__ne=user_id,
                is_read=False
            ).count()
            
            return {
                'conversation_id': conversation_id,
                'total_messages': total_messages,
                'text_messages': text_messages,
                'voice_messages': voice_messages,
                'media_messages': media_messages,
                'participants_count': participants.count(),
                'active_participants': active_participants,
                'recent_messages': recent_messages,
                'unread_count': unread_count,
                'created_at': conversation.created_at.isoformat(),
                'updated_at': conversation.updated_at.isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Error getting conversation stats: {e}")
            return {}

    @staticmethod
    def search_messages(
        conversation_id: int,
        user_id: int,
        query: str,
        limit: int = 20,
        offset: int = 0
    ) -> list:
        """
        Search messages in a conversation
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user is participant
            if not conversation.participants.filter(user_id=user_id).exists():
                return []
            
            # Search in messages
            messages = conversation.messages.filter(
                content__icontains=query
            ).select_related('sender').order_by('-created_at')[offset:offset + limit]
            
            messages_data = []
            for message in messages:
                # Decrypt content for search results
                if message.message_type == 'text':
                    decrypted_content = MessagingService.decrypt_message(
                        message.content, user_id, conversation_id
                    )
                else:
                    decrypted_content = message.content
                
                message_data = {
                    'id': message.id,
                    'content': decrypted_content,
                    'message_type': message.message_type,
                    'media_url': message.media_url,
                    'voice_duration': message.voice_duration,
                    'voice_waveform': message.voice_waveform,
                    'is_read': message.is_read,
                    'created_at': message.created_at.isoformat(),
                    'sender': {
                        'id': message.sender.id,
                        'username': message.sender.username,
                        'display_name': message.sender.display_name,
                        'avatar_url': message.sender.avatar_url,
                    },
                    'is_own_message': message.sender.id == user_id,
                }
                messages_data.append(message_data)
            
            return messages_data
            
        except Exception as e:
            logger.error(f"Error searching messages: {e}")
            return []

    @staticmethod
    def create_group_conversation(
        name: str,
        creator_id: int,
        participant_ids: list,
        description: str = None,
        is_private: bool = False
    ) -> Conversation:
        """
        Create a group conversation
        """
        try:
            creator = User.objects.get(id=creator_id)
            
            # Create conversation
            conversation = Conversation.objects.create(
                name=name,
                description=description,
                conversation_type='group',
                created_by=creator,
                is_private=is_private
            )
            
            # Add participants
            participants = [creator_id] + participant_ids
            for participant_id in participants:
                user = User.objects.get(id=participant_id)
                ConversationParticipant.objects.create(
                    conversation=conversation,
                    user=user,
                    role='member' if user.id != creator_id else 'admin'
                )
            
            return conversation
            
        except Exception as e:
            logger.error(f"Error creating group conversation: {e}")
            return None

    @staticmethod
    def add_group_participant(
        conversation_id: int,
        user_id: int,
        added_by_id: int
    ) -> bool:
        """
        Add participant to group conversation
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user adding is admin
            if not conversation.participants.filter(
                user_id=added_by_id,
                role__in=['admin', 'moderator']
            ).exists():
                return False
            
            # Check if user is already participant
            if conversation.participants.filter(user_id=user_id).exists():
                return False
            
            user = User.objects.get(id=user_id)
            ConversationParticipant.objects.create(
                conversation=conversation,
                user=user,
                role='member'
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error adding group participant: {e}")
            return False

    @staticmethod
    def remove_group_participant(
        conversation_id: int,
        user_id: int,
        removed_by_id: int
    ) -> bool:
        """
        Remove participant from group conversation
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user removing is admin
            if not conversation.participants.filter(
                user_id=removed_by_id,
                role__in=['admin', 'moderator']
            ).exists():
                return False
            
            # Remove participant
            conversation.participants.filter(user_id=user_id).delete()
            
            return True
            
        except Exception as e:
            logger.error(f"Error removing group participant: {e}")
            return False

    @staticmethod
    def promote_group_participant(
        conversation_id: int,
        user_id: int,
        promoted_by_id: int,
        new_role: str
    ) -> bool:
        """
        Promote participant in group conversation
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user promoting is admin
            if not conversation.participants.filter(
                user_id=promoted_by_id,
                role='admin'
            ).exists():
                return False
            
            # Update participant role
            participant = conversation.participants.filter(user_id=user_id).first()
            if participant:
                participant.role = new_role
                participant.save()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error promoting group participant: {e}")
            return False

    @staticmethod
    def get_group_info(conversation_id: int, user_id: int) -> dict:
        """
        Get detailed group information
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user is participant
            if not conversation.participants.filter(user_id=user_id).exists():
                return {}
            
            # Get participants with roles
            participants = conversation.participants.select_related('user').all()
            
            participants_data = []
            for participant in participants:
                participants_data.append({
                    'user_id': participant.user.id,
                    'username': participant.user.username,
                    'display_name': participant.user.display_name,
                    'avatar_url': participant.user.avatar_url,
                    'role': participant.role,
                    'joined_at': participant.created_at.isoformat(),
                    'is_online': participant.user.last_login and (
                        participant.user.last_login > timezone.now() - timezone.timedelta(minutes=5)
                    ),
                })
            
            return {
                'conversation_id': conversation_id,
                'name': conversation.name,
                'description': conversation.description,
                'conversation_type': conversation.conversation_type,
                'is_private': conversation.is_private,
                'created_by': {
                    'id': conversation.created_by.id,
                    'username': conversation.created_by.username,
                },
                'participants': participants_data,
                'created_at': conversation.created_at.isoformat(),
                'updated_at': conversation.updated_at.isoformat(),
            }
            
        except Exception as e:
            logger.error(f"Error getting group info: {e}")
            return {}

    @staticmethod
    def notify_group_event(
        conversation_id: int,
        event_type: str,
        data: dict,
        exclude_user_id: int = None
    ):
        """
        Notify group participants about events
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            participants = conversation.participants.all()
            
            event_data = {
                'type': 'group_event',
                'event_type': event_type,
                'conversation_id': conversation_id,
                'data': data,
                'timestamp': timezone.now().isoformat(),
            }
            
            # Send to all participants except excluded user
            for participant in participants:
                if participant.user.id != exclude_user_id:
                    room_name = f"user_{participant.user.id}"
                    async_to_sync(get_channel_layer().group_send)(
                        room_name,
                        {
                            'type': 'group_event_received',
                            'event': event_data
                        }
                    )
            
            logger.info(f"Notified {participants.count()} participants about group event: {event_type}")
            
        except Exception as e:
            logger.error(f"Error notifying group event: {e}")

    @staticmethod
    def get_message_analytics(conversation_id: int, user_id: int, days: int = 30) -> dict:
        """
        Get message analytics for a conversation
        """
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            
            # Check if user is participant
            if not conversation.participants.filter(user_id=user_id).exists():
                return {}
            
            # Get date range
            end_date = timezone.now()
            start_date = end_date - timezone.timedelta(days=days)
            
            # Get messages in date range
            messages = conversation.messages.filter(
                created_at__range=(start_date, end_date)
            )
            
            # Calculate analytics
            total_messages = messages.count()
            messages_by_type = messages.values('message_type').annotate(count=Count('id'))
            messages_by_sender = messages.values('sender__username').annotate(count=Count('id'))
            
            # Daily message count
            daily_messages = messages.extra(
                select={'day': 'date(created_at)'}
            ).values('day').annotate(count=Count('id')).order_by('day')
            
            # Average response time
            response_times = []
            for participant in conversation.participants.all():
                participant_messages = messages.filter(sender=participant.user).order_by('created_at')
                for i, msg in enumerate(participant_messages[1:], 1):
                    prev_msg = participant_messages[i-1]
                    if prev_msg.sender != msg.sender:
                        response_time = (msg.created_at - prev_msg.created_at).total_seconds()
                        response_times.append(response_time)
            
            avg_response_time = sum(response_times) / len(response_times) if response_times else 0
            
            return {
                'conversation_id': conversation_id,
                'period_days': days,
                'total_messages': total_messages,
                'messages_by_type': list(messages_by_type),
                'messages_by_sender': list(messages_by_sender),
                'daily_messages': list(daily_messages),
                'average_response_time_seconds': avg_response_time,
                'most_active_sender': max(messages_by_sender, key=lambda x: x['count']) if messages_by_sender else None,
                'most_common_message_type': max(messages_by_type, key=lambda x: x['count']) if messages_by_type else None,
            }
            
        except Exception as e:
            logger.error(f"Error getting message analytics: {e}")
            return {} 