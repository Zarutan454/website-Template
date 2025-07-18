import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import AnonymousUser

logger = logging.getLogger(__name__)
User = get_user_model()

class BaseWebSocketConsumer(AsyncWebsocketConsumer):
    """
    Base WebSocket consumer with authentication and common functionality
    """
    
    async def connect(self):
        """Handle WebSocket connection with token authentication"""
        try:
            # Get token from query parameters
            query_string = self.scope.get('query_string', b'').decode()
            token = None
            
            # Parse query string to get token
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('=')[1]
                    break
            
            if not token:
                logger.warning("No token provided in WebSocket connection")
                await self.close(code=4001, reason="No token provided")
                return
            
            # Authenticate user
            user = await self.authenticate_user(token)
            if not user:
                logger.warning(f"Invalid token for WebSocket connection: {token[:20]}...")
                await self.close(code=4002, reason="Invalid token")
                return
            
            # Store user in scope
            self.scope['user'] = user
            self.user = user
            
            # Accept the connection
            await self.accept()
            
            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'user_id': user.id,
                'username': user.username
            }))
            
            logger.info(f"WebSocket connected for user: {user.username}")
            
        except Exception as e:
            logger.error(f"❌ WebSocket connection error: {str(e)}")
            await self.close(code=4003, reason="Connection error")
    
    @database_sync_to_async
    def authenticate_user(self, token_string):
        """Authenticate user using JWT token"""
        try:
            # Create JWT authentication instance
            jwt_auth = JWTAuthentication()
            
            # Validate token
            validated_token = jwt_auth.get_validated_token(token_string)
            
            # Get user from token
            user = jwt_auth.get_user(validated_token)
            
            if user and user.is_authenticated:
                return user
            else:
                logger.warning("Token validation failed: user not authenticated")
                return None
                
        except (InvalidToken, TokenError) as e:
            logger.warning(f"Token validation failed: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return None
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        user_info = f"{self.user.username}" if hasattr(self, 'user') and self.user else "Unknown"
        logger.info(f"WebSocket disconnected for user: {user_info} (code: {close_code})")
    
    async def receive(self, text_data):
        """Handle incoming WebSocket messages"""
        try:
            data = json.loads(text_data)
            message_type = data.get('type', 'unknown')
            
            logger.info(f"Received {message_type} from {getattr(self.user, 'username', 'Unknown')}")
            
            # Handle different message types
            if message_type == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
            elif message_type == 'subscribe_feed':
                await self.handle_feed_subscription(data)
            else:
                await self.handle_message(data)
                
        except json.JSONDecodeError:
            logger.error("❌ Invalid JSON received")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Invalid JSON format'
            }))
        except Exception as e:
            logger.error(f"❌ Error handling message: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'error': 'Internal server error'
            }))
    
    async def handle_message(self, data):
        """Handle general messages - override in subclasses"""
        await self.send(text_data=json.dumps({
            'type': 'message_received',
            'message': 'Message received successfully'
        }))
    
    async def handle_feed_subscription(self, data):
        """Handle feed subscription"""
        feed_type = data.get('feed_type', 'following')
        logger.info(f"User {self.user.username} subscribed to {feed_type} feed")
        
        await self.send(text_data=json.dumps({
            'type': 'feed_subscribed',
            'feed_type': feed_type
        }))

class MessagingConsumer(BaseWebSocketConsumer):
    """
    WebSocket consumer for messaging functionality
    """
    
    async def handle_message(self, data):
        """Handle messaging-specific messages"""
        message_type = data.get('type')
        
        if message_type == 'send_message':
            # Handle sending a message
            await self.send(text_data=json.dumps({
                'type': 'message_received',
                'message': {
                    'id': 1,
                    'conversation_id': data.get('conversation_id'),
                    'sender_id': self.user.id,
                    'sender_name': self.user.username,
                    'content': data.get('content', ''),
                    'message_type': 'text',
                    'timestamp': '2024-01-01T00:00:00Z'
                }
            }))
        elif message_type == 'typing':
            # Handle typing indicator
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'conversation_id': data.get('conversation_id'),
                'user_id': self.user.id,
                'user_name': self.user.username,
                'is_typing': data.get('is_typing', False)
            }))
        else:
            await super().handle_message(data)

class FeedConsumer(BaseWebSocketConsumer):
    """
    WebSocket consumer for feed updates
    """
    
    async def handle_message(self, data):
        """Handle feed-specific messages"""
        message_type = data.get('type')
        
        if message_type == 'new_post':
            # Simulate new post notification
            await self.send(text_data=json.dumps({
                'type': 'new_post',
                'post': {
                    'id': 1,
                    'author': {'username': 'test_user'},
                    'content': 'Test post content'
                }
            }))
        elif message_type == 'post_liked':
            # Simulate post like notification
            await self.send(text_data=json.dumps({
                'type': 'post_liked',
                'post_id': data.get('post_id'),
                'user_id': self.user.id,
                'username': self.user.username
            }))
        else:
            await super().handle_message(data)

class NotificationConsumer(BaseWebSocketConsumer):
    """
    WebSocket consumer for notifications
    """
    
    async def handle_message(self, data):
        """Handle notification-specific messages"""
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'message': 'Notification received'
        }))

class MiningConsumer(BaseWebSocketConsumer):
    """
    WebSocket consumer for mining functionality
    """
    
    async def handle_message(self, data):
        """Handle mining-specific messages"""
        await self.send(text_data=json.dumps({
            'type': 'mining_update',
            'message': 'Mining status updated'
        }))

class BlockchainConsumer(BaseWebSocketConsumer):
    """
    WebSocket consumer for blockchain functionality
    """
    
    async def handle_message(self, data):
        """Handle blockchain-specific messages"""
        await self.send(text_data=json.dumps({
            'type': 'blockchain_update',
            'message': 'Blockchain status updated'
        })) 