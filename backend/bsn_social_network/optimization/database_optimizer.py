"""
Database Optimization System for BSN Social Network
Handles query optimization, indexing, and caching strategies
"""

import logging
from django.db import connection, models
from django.core.cache import cache
from django.conf import settings
from django.db.models import Count, Q, Prefetch
from django.utils import timezone
from datetime import timedelta
import json
import time

logger = logging.getLogger(__name__)

class DatabaseOptimizer:
    """
    Database optimization system for BSN Social Network
    """
    
    def __init__(self):
        self.cache_prefix = "bsn_optimizer_"
        self.query_stats = {}
        self.slow_query_threshold = 1000  # milliseconds
        
    def optimize_queryset(self, queryset, select_related=None, prefetch_related=None):
        """
        Optimize queryset with select_related and prefetch_related
        """
        if select_related:
            queryset = queryset.select_related(*select_related)
        
        if prefetch_related:
            queryset = queryset.prefetch_related(*prefetch_related)
            
        return queryset
    
    def create_database_indexes(self):
        """
        Create essential database indexes for performance
        """
        with connection.cursor() as cursor:
            # Users table indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
                CREATE INDEX IF NOT EXISTS idx_users_date_joined ON users(date_joined);
                CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
            """)
            
            # Posts table indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_posts_group ON posts(group_id);
                CREATE INDEX IF NOT EXISTS idx_posts_content_search ON posts USING gin(to_tsvector('english', content));
            """)
            
            # Comments table indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
                CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);
            """)
            
            # Likes table indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);
                CREATE INDEX IF NOT EXISTS idx_likes_user ON likes(user_id);
                CREATE INDEX IF NOT EXISTS idx_likes_created ON likes(created_at DESC);
            """)
            
            # Friendships table indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_friendships_user1 ON friendships(user1_id);
                CREATE INDEX IF NOT EXISTS idx_friendships_user2 ON friendships(user2_id);
                CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
            """)
            
            # Mining related indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_mining_sessions_user_date ON mining_sessions(user_id, session_date);
                CREATE INDEX IF NOT EXISTS idx_mining_progress_user ON mining_progress(user_id);
                CREATE INDEX IF NOT EXISTS idx_boosts_user_active ON boosts(user_id, is_active, expires_at);
            """)
            
            # Notifications table indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
                CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
                CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
            """)
            
            # Messages table indexes
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
                CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
                CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
            """)
            
            logger.info("Database indexes created successfully")
    
    def optimize_post_queries(self):
        """
        Optimize post-related queries with caching
        """
        from bsn_social_network.models import Post, User, Comment, Like
        
        # Cache popular posts
        popular_posts = Post.objects.annotate(
            likes_count=Count('likes'),
            comments_count=Count('comments')
        ).filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).order_by('-likes_count', '-comments_count')[:20]
        
        cache.set('popular_posts', list(popular_posts.values()), 300)  # 5 minutes
        
        # Cache trending hashtags
        trending_hashtags = Post.objects.filter(
            content__icontains='#'
        ).extra(
            select={'hashtag': "regexp_replace(content, '.*#([a-zA-Z0-9_]+).*', '\\1')"}
        ).values('hashtag').annotate(
            count=Count('id')
        ).order_by('-count')[:10]
        
        cache.set('trending_hashtags', list(trending_hashtags), 600)  # 10 minutes
        
        # Cache user feed templates
        for user in User.objects.filter(is_active=True)[:100]:  # Limit to active users
            feed_cache_key = f'user_feed_{user.id}'
            user_following = user.following.all()
            
            if user_following.exists():
                feed_posts = Post.objects.filter(
                    author__in=user_following
                ).select_related('author').prefetch_related(
                    'likes', 'comments'
                ).order_by('-created_at')[:50]
                
                cache.set(feed_cache_key, list(feed_posts.values()), 300)
    
    def optimize_user_queries(self):
        """
        Optimize user-related queries
        """
        from bsn_social_network.models import User, Post, Comment, Like
        
        # Cache user statistics
        for user in User.objects.filter(is_active=True)[:100]:
            stats_cache_key = f'user_stats_{user.id}'
            
            user_stats = {
                'posts_count': Post.objects.filter(author=user).count(),
                'comments_count': Comment.objects.filter(author=user).count(),
                'likes_given': Like.objects.filter(user=user).count(),
                'likes_received': Like.objects.filter(post__author=user).count(),
                'followers_count': user.followers.count(),
                'following_count': user.following.count(),
            }
            
            cache.set(stats_cache_key, user_stats, 1800)  # 30 minutes
    
    def optimize_mining_queries(self):
        """
        Optimize mining-related queries
        """
        from bsn_social_network.models import MiningProgress, MiningSession, Boost
        
        # Cache mining leaderboard
        mining_leaderboard = MiningProgress.objects.select_related('user').annotate(
            total_mined=models.Sum('accumulated_tokens')
        ).order_by('-accumulated_tokens')[:50]
        
        cache.set('mining_leaderboard', list(mining_leaderboard.values()), 300)
        
        # Cache active mining sessions
        active_sessions = MiningSession.objects.filter(
            is_active=True
        ).select_related('user').values('user_id', 'start_time', 'duration')
        
        cache.set('active_mining_sessions', list(active_sessions), 60)  # 1 minute
    
    def monitor_slow_queries(self, query_time):
        """
        Monitor and log slow queries
        """
        if query_time > self.slow_query_threshold:
            logger.warning(f"Slow query detected: {query_time}ms")
            
            # Store slow query statistics
            slow_queries = cache.get('slow_queries', [])
            slow_queries.append({
                'timestamp': timezone.now().isoformat(),
                'duration': query_time,
                'query': getattr(connection.queries[-1], 'sql', 'Unknown')
            })
            
            # Keep only last 100 slow queries
            if len(slow_queries) > 100:
                slow_queries = slow_queries[-100:]
            
            cache.set('slow_queries', slow_queries, 3600)  # 1 hour
    
    def analyze_query_performance(self):
        """
        Analyze database query performance
        """
        performance_stats = {
            'total_queries': len(connection.queries),
            'total_time': sum(float(q.get('time', 0)) for q in connection.queries),
            'slow_queries': len([q for q in connection.queries if float(q.get('time', 0)) > self.slow_query_threshold]),
            'cache_hits': cache.get('cache_hits', 0),
            'cache_misses': cache.get('cache_misses', 0),
        }
        
        if performance_stats['total_queries'] > 0:
            performance_stats['average_time'] = performance_stats['total_time'] / performance_stats['total_queries']
        else:
            performance_stats['average_time'] = 0
        
        cache.set('performance_stats', performance_stats, 300)  # 5 minutes
        return performance_stats
    
    def optimize_cache_strategy(self):
        """
        Implement advanced caching strategy
        """
        # Cache frequently accessed data
        cache_patterns = {
            'user_profiles': 1800,  # 30 minutes
            'post_feeds': 300,      # 5 minutes
            'mining_stats': 60,     # 1 minute
            'notifications': 300,   # 5 minutes
            'search_results': 600,  # 10 minutes
        }
        
        for pattern, ttl in cache_patterns.items():
            cache_key = f'{self.cache_prefix}{pattern}'
            if not cache.get(cache_key):
                cache.set(cache_key, {}, ttl)
    
    def cleanup_old_data(self):
        """
        Clean up old data to maintain performance
        """
        from bsn_social_network.models import Post, Comment, Notification, MiningSession
        
        # Clean up old posts (keep last 6 months)
        six_months_ago = timezone.now() - timedelta(days=180)
        old_posts = Post.objects.filter(created_at__lt=six_months_ago)
        old_posts_count = old_posts.count()
        old_posts.delete()
        
        # Clean up old notifications (keep last 3 months)
        three_months_ago = timezone.now() - timedelta(days=90)
        old_notifications = Notification.objects.filter(
            created_at__lt=three_months_ago,
            is_read=True
        )
        old_notifications_count = old_notifications.count()
        old_notifications.delete()
        
        # Clean up old mining sessions (keep last month)
        one_month_ago = timezone.now() - timedelta(days=30)
        old_sessions = MiningSession.objects.filter(
            end_time__lt=one_month_ago
        )
        old_sessions_count = old_sessions.count()
        old_sessions.delete()
        
        logger.info(f"Cleaned up: {old_posts_count} old posts, {old_notifications_count} notifications, {old_sessions_count} mining sessions")
    
    def generate_performance_report(self):
        """
        Generate comprehensive performance report
        """
        performance_stats = self.analyze_query_performance()
        
        report = {
            'timestamp': timezone.now().isoformat(),
            'database_performance': performance_stats,
            'cache_stats': {
                'hits': cache.get('cache_hits', 0),
                'misses': cache.get('cache_misses', 0),
                'hit_rate': self._calculate_cache_hit_rate(),
            },
            'slow_queries': cache.get('slow_queries', []),
            'recommendations': self._generate_recommendations(performance_stats)
        }
        
        return report
    
    def _calculate_cache_hit_rate(self):
        """
        Calculate cache hit rate
        """
        hits = cache.get('cache_hits', 0)
        misses = cache.get('cache_misses', 0)
        total = hits + misses
        
        if total > 0:
            return (hits / total) * 100
        return 0
    
    def _generate_recommendations(self, performance_stats):
        """
        Generate performance improvement recommendations
        """
        recommendations = []
        
        if performance_stats['average_time'] > 100:
            recommendations.append("Consider adding more database indexes")
        
        if performance_stats['slow_queries'] > 10:
            recommendations.append("Optimize slow queries with better indexing")
        
        if self._calculate_cache_hit_rate() < 80:
            recommendations.append("Increase cache usage for frequently accessed data")
        
        if performance_stats['total_queries'] > 1000:
            recommendations.append("Consider implementing query result caching")
        
        return recommendations

class QueryOptimizer:
    """
    Query-specific optimization utilities
    """
    
    @staticmethod
    def optimize_feed_query(user_id):
        """
        Optimize user feed query
        """
        from bsn_social_network.models import Post, User
        
        user = User.objects.get(id=user_id)
        following = user.following.all()
        
        return Post.objects.filter(
            Q(author__in=following) | Q(author=user)
        ).select_related(
            'author', 'group'
        ).prefetch_related(
            Prefetch('likes', queryset=User.objects.only('id', 'username')),
            Prefetch('comments', queryset=Comment.objects.select_related('author'))
        ).annotate(
            likes_count=Count('likes'),
            comments_count=Count('comments')
        ).order_by('-created_at')
    
    @staticmethod
    def optimize_search_query(query):
        """
        Optimize search query
        """
        from bsn_social_network.models import Post, User
        
        return Post.objects.filter(
            Q(content__icontains=query) |
            Q(author__username__icontains=query) |
            Q(author__first_name__icontains=query) |
            Q(author__last_name__icontains=query)
        ).select_related('author').annotate(
            relevance=models.Case(
                models.When(content__icontains=query, then=3),
                models.When(author__username__icontains=query, then=2),
                default=1
            )
        ).order_by('-relevance', '-created_at')
    
    @staticmethod
    def optimize_notification_query(user_id):
        """
        Optimize notification query
        """
        from bsn_social_network.models import Notification
        
        return Notification.objects.filter(
            recipient_id=user_id
        ).select_related(
            'sender', 'post', 'comment'
        ).order_by('-created_at')

# Initialize optimizer
db_optimizer = DatabaseOptimizer() 