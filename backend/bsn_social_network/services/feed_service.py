import logging
from django.db.models import Q, Count, F
from django.utils import timezone
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from ..models import Post, User, FollowRelationship, Like, Comment, Story
import json
from django.conf import settings
from django.core.cache import cache
import asyncio

logger = logging.getLogger(__name__)
User = get_user_model()

class FeedService:
    """
    Service for managing real-time feed updates and personalization with caching
    """
    
    CACHE_TTL = 300  # 5 minutes
    FEED_CACHE_KEY = "user_feed_{user_id}_{feed_type}_{page}"
    
    @staticmethod
    def get_user_feed(user, feed_type='following', page=1, page_size=20):
        """
        Get personalized feed for user with caching
        """
        try:
            # Try to get from cache first
            cache_key = FeedService.FEED_CACHE_KEY.format(
                user_id=user.id, feed_type=feed_type, page=page
            )
            
            cached_feed = cache.get(cache_key)
            if cached_feed:
                logger.info(f"Feed served from cache for user {user.id}")
                return cached_feed
            
            # Build feed query
            if feed_type == 'following':
                # Get users that the current user is following
                # following_users = FollowRelationship.objects.filter(
                #     user=user
                # ).values_list('friend_id', flat=True)
                
                # Temporarily return empty list
                following_users = []
                
                posts = Post.objects.filter(
                    Q(author_id__in=following_users) | Q(author=user)
                ).select_related('author').prefetch_related(
                    'likes', 'comments'
                ).order_by('-created_at')
                
            elif feed_type == 'popular':
                # Get popular posts based on likes and comments
                posts = Post.objects.annotate(
                    engagement_score=F('likes_count') + F('comments_count') * 2
                ).filter(
                    created_at__gte=timezone.now() - timezone.timedelta(days=7)
                ).select_related('author').prefetch_related(
                    'likes', 'comments'
                ).order_by('-engagement_score', '-created_at')
                
            elif feed_type == 'recent':
                # Get recent posts
                posts = Post.objects.select_related('author').prefetch_related(
                    'likes', 'comments'
                ).order_by('-created_at')
            
            else:
                # Default to following feed
                # Get users that the current user is following
                # following_users = FollowRelationship.objects.filter(
                #     user=user
                # ).values_list('friend_id', flat=True)
                
                # Temporarily return empty list
                following_users = []
                
                posts = Post.objects.filter(
                    Q(author_id__in=following_users) | Q(author=user)
                ).select_related('author').prefetch_related(
                    'likes', 'comments'
                ).order_by('-created_at')
            
            # Pagination
            start = (page - 1) * page_size
            end = start + page_size
            posts = posts[start:end]
            
            # Serialize posts
            feed_data = []
            for post in posts:
                post_data = {
                    'id': post.id,
                    'content': post.content,
                    'media_url': post.media_url,
                    'media_type': post.media_type,
                    'hashtags': post.hashtags,
                    'likes_count': post.likes_count,
                    'comments_count': post.comments_count,
                    'created_at': post.created_at.isoformat(),
                    'author': {
                        'id': post.author.id,
                        'username': post.author.username,
                        'display_name': post.author.display_name,
                        'avatar_url': post.author.avatar_url,
                    }
                }
                feed_data.append(post_data)
            
            # Cache the result
            cache.set(cache_key, feed_data, FeedService.CACHE_TTL)
            
            logger.info(f"Generated feed for user {user.id}, type: {feed_type}, posts: {len(feed_data)}")
            return feed_data
            
        except Exception as e:
            logger.error(f"Error getting user feed: {e}")
            return []
    
    @staticmethod
    def invalidate_user_feed_cache(user_id, feed_type=None):
        """
        Invalidate feed cache for user
        """
        try:
            if feed_type:
                # Invalidate specific feed type
                cache.delete_pattern(f"user_feed_{user_id}_{feed_type}_*")
            else:
                # Invalidate all feed types for user
                cache.delete_pattern(f"user_feed_{user_id}_*")
                
            logger.info(f"Invalidated feed cache for user {user_id}")
            
        except Exception as e:
            logger.error(f"Error invalidating feed cache: {e}")
    
    @staticmethod
    def notify_new_post(post):
        """
        Notify followers about new post via WebSocket with error handling
        """
        try:
            channel_layer = get_channel_layer()
            
            # Get post data
            post_data = {
                'id': post.id,
                'content': post.content,
                'media_url': post.media_url,
                'media_type': post.media_type,
                'hashtags': post.hashtags,
                'created_at': post.created_at.isoformat(),
                'author': {
                    'id': post.author.id,
                    'username': post.author.username,
                    'display_name': post.author.display_name,
                    'avatar_url': post.author.avatar_url,
                }
            }
            
            # Get followers of the post author
            # followers = FollowRelationship.objects.filter(friend=post.author)
            # Temporarily return empty list
            followers = []
            
            # Send notification to each follower
            notification_count = 0
            for follow_rel in followers:
                try:
                    room_name = f"feed_user_{follow_rel.user.id}"
                    async_to_sync(channel_layer.group_send)(
                        room_name,
                        {
                            'type': 'new_post',
                            'post': post_data
                        }
                    )
                    notification_count += 1
                    
                    # Invalidate cache for this user
                    FeedService.invalidate_user_feed_cache(follow_rel.user.id, 'following')
                    
                except Exception as e:
                    logger.error(f"Error sending notification to user {follow_rel.user.id}: {e}")
                    continue
            
            logger.info(f"Notified {notification_count}/{followers.count()} followers about new post {post.id}")
            
        except Exception as e:
            logger.error(f"Error notifying new post: {e}")
    
    @staticmethod
    def notify_post_liked(post, user):
        """
        Notify about post like via WebSocket with error handling
        """
        try:
            channel_layer = get_channel_layer()
            
            like_data = {
                'post_id': post.id,
                'user_id': user.id,
                'username': user.username,
                'display_name': user.display_name,
                'avatar_url': user.avatar_url,
            }
            
            # Send to post author
            try:
                room_name = f"feed_user_{post.author.id}"
                async_to_sync(channel_layer.group_send)(
                    room_name,
                    {
                        'type': 'post_liked',
                        **like_data
                    }
                )
            except Exception as e:
                logger.error(f"Error notifying post author {post.author.id}: {e}")
            
            # Send to all users viewing this post
            try:
                room_name = f"post_{post.id}"
                async_to_sync(channel_layer.group_send)(
                    room_name,
                    {
                        'type': 'post_liked',
                        **like_data
                    }
                )
            except Exception as e:
                logger.error(f"Error notifying post viewers: {e}")
            
            # Invalidate cache for post author and liker
            FeedService.invalidate_user_feed_cache(post.author.id)
            FeedService.invalidate_user_feed_cache(user.id)
            
        except Exception as e:
            logger.error(f"Error notifying post like: {e}")
    
    @staticmethod
    def notify_post_commented(post, comment, user):
        """
        Notify about post comment via WebSocket
        """
        try:
            channel_layer = get_channel_layer()
            
            comment_data = {
                'post_id': post.id,
                'comment_id': comment.id,
                'content': comment.content,
                'created_at': comment.created_at.isoformat(),
                'user_id': user.id,
                'username': user.username,
                'display_name': user.display_name,
                'avatar_url': user.avatar_url,
            }
            
            # Send to post author
            try:
                room_name = f"feed_user_{post.author.id}"
                async_to_sync(channel_layer.group_send)(
                    room_name,
                    {
                        'type': 'post_commented',
                        **comment_data
                    }
                )
            except Exception as e:
                logger.error(f"Error notifying post author about comment: {e}")
            
            # Send to all users viewing this post
            try:
                room_name = f"post_{post.id}"
                async_to_sync(channel_layer.group_send)(
                    room_name,
                    {
                        'type': 'post_commented',
                        **comment_data
                    }
                )
            except Exception as e:
                logger.error(f"Error notifying post viewers about comment: {e}")
            
            # Invalidate cache
            FeedService.invalidate_user_feed_cache(post.author.id)
            FeedService.invalidate_user_feed_cache(user.id)
            
        except Exception as e:
            logger.error(f"Error notifying post comment: {e}")
    
    @staticmethod
    def notify_story_created(story):
        """
        Notify about new story via WebSocket with error handling
        """
        try:
            channel_layer = get_channel_layer()
            
            story_data = {
                'id': story.id,
                'content': story.content,
                'media_url': story.media_url,
                'story_type': story.story_type,
                'created_at': story.created_at.isoformat(),
                'expires_at': story.expires_at.isoformat(),
                'author': {
                    'id': story.author.id,
                    'username': story.author.username,
                    'display_name': story.author.display_name,
                    'avatar_url': story.author.avatar_url,
                }
            }
            
            # Get followers of the story author
            # followers = FollowRelationship.objects.filter(friend=story.author)
            # Temporarily return empty list
            followers = []
            
            # Send notification to each follower
            notification_count = 0
            for follow_rel in followers:
                try:
                    room_name = f"feed_user_{follow_rel.user.id}"
                    async_to_sync(channel_layer.group_send)(
                        room_name,
                        {
                            'type': 'story_created',
                            'story': story_data
                        }
                    )
                    notification_count += 1
                    
                except Exception as e:
                    logger.error(f"Error sending story notification to user {follow_rel.user.id}: {e}")
                    continue
            
            logger.info(f"Notified {notification_count}/{followers.count()} followers about new story {story.id}")
            
        except Exception as e:
            logger.error(f"Error notifying story created: {e}")
    
    @staticmethod
    def notify_user_followed(follower, followed):
        """
        Notify about user follow via WebSocket
        """
        try:
            channel_layer = get_channel_layer()
            
            follow_data = {
                'follower_id': follower.id,
                'follower_username': follower.username,
                'follower_display_name': follower.display_name,
                'follower_avatar_url': follower.avatar_url,
                'followed_id': followed.id,
                'followed_username': followed.username,
                'followed_display_name': followed.display_name,
                'followed_avatar_url': followed.avatar_url,
            }
            
            # Send to followed user
            try:
                room_name = f"feed_user_{followed.id}"
                async_to_sync(channel_layer.group_send)(
                    room_name,
                    {
                        'type': 'user_followed',
                        **follow_data
                    }
                )
            except Exception as e:
                logger.error(f"Error notifying followed user: {e}")
            
            # Invalidate cache for both users
            FeedService.invalidate_user_feed_cache(follower.id)
            FeedService.invalidate_user_feed_cache(followed.id)
            
        except Exception as e:
            logger.error(f"Error notifying user follow: {e}")
    
    @staticmethod
    def get_feed_statistics(user):
        """
        Get feed statistics for user
        """
        try:
            # Get user's following and follower counts
            # following_count = FollowRelationship.objects.filter(user=user).count()
            # follower_count = FollowRelationship.objects.filter(friend=user).count()
            
            # Temporarily return 0
            following_count = 0
            follower_count = 0
            
            # Get post count
            post_count = Post.objects.filter(author=user).count()
            
            # Get total likes received
            total_likes = Like.objects.filter(post__author=user).count()
            
            # Get total comments received
            total_comments = Comment.objects.filter(post__author=user).count()
            
            return {
                'following_count': following_count,
                'follower_count': follower_count,
                'post_count': post_count,
                'total_likes': total_likes,
                'total_comments': total_comments,
            }
            
        except Exception as e:
            logger.error(f"Error getting feed statistics: {e}")
            return {} 