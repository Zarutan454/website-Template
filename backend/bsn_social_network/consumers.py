import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import Conversation, Message, ConversationParticipant, Post, User, FollowRelationship
from django.utils import timezone
import logging
import asyncio
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)
User = get_user_model()

class MessagingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection with token authentication"""
        try:
            # Extract token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')
            
            if not token:
                logger.warning("No token provided in WebSocket connection")
                await self.close(code=4001)  # Custom code for authentication failure
                return
            
            # Validate token and get user
            user = await self.get_user_from_token(token)
            if not user:
                logger.warning("Invalid token provided in WebSocket connection")
                await self.close(code=4001)
                return
            
            self.user = user
            self.user_id = str(user.id)
            
            # Get conversation ID from URL
            self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
            
            # Check if user is participant in conversation
            if not await self.is_participant():
                logger.warning(f"User {user.username} not participant in conversation {self.conversation_id}")
                await self.close(code=4003)  # Custom code for access denied
                return
            
            # Join conversation room
            self.room_group_name = f"chat_{self.conversation_id}"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to messaging',
                'conversation_id': self.conversation_id,
                'user_id': self.user_id
            }))
            
            logger.info(f"WebSocket connected: User {user.username} to conversation {self.conversation_id}")
            
        except Exception as e:
            logger.error(f"Error in WebSocket connect: {e}")
            await self.close(code=4000)  # Custom code for general error

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.error(f"Token validation failed: {e}")
            return None

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            # Leave conversation room
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"WebSocket disconnected: User {getattr(self, 'user_id', 'unknown')} from conversation {getattr(self, 'conversation_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error in WebSocket disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'message':
                await self.handle_message(data)
            elif message_type == 'typing':
                await self.handle_typing(data)
            elif message_type == 'read':
                await self.handle_read(data)
            elif message_type == 'reaction':
                await self.handle_reaction(data)
            elif message_type == 'ping':
                await self.handle_ping()
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling WebSocket message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_ping(self):
        """Handle heartbeat ping"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))

    async def handle_message(self, data):
        """Handle new message"""
        content = data.get('content', '').strip()
        message_type = data.get('message_type', 'text')
        media_url = data.get('media_url')
        attachment_name = data.get('attachment_name')
        attachment_size = data.get('attachment_size')
        attachment_type = data.get('attachment_type')
        
        if not content and not media_url:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Message content or media is required'
            }))
            return
        
        try:
            # Save message to database
            message = await self.save_message(
                content, message_type, media_url, 
                attachment_name, attachment_size, attachment_type
            )
            
            if not message:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Failed to save message'
                }))
                return
            
            # Broadcast message to all participants
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': message.id,
                        'content': message.content,
                        'message_type': message.message_type,
                        'media_url': message.media_url,
                        'attachment_name': message.attachment_name,
                        'attachment_size': message.attachment_size,
                        'attachment_type': message.attachment_type,
                        'is_read': message.is_read,
                        'created_at': message.created_at.isoformat(),
                        'sender': {
                            'id': message.sender.id,
                            'username': message.sender.username,
                            'display_name': message.sender.display_name,
                            'avatar_url': message.sender.avatar_url,
                        },
                        'is_own_message': message.sender.id == self.user.id,
                    }
                }
            )
            
            logger.info(f"Message sent: User {self.user.username} in conversation {self.conversation_id}")
            
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to save message'
            }))

    async def handle_typing(self, data):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)
        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': is_typing
            }
        )

    async def handle_read(self, data):
        """Handle read receipts"""
        message_ids = data.get('message_ids', [])
        
        if message_ids:
            try:
                await self.mark_messages_read(message_ids)
                
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'read_receipt',
                        'user_id': self.user.id,
                        'message_ids': message_ids
                    }
                )
            except Exception as e:
                logger.error(f"Error marking messages as read: {e}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Failed to mark messages as read'
                }))

    async def handle_reaction(self, data):
        """Handle message reactions"""
        message_id = data.get('message_id')
        reaction_type = data.get('reaction_type')
        action = data.get('action', 'add')  # 'add' or 'remove'
        
        if not message_id or not reaction_type:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Message ID and reaction type are required'
            }))
            return
        
        try:
            if action == 'add':
                reaction = await self.add_reaction(message_id, reaction_type)
            else:
                reaction = await self.remove_reaction(message_id, reaction_type)
            
            if reaction:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'reaction_update',
                        'message_id': message_id,
                        'reaction_type': reaction_type,
                        'action': action,
                        'user_id': self.user.id,
                        'username': self.user.username
                    }
                )
        except Exception as e:
            logger.error(f"Error handling reaction: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to process reaction'
            }))

    # WebSocket event handlers
    async def chat_message(self, event):
        """Send message to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'message_received',
            'message': event['message']
        }))

    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'typing_indicator',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_typing': event['is_typing']
        }))

    async def read_receipt(self, event):
        """Send read receipt to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'read_receipt',
            'user_id': event['user_id'],
            'message_ids': event['message_ids']
        }))

    async def reaction_update(self, event):
        """Send reaction update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'reaction_update',
            'message_id': event['message_id'],
            'reaction_type': event['reaction_type'],
            'action': event['action'],
            'user_id': event['user_id'],
            'username': event['username']
        }))

    # Database operations
    @database_sync_to_async
    def is_participant(self):
        """Check if user is participant in conversation"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            return conversation.participants.filter(user=self.user).exists()
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, content, message_type, media_url, attachment_name, attachment_size, attachment_type):
        """Save message to database"""
        try:
            conversation = Conversation.objects.get(id=self.conversation_id)
            message = Message.objects.create(
                conversation=conversation,
                sender=self.user,
                content=content,
                message_type=message_type,
                media_url=media_url,
                attachment_name=attachment_name,
                attachment_size=attachment_size,
                attachment_type=attachment_type
            )
            return message
        except Conversation.DoesNotExist:
            logger.error(f"Conversation {self.conversation_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error saving message: {e}")
            return None

    @database_sync_to_async
    def mark_messages_read(self, message_ids):
        """Mark messages as read"""
        try:
            Message.objects.filter(
                id__in=message_ids,
                conversation_id=self.conversation_id,
                sender__ne=self.user
            ).update(is_read=True)
        except Exception as e:
            logger.error(f"Error marking messages as read: {e}")
            raise

    @database_sync_to_async
    def add_reaction(self, message_id, reaction_type):
        """Add reaction to message"""
        try:
            message = Message.objects.get(id=message_id, conversation_id=self.conversation_id)
            from .models import MessageReaction
            reaction, created = MessageReaction.objects.get_or_create(
                message=message,
                user=self.user,
                reaction_type=reaction_type
            )
            return reaction
        except Message.DoesNotExist:
            logger.error(f"Message {message_id} not found")
            return None
        except Exception as e:
            logger.error(f"Error adding reaction: {e}")
            return None

    @database_sync_to_async
    def remove_reaction(self, message_id, reaction_type):
        """Remove reaction from message"""
        try:
            from .models import MessageReaction
            MessageReaction.objects.filter(
                message_id=message_id,
                user=self.user,
                reaction_type=reaction_type
            ).delete()
            return True
        except Exception as e:
            logger.error(f"Error removing reaction: {e}")
            return False


class FeedConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection with token authentication"""
        try:
            # Extract token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')
            
            if not token:
                logger.warning("No token provided in Feed WebSocket connection")
                await self.close(code=4001)  # Custom code for authentication failure
                return
            
            # Validate token and get user
            user = await self.get_user_from_token(token)
            if not user:
                logger.warning("Invalid token provided in Feed WebSocket connection")
                await self.close(code=4001)
                return
            
            self.user = user
            self.user_id = str(user.id)
            
            # Join user's personal feed room
            self.room_group_name = f"feed_user_{self.user_id}"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            # Also join general feed room for global updates
            self.general_room_name = "feed_general"
            await self.channel_layer.group_add(
                self.general_room_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to feed',
                'user_id': self.user_id,
                'feed_type': 'following'
            }))
            
            logger.info(f"Feed WebSocket connected: User {user.username}")
            
        except Exception as e:
            logger.error(f"Error in Feed WebSocket connect: {e}")
            await self.close(code=4000)  # Custom code for general error

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.error(f"Token validation failed: {e}")
            return None

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            if hasattr(self, 'general_room_name'):
                await self.channel_layer.group_discard(
                    self.general_room_name,
                    self.channel_name
                )
            logger.info(f"Feed WebSocket disconnected: User {getattr(self, 'user_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error in Feed WebSocket disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'subscribe_feed':
                await self.handle_subscribe_feed(data)
            elif message_type == 'unsubscribe_feed':
                await self.handle_unsubscribe_feed(data)
            elif message_type == 'feed_preferences':
                await self.handle_feed_preferences(data)
            elif message_type == 'ping':
                await self.handle_ping()
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling feed WebSocket message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_ping(self):
        """Handle heartbeat ping"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))

    async def handle_subscribe_feed(self, data):
        """Handle feed subscription"""
        feed_type = data.get('feed_type', 'following')
        
        try:
            # Join specific feed room
            room_name = f"feed_{feed_type}_{self.user.id}"
            await self.channel_layer.group_add(
                room_name,
                self.channel_name
            )
            
            await self.send(text_data=json.dumps({
                'type': 'feed_subscribed',
                'feed_type': feed_type
            }))
        except Exception as e:
            logger.error(f"Error subscribing to feed: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to subscribe to feed'
            }))

    async def handle_unsubscribe_feed(self, data):
        """Handle feed unsubscription"""
        feed_type = data.get('feed_type', 'following')
        
        try:
            # Leave specific feed room
            room_name = f"feed_{feed_type}_{self.user.id}"
            await self.channel_layer.group_discard(
                room_name,
                self.channel_name
            )
            
            await self.send(text_data=json.dumps({
                'type': 'feed_unsubscribed',
                'feed_type': feed_type
            }))
        except Exception as e:
            logger.error(f"Error unsubscribing from feed: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to unsubscribe from feed'
            }))

    async def handle_feed_preferences(self, data):
        """Handle feed preferences update"""
        preferences = data.get('preferences', {})
        
        try:
            await self.update_feed_preferences(preferences)
            
            await self.send(text_data=json.dumps({
                'type': 'feed_preferences_updated',
                'preferences': preferences
            }))
        except Exception as e:
            logger.error(f"Error updating feed preferences: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to update feed preferences'
            }))

    # WebSocket event handlers
    async def new_post(self, event):
        """Send new post to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'new_post',
            'post': event['post']
        }))

    async def post_liked(self, event):
        """Send post like to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'post_liked',
            'post_id': event['post_id'],
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def post_commented(self, event):
        """Send post comment to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'post_commented',
            'post_id': event['post_id'],
            'comment': event['comment']
        }))

    async def post_shared(self, event):
        """Send post share to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'post_shared',
            'post_id': event['post_id'],
            'user_id': event['user_id'],
            'username': event['username']
        }))

    async def user_followed(self, event):
        """Send user follow to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'user_followed',
            'follower_id': event['follower_id'],
            'follower_username': event['follower_username'],
            'followed_id': event['followed_id'],
            'followed_username': event['followed_username']
        }))

    async def story_created(self, event):
        """Send story created to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'story_created',
            'story': event['story']
        }))

    # Database operations
    @database_sync_to_async
    def get_following_users(self):
        """Get users that the current user follows"""
        try:
            # Get users that the current user is following
            # return FollowRelationship.objects.filter(
            #     user=user
            # ).values_list('friend_id', flat=True)
            
            # Temporarily return empty list
            return []
        except Exception as e:
            logger.error(f"Error getting following users: {e}")
            return []

    @database_sync_to_async
    def update_feed_preferences(self, preferences):
        """Update user's feed preferences"""
        try:
            # Update user preferences in database
            # This is a placeholder - implement based on your User model
            logger.info(f"Updated feed preferences for user {self.user.id}: {preferences}")
        except Exception as e:
            logger.error(f"Error updating feed preferences: {e}")
            raise


class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time notifications
    """
    
    async def connect(self):
        """Handle WebSocket connection for notifications with token authentication"""
        try:
            # Extract token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')
            
            if not token:
                logger.warning("No token provided in notification WebSocket connection")
                await self.close(code=4001)  # Custom code for authentication failure
                return
            
            # Validate token and get user
            user = await self.get_user_from_token(token)
            if not user:
                logger.warning("Invalid token provided in notification WebSocket connection")
                await self.close(code=4001)
                return
            
            self.user = user
            self.user_id = str(user.id)
            
            # Join user's personal notification room
            self.room_group_name = f"notifications_user_{self.user.id}"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to notifications',
                'user_id': self.user.id
            }))
            
            logger.info(f"Notification WebSocket connected: User {user.username}")
            
        except Exception as e:
            logger.error(f"Error in notification WebSocket connect: {e}")
            await self.close(code=4000)  # Custom code for general error

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.error(f"Token validation failed: {e}")
            return None

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"Notification WebSocket disconnected: User {getattr(self, 'user_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error in notification WebSocket disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'mark_read':
                await self.handle_mark_read(data)
            elif message_type == 'notification_preferences':
                await self.handle_notification_preferences(data)
            elif message_type == 'ping':
                await self.handle_ping()
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling notification WebSocket message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_ping(self):
        """Handle heartbeat ping"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))

    async def handle_mark_read(self, data):
        """Handle marking notifications as read"""
        notification_ids = data.get('notification_ids', [])
        
        if notification_ids:
            try:
                await self.mark_notifications_read(notification_ids)
                
                await self.send(text_data=json.dumps({
                    'type': 'notifications_marked_read',
                    'notification_ids': notification_ids
                }))
            except Exception as e:
                logger.error(f"Error marking notifications as read: {e}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Failed to mark notifications as read'
                }))

    async def handle_notification_preferences(self, data):
        """Handle notification preferences update"""
        preferences = data.get('preferences', {})
        
        try:
            await self.update_notification_preferences(preferences)
            
            await self.send(text_data=json.dumps({
                'type': 'notification_preferences_updated',
                'preferences': preferences
            }))
        except Exception as e:
            logger.error(f"Error updating notification preferences: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to update notification preferences'
            }))

    # WebSocket event handlers
    async def new_notification(self, event):
        """Send new notification to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))

    async def notification_updated(self, event):
        """Send notification update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'notification_updated',
            'notification': event['notification']
        }))

    # Database operations
    @database_sync_to_async
    def mark_notifications_read(self, notification_ids):
        """Mark notifications as read"""
        try:
            # This would typically update a Notification model
            # For now, we'll just log the action
            logger.info(f"Marked notifications as read for user {self.user.id}: {notification_ids}")
        except Exception as e:
            logger.error(f"Error marking notifications as read: {e}")
            raise

    @database_sync_to_async
    def update_notification_preferences(self, preferences):
        """Update user's notification preferences"""
        try:
            # Update user notification preferences in database
            # This is a placeholder - implement based on your User model
            logger.info(f"Updated notification preferences for user {self.user.id}: {preferences}")
        except Exception as e:
            logger.error(f"Error updating notification preferences: {e}")
            raise


class MiningConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection for mining updates"""
        try:
            # Extract token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')
            
            if not token:
                logger.warning("No token provided in mining WebSocket connection")
                await self.close(code=4001)
                return
            
            # Validate token and get user
            user = await self.get_user_from_token(token)
            if not user:
                logger.warning("Invalid token provided in mining WebSocket connection")
                await self.close(code=4001)
                return
            
            self.user = user
            self.user_id = str(user.id)
            
            # Join user's mining room
            self.room_group_name = f"mining_user_{self.user_id}"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to mining updates',
                'user_id': self.user_id
            }))
            
            logger.info(f"Mining WebSocket connected: User {user.username}")
            
        except Exception as e:
            logger.error(f"Error in mining WebSocket connect: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"Mining WebSocket disconnected: User {getattr(self, 'user_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error in mining WebSocket disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.handle_ping()
            elif message_type == 'start_mining':
                await self.handle_start_mining()
            elif message_type == 'stop_mining':
                await self.handle_stop_mining()
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling mining WebSocket message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_ping(self):
        """Handle heartbeat ping"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))

    async def handle_start_mining(self):
        """Handle start mining request"""
        try:
            from .services.mining_service import MiningService
            success = await self.start_mining_session()
            
            if success:
                await self.send(text_data=json.dumps({
                    'type': 'mining_started',
                    'message': 'Mining session started'
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Failed to start mining session'
                }))
        except Exception as e:
            logger.error(f"Error starting mining session: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to start mining session'
            }))

    async def handle_stop_mining(self):
        """Handle stop mining request"""
        try:
            from .services.mining_service import MiningService
            success = await self.stop_mining_session()
            
            if success:
                await self.send(text_data=json.dumps({
                    'type': 'mining_stopped',
                    'message': 'Mining session stopped'
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Failed to stop mining session'
                }))
        except Exception as e:
            logger.error(f"Error stopping mining session: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to stop mining session'
            }))

    # WebSocket event handlers
    async def mining_update(self, event):
        """Send mining update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'mining_update',
            'data': event['data']
        }))

    async def mining_stats_update(self, event):
        """Send mining stats update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'mining_stats_update',
            'data': event['data']
        }))

    # Database operations
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.error(f"Token validation failed: {e}")
            return None

    @database_sync_to_async
    def start_mining_session(self):
        """Start mining session for user"""
        try:
            from .services.mining_service import MiningService
            return MiningService.start_mining_session(self.user)
        except Exception as e:
            logger.error(f"Error starting mining session: {e}")
            return False

    @database_sync_to_async
    def stop_mining_session(self):
        """Stop mining session for user"""
        try:
            from .services.mining_service import MiningService
            return MiningService.stop_mining_session(self.user)
        except Exception as e:
            logger.error(f"Error stopping mining session: {e}")
            return False


class BlockchainConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Handle WebSocket connection for blockchain updates"""
        try:
            # Extract token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')
            
            if not token:
                logger.warning("No token provided in blockchain WebSocket connection")
                await self.close(code=4001)
                return
            
            # Validate token and get user
            user = await self.get_user_from_token(token)
            if not user:
                logger.warning("Invalid token provided in blockchain WebSocket connection")
                await self.close(code=4001)
                return
            
            self.user = user
            self.user_id = str(user.id)
            
            # Join user's blockchain room
            self.room_group_name = f"blockchain_user_{self.user_id}"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to blockchain updates',
                'user_id': self.user_id
            }))
            
            logger.info(f"Blockchain WebSocket connected: User {user.username}")
            
        except Exception as e:
            logger.error(f"Error in blockchain WebSocket connect: {e}")
            await self.close(code=4000)

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"Blockchain WebSocket disconnected: User {getattr(self, 'user_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error in blockchain WebSocket disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.handle_ping()
            elif message_type == 'subscribe_transactions':
                await self.handle_subscribe_transactions(data)
            elif message_type == 'unsubscribe_transactions':
                await self.handle_unsubscribe_transactions(data)
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling blockchain WebSocket message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_ping(self):
        """Handle heartbeat ping"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))

    async def handle_subscribe_transactions(self, data):
        """Handle transaction subscription"""
        try:
            wallet_address = data.get('wallet_address')
            if wallet_address:
                # Join wallet-specific room
                wallet_room = f"blockchain_wallet_{wallet_address}"
                await self.channel_layer.group_add(
                    wallet_room,
                    self.channel_name
                )
                
                await self.send(text_data=json.dumps({
                    'type': 'transaction_subscribed',
                    'wallet_address': wallet_address
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Wallet address required'
                }))
        except Exception as e:
            logger.error(f"Error subscribing to transactions: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to subscribe to transactions'
            }))

    async def handle_unsubscribe_transactions(self, data):
        """Handle transaction unsubscription"""
        try:
            wallet_address = data.get('wallet_address')
            if wallet_address:
                # Leave wallet-specific room
                wallet_room = f"blockchain_wallet_{wallet_address}"
                await self.channel_layer.group_discard(
                    wallet_room,
                    self.channel_name
                )
                
                await self.send(text_data=json.dumps({
                    'type': 'transaction_unsubscribed',
                    'wallet_address': wallet_address
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': 'Wallet address required'
                }))
        except Exception as e:
            logger.error(f"Error unsubscribing from transactions: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Failed to unsubscribe from transactions'
            }))

    # WebSocket event handlers
    async def transaction_update(self, event):
        """Send transaction update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'transaction_update',
            'data': event['data']
        }))

    async def token_balance_update(self, event):
        """Send token balance update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'token_balance_update',
            'data': event['data']
        }))

    async def nft_update(self, event):
        """Send NFT update to WebSocket"""
        await self.send(text_data=json.dumps({
            'type': 'nft_update',
            'data': event['data']
        }))

    # Database operations
    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.error(f"Token validation failed: {e}")
            return None 

class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        """Simple test WebSocket connection"""
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connection_established',
            'message': 'Test WebSocket connected'
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        """Echo back the received message"""
        try:
            data = json.loads(text_data)
            await self.send(text_data=json.dumps({
                'type': 'echo',
                'message': data.get('message', ''),
                'timestamp': timezone.now().isoformat()
            }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))

class GenericChatConsumer(AsyncWebsocketConsumer):
    """Generic Chat Consumer - No conversation_id required"""
    
    async def connect(self):
        """Handle WebSocket connection with token authentication"""
        try:
            # Extract token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')
            
            if not token:
                logger.warning("No token provided in WebSocket connection")
                await self.close(code=4001)  # Custom code for authentication failure
                return
            
            # Validate token and get user
            user = await self.get_user_from_token(token)
            if not user:
                logger.warning("Invalid token provided in WebSocket connection")
                await self.close(code=4001)
                return
            
            self.user = user
            self.user_id = str(user.id)
            
            # Join user's personal chat room
            self.room_group_name = f"chat_user_{self.user_id}"
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to generic chat',
                'user_id': self.user_id
            }))
            
            logger.info(f"Generic Chat WebSocket connected: User {user.username}")
            
        except Exception as e:
            logger.error(f"Error in Generic Chat WebSocket connect: {e}")
            await self.close(code=4000)  # Custom code for general error

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except (TokenError, InvalidToken, User.DoesNotExist) as e:
            logger.error(f"Token validation failed: {e}")
            return None

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            logger.info(f"Generic Chat WebSocket disconnected: User {getattr(self, 'user_id', 'unknown')}")
        except Exception as e:
            logger.error(f"Error in Generic Chat WebSocket disconnect: {e}")

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'ping':
                await self.handle_ping()
            elif message_type == 'join_room':
                await self.handle_join_room(data)
            elif message_type == 'leave_room':
                await self.handle_leave_room(data)
            elif message_type == 'subscribe_user':
                await self.handle_subscribe_user(data)
            elif message_type == 'unsubscribe_user':
                await self.handle_unsubscribe_user(data)
            else:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"Error handling Generic Chat WebSocket message: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def handle_ping(self):
        """Handle heartbeat ping"""
        await self.send(text_data=json.dumps({
            'type': 'pong',
            'timestamp': timezone.now().isoformat()
        }))

    async def handle_join_room(self, data):
        """Handle joining a chat room"""
        room = data.get('room')
        if room:
            await self.channel_layer.group_add(
                f"chat_room_{room}",
                self.channel_name
            )
            await self.send(text_data=json.dumps({
                'type': 'room_joined',
                'room': room
            }))

    async def handle_leave_room(self, data):
        """Handle leaving a chat room"""
        room = data.get('room')
        if room:
            await self.channel_layer.group_discard(
                f"chat_room_{room}",
                self.channel_name
            )
            await self.send(text_data=json.dumps({
                'type': 'room_left',
                'room': room
            }))

    async def handle_subscribe_user(self, data):
        """Handle subscribing to user events"""
        target_user_id = data.get('target_user_id')
        if target_user_id:
            await self.channel_layer.group_add(
                f"chat_user_{target_user_id}",
                self.channel_name
            )
            await self.send(text_data=json.dumps({
                'type': 'user_subscribed',
                'target_user_id': target_user_id
            }))

    async def handle_unsubscribe_user(self, data):
        """Handle unsubscribing from user events"""
        target_user_id = data.get('target_user_id')
        if target_user_id:
            await self.channel_layer.group_discard(
                f"chat_user_{target_user_id}",
                self.channel_name
            )
            await self.send(text_data=json.dumps({
                'type': 'user_unsubscribed',
                'target_user_id': target_user_id
            }))

    async def chat_message(self, event):
        """Handle chat message events"""
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def user_online(self, event):
        """Handle user online events"""
        await self.send(text_data=json.dumps({
            'type': 'user_online',
            'user_id': event['user_id']
        }))

    async def user_offline(self, event):
        """Handle user offline events"""
        await self.send(text_data=json.dumps({
            'type': 'user_offline',
            'user_id': event['user_id']
        }))

class VideoCallConsumer(AsyncWebsocketConsumer):
    """
    WebSocket Consumer für VideoCall-Signaling (WebRTC)
    - Authentifizierung via Token
    - SDP/ICE-Austausch
    - Call-Status- und Teilnehmer-Events
    - Fehlerbehandlung und Logging
    """
    async def connect(self):
        """Handle WebSocket connection with token authentication"""
        try:
            # Extract token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            if query_string:
                params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
                token = params.get('token')
            
            if not token:
                await self.close(code=4001)
                return
            
            # Validate token and get user
            user = await self.get_user_from_token(token)
            if not user:
                await self.close(code=4001)
                return
            
            self.user = user
            self.user_id = str(user.id)
            self.room_id = self.scope['url_route']['kwargs']['room_id']
            self.room_group_name = f"video_call_{self.room_id}"
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            
            await self.accept()
            
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Connected to video call',
                'room_id': self.room_id,
                'user_id': self.user_id
            }))
            
        except Exception as e:
            await self.close(code=4000)

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validate JWT token and return user"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            return user
        except Exception:
            return None

    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        try:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        except Exception:
            pass

    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            msg_type = data.get('type')
            if msg_type in ['sdp', 'ice']:
                # Broadcast SDP/ICE to all in room
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'signaling_message',
                        'sender_id': self.user_id,
                        'payload': data
                    }
                )
            elif msg_type in ['call_status', 'participant_event']:
                # Broadcast call status/participant events
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'call_event',
                        'sender_id': self.user_id,
                        'payload': data
                    }
                )
            elif msg_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            else:
                await self.send(text_data=json.dumps({'type': 'error', 'message': f'Unknown message type: {msg_type}'}))
        except Exception as e:
            await self.send(text_data=json.dumps({'type': 'error', 'message': str(e)}))

    async def signaling_message(self, event):
        # Forward SDP/ICE to all except sender
        if event['sender_id'] != self.user_id:
            await self.send(text_data=json.dumps(event['payload']))

    async def call_event(self, event):
        # Forward call status/participant events to all except sender
        if event['sender_id'] != self.user_id:
            await self.send(text_data=json.dumps(event['payload'])) 

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Authentifiziere User über Token im Query
        query_string = self.scope.get('query_string', b'').decode()
        token = None
        if query_string:
            params = dict(param.split('=') for param in query_string.split('&') if '=' in param)
            token = params.get('token')
        
        print(f"[PresenceConsumer] Query string: {query_string}")
        print(f"[PresenceConsumer] Token found: {bool(token)}")
        
        if not token:
            print("[PresenceConsumer] ❌ Kein Token im Query")
            await self.close(code=4001)
            return
        
        user = await self.get_user_from_token(token)
        if not user:
            print("[PresenceConsumer] ❌ Token-Validierung fehlgeschlagen")
            await self.close(code=4001)
            return
        
        print(f"[PresenceConsumer] ✅ User authentifiziert: {user.username} (ID: {user.id})")
        self.user = user
        self.user_id = str(user.id)
        
        try:
            self.redis = await aioredis.from_url('redis://127.0.0.1:6379/0')  # Standardport für Redis
            print("[PresenceConsumer] ✅ Redis-Verbindung hergestellt")
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Redis-Verbindung fehlgeschlagen: {e}")
            await self.close(code=4000)
            return
        
        try:
            await self.accept()
            print("[PresenceConsumer] ✅ WebSocket-Verbindung akzeptiert")
        except Exception as e:
            print(f"[PresenceConsumer] ❌ WebSocket-Accept fehlgeschlagen: {e}")
            return
        
        try:
            await self.set_online()
            print("[PresenceConsumer] ✅ User als online gesetzt")
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Set online fehlgeschlagen: {e}")
        
        try:
            # Starte Heartbeat-Task nur wenn Verbindung erfolgreich ist
            self.heartbeat_task = asyncio.create_task(self.heartbeat_loop())
            print("[PresenceConsumer] ✅ Heartbeat-Task gestartet")
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Heartbeat-Task fehlgeschlagen: {e}")
        
        print(f"[PresenceConsumer] ✅ Presence-Verbindung für User {user.username} etabliert")

    async def disconnect(self, close_code):
        print(f"[PresenceConsumer] 🔌 Verbindung getrennt für User {getattr(self, 'user_id', 'unknown')}, Code: {close_code}")
        
        # Beende Heartbeat-Task zuerst
        if hasattr(self, 'heartbeat_task'):
            try:
                self.heartbeat_task.cancel()
                await self.heartbeat_task
                print("[PresenceConsumer] ✅ Heartbeat-Task beendet")
            except asyncio.CancelledError:
                print("[PresenceConsumer] ✅ Heartbeat-Task wurde abgebrochen")
            except Exception as e:
                print(f"[PresenceConsumer] ❌ Heartbeat-Task beenden fehlgeschlagen: {e}")
        
        # Setze User als offline
        try:
            await self.set_offline()
            print("[PresenceConsumer] ✅ User als offline gesetzt")
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Set offline fehlgeschlagen: {e}")
        
        # Schließe Redis-Verbindung
        if hasattr(self, 'redis'):
            try:
                await self.redis.close()
                print("[PresenceConsumer] ✅ Redis-Verbindung geschlossen")
            except Exception as e:
                print(f"[PresenceConsumer] ❌ Redis-Verbindung schließen fehlgeschlagen: {e}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_type = data.get('type')
            
            if message_type == 'heartbeat':
                # Aktualisiere Online-Status und sende Bestätigung
                await self.set_online()
                await self.send(text_data=json.dumps({
                    'type': 'heartbeat_ack',
                    'timestamp': timezone.now().isoformat()
                }))
                print(f"[PresenceConsumer] 💓 Heartbeat von User {self.user_id} - Bestätigung gesendet")
            
            elif message_type == 'ping':
                # Einfacher Ping/Pong für Verbindungstest
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))
                print(f"[PresenceConsumer] 🏓 Ping von User {self.user_id} - Pong gesendet")
            
            else:
                print(f"[PresenceConsumer] 📨 Unbekannte Nachricht von User {self.user_id}: {message_type}")
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': f'Unknown message type: {message_type}'
                }))
                
        except json.JSONDecodeError:
            print(f"[PresenceConsumer] ❌ JSON-Fehler von User {self.user_id}: {text_data}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON format'
            }))
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Receive-Fehler von User {self.user_id}: {e}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Internal server error'
            }))

    async def heartbeat_loop(self):
        """Periodischer Heartbeat-Loop für Online-Status"""
        try:
            while True:
                try:
                    await self.set_online()
                    print(f"[PresenceConsumer] 💓 Heartbeat-Loop: User {self.user_id} online gehalten")
                    await asyncio.sleep(30)  # Alle 30 Sekunden
                except asyncio.CancelledError:
                    print(f"[PresenceConsumer] 💓 Heartbeat-Loop für User {self.user_id} beendet")
                    break
                except Exception as e:
                    print(f"[PresenceConsumer] ❌ Heartbeat-Loop Fehler für User {self.user_id}: {e}")
                    await asyncio.sleep(5)  # Kurze Pause bei Fehler
        except asyncio.CancelledError:
            print(f"[PresenceConsumer] 💓 Heartbeat-Loop für User {self.user_id} abgebrochen")
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Heartbeat-Loop kritischer Fehler für User {self.user_id}: {e}")

    async def set_online(self):
        """Setze User als online in Redis"""
        try:
            # Setze Online-Status mit 60 Sekunden TTL
            await self.redis.set(f'presence:user:{self.user_id}', '1', ex=60)
            
            # Setze auch Timestamp für detailliertere Informationen
            await self.redis.set(f'presence:user:{self.user_id}:last_seen', 
                               timezone.now().isoformat(), ex=60)
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Set online Fehler für User {self.user_id}: {e}")
            raise

    async def set_offline(self):
        """Setze User als offline in Redis"""
        try:
            # Lösche Online-Status
            await self.redis.delete(f'presence:user:{self.user_id}')
            await self.redis.delete(f'presence:user:{self.user_id}:last_seen')
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Set offline Fehler für User {self.user_id}: {e}")
            raise

    @database_sync_to_async
    def get_user_from_token(self, token):
        """Validiere JWT Token und gebe User zurück"""
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            user = User.objects.get(id=user_id)
            print(f"[PresenceConsumer] ✅ Token validiert für User ID: {user_id}")
            return user
        except Exception as e:
            print(f"[PresenceConsumer] ❌ Token-Validierung fehlgeschlagen: {e}")
            return None


class SafeErrorLoggerConsumer(AsyncWebsocketConsumer):
    """
    Sichere WebSocket Consumer für Error Logging
    - Nur in Development aktiv
    - Silent Fail bei Fehlern
    - Begrenzte Log-Anzahl
    """
    
    async def connect(self):
        """Handle WebSocket connection for error logging safely"""
        try:
            # Nur in Development aktivieren
            from django.conf import settings
            if not settings.DEBUG:
                await self.close(code=4000)
                return
            
            # Accept connection first
            await self.accept()
            
            # Send confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'message': 'Error Logger connected safely'
            }))
            
            logger.info("Safe Error Logger WebSocket connected")
            
        except Exception as e:
            logger.warning(f"Error Logger connection failed: {e}")
            try:
                await self.close(code=4000)
            except:
                pass

    async def disconnect(self, close_code):
        """Safe disconnect"""
        try:
            logger.info("Safe Error Logger WebSocket disconnected")
        except:
            pass

    async def receive(self, text_data):
        """Handle incoming error log messages safely"""
        try:
            data = json.loads(text_data)
            
            # Validate data
            if not isinstance(data, dict):
                return
            
            # Save error log safely
            await self.safe_save_error_log(data)
            
            # Send acknowledgment
            await self.send(text_data=json.dumps({
                'type': 'error_log_received',
                'timestamp': timezone.now().isoformat()
            }))
            
        except json.JSONDecodeError:
            # Silent fail for invalid JSON
            pass
        except Exception as e:
            logger.warning(f"Error handling error log: {e}")
            # Don't send error response to avoid loops

    @database_sync_to_async
    def safe_save_error_log(self, data):
        """Save error log with error handling"""
        try:
            from .models import EventLog
            
            # Validate and sanitize data
            message = str(data.get('message', ''))[:1000]  # Limit message length
            level = data.get('level', 'error')
            if level not in ['debug', 'info', 'warning', 'error', 'critical']:
                level = 'error'
            
            EventLog.objects.create(
                event_type='frontend_error',
                level=level,
                user_id=data.get('userId'),
                message=message,
                metadata={
                    'url': data.get('url', ''),
                    'component': data.get('component', ''),
                    'context': data.get('context', ''),
                    'sessionId': data.get('sessionId', ''),
                    'additionalData': data.get('additionalData', {})
                }
            )
        except Exception as e:
            logger.warning(f"Failed to save error log: {e}") 