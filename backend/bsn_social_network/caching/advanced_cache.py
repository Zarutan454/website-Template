"""
Advanced Caching System for BSN Social Network
Handles Redis caching, cache strategies, and performance monitoring
"""

import json
import hashlib
import time
from typing import Any, Dict, List, Optional, Union
from django.core.cache import cache
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging
from django.db.models import Count

logger = logging.getLogger(__name__)

class AdvancedCache:
    """
    Advanced caching system with Redis integration
    """
    
    def __init__(self):
        self.cache_prefix = "bsn_advanced_"
        self.default_ttl = 300  # 5 minutes
        self.cache_stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0
        }
    
    def _generate_cache_key(self, prefix: str, *args) -> str:
        """
        Generate consistent cache key
        """
        key_parts = [prefix] + [str(arg) for arg in args]
        return f"{self.cache_prefix}{'_'.join(key_parts)}"
    
    def _serialize_data(self, data: Any) -> str:
        """
        Serialize data for caching
        """
        if isinstance(data, (dict, list)):
            return json.dumps(data, default=str)
        return str(data)
    
    def _deserialize_data(self, data: str) -> Any:
        """
        Deserialize cached data
        """
        try:
            return json.loads(data)
        except (json.JSONDecodeError, TypeError):
            return data
    
    def get(self, key: str, default: Any = None) -> Any:
        """
        Get data from cache with statistics
        """
        cache_key = self._generate_cache_key(key)
        data = cache.get(cache_key)
        
        if data is not None:
            self.cache_stats['hits'] += 1
            return self._deserialize_data(data)
        else:
            self.cache_stats['misses'] += 1
            return default
    
    def set(self, key: str, value: Any, ttl: int = None) -> bool:
        """
        Set data in cache with statistics
        """
        cache_key = self._generate_cache_key(key)
        serialized_value = self._serialize_data(value)
        ttl = ttl or self.default_ttl
        
        success = cache.set(cache_key, serialized_value, ttl)
        if success:
            self.cache_stats['sets'] += 1
        
        return success
    
    def delete(self, key: str) -> bool:
        """
        Delete data from cache with statistics
        """
        cache_key = self._generate_cache_key(key)
        success = cache.delete(cache_key)
        
        if success:
            self.cache_stats['deletes'] += 1
        
        return success
    
    def get_or_set(self, key: str, default_func, ttl: int = None) -> Any:
        """
        Get data from cache or set if not exists
        """
        data = self.get(key)
        if data is None:
            data = default_func()
            self.set(key, data, ttl)
        return data
    
    def invalidate_pattern(self, pattern: str) -> int:
        """
        Invalidate all cache keys matching pattern
        """
        # Note: This is a simplified version. In production, you'd use Redis SCAN
        # For now, we'll track patterns manually
        pattern_key = f"{self.cache_prefix}pattern_{pattern}"
        invalidated_keys = cache.get(pattern_key, [])
        
        for key in invalidated_keys:
            cache.delete(key)
        
        cache.delete(pattern_key)
        return len(invalidated_keys)

class UserCache:
    """
    User-specific caching utilities
    """
    
    def __init__(self):
        self.cache = AdvancedCache()
        self.user_ttl = 1800  # 30 minutes
    
    def get_user_profile(self, user_id: int) -> Optional[Dict]:
        """
        Get cached user profile
        """
        return self.cache.get(f"user_profile_{user_id}")
    
    def set_user_profile(self, user_id: int, profile_data: Dict) -> bool:
        """
        Cache user profile
        """
        return self.cache.set(f"user_profile_{user_id}", profile_data, self.user_ttl)
    
    def get_user_stats(self, user_id: int) -> Optional[Dict]:
        """
        Get cached user statistics
        """
        return self.cache.get(f"user_stats_{user_id}")
    
    def set_user_stats(self, user_id: int, stats_data: Dict) -> bool:
        """
        Cache user statistics
        """
        return self.cache.set(f"user_stats_{user_id}", stats_data, self.user_ttl)
    
    def invalidate_user_cache(self, user_id: int) -> bool:
        """
        Invalidate all user-related cache
        """
        patterns = [
            f"user_profile_{user_id}",
            f"user_stats_{user_id}",
            f"user_feed_{user_id}",
            f"user_notifications_{user_id}"
        ]
        
        for pattern in patterns:
            self.cache.delete(pattern)
        
        return True

class PostCache:
    """
    Post-specific caching utilities
    """
    
    def __init__(self):
        self.cache = AdvancedCache()
        self.post_ttl = 300  # 5 minutes
        self.feed_ttl = 180  # 3 minutes
    
    def get_user_feed(self, user_id: int) -> Optional[List[Dict]]:
        """
        Get cached user feed
        """
        return self.cache.get(f"user_feed_{user_id}")
    
    def set_user_feed(self, user_id: int, feed_data: List[Dict]) -> bool:
        """
        Cache user feed
        """
        return self.cache.set(f"user_feed_{user_id}", feed_data, self.feed_ttl)
    
    def get_popular_posts(self) -> Optional[List[Dict]]:
        """
        Get cached popular posts
        """
        return self.cache.get("popular_posts")
    
    def set_popular_posts(self, posts_data: List[Dict]) -> bool:
        """
        Cache popular posts
        """
        return self.cache.set("popular_posts", posts_data, self.post_ttl)
    
    def get_trending_hashtags(self) -> Optional[List[Dict]]:
        """
        Get cached trending hashtags
        """
        return self.cache.get("trending_hashtags")
    
    def set_trending_hashtags(self, hashtags_data: List[Dict]) -> bool:
        """
        Cache trending hashtags
        """
        return self.cache.set("trending_hashtags", hashtags_data, 600)  # 10 minutes
    
    def invalidate_post_cache(self, post_id: int) -> bool:
        """
        Invalidate post-related cache
        """
        patterns = [
            f"post_{post_id}",
            "popular_posts",
            "trending_hashtags"
        ]
        
        for pattern in patterns:
            self.cache.delete(pattern)
        
        return True

class MiningCache:
    """
    Mining-specific caching utilities
    """
    
    def __init__(self):
        self.cache = AdvancedCache()
        self.mining_ttl = 60  # 1 minute
    
    def get_mining_leaderboard(self) -> Optional[List[Dict]]:
        """
        Get cached mining leaderboard
        """
        return self.cache.get("mining_leaderboard")
    
    def set_mining_leaderboard(self, leaderboard_data: List[Dict]) -> bool:
        """
        Cache mining leaderboard
        """
        return self.cache.set("mining_leaderboard", leaderboard_data, self.mining_ttl)
    
    def get_user_mining_stats(self, user_id: int) -> Optional[Dict]:
        """
        Get cached user mining statistics
        """
        return self.cache.get(f"user_mining_stats_{user_id}")
    
    def set_user_mining_stats(self, user_id: int, stats_data: Dict) -> bool:
        """
        Cache user mining statistics
        """
        return self.cache.set(f"user_mining_stats_{user_id}", stats_data, self.mining_ttl)
    
    def get_active_mining_sessions(self) -> Optional[List[Dict]]:
        """
        Get cached active mining sessions
        """
        return self.cache.get("active_mining_sessions")
    
    def set_active_mining_sessions(self, sessions_data: List[Dict]) -> bool:
        """
        Cache active mining sessions
        """
        return self.cache.set("active_mining_sessions", sessions_data, self.mining_ttl)

class NotificationCache:
    """
    Notification-specific caching utilities
    """
    
    def __init__(self):
        self.cache = AdvancedCache()
        self.notification_ttl = 300  # 5 minutes
    
    def get_user_notifications(self, user_id: int) -> Optional[List[Dict]]:
        """
        Get cached user notifications
        """
        return self.cache.get(f"user_notifications_{user_id}")
    
    def set_user_notifications(self, user_id: int, notifications_data: List[Dict]) -> bool:
        """
        Cache user notifications
        """
        return self.cache.set(f"user_notifications_{user_id}", notifications_data, self.notification_ttl)
    
    def get_unread_count(self, user_id: int) -> Optional[int]:
        """
        Get cached unread notification count
        """
        return self.cache.get(f"unread_count_{user_id}")
    
    def set_unread_count(self, user_id: int, count: int) -> bool:
        """
        Cache unread notification count
        """
        return self.cache.set(f"unread_count_{user_id}", count, self.notification_ttl)

class SearchCache:
    """
    Search-specific caching utilities
    """
    
    def __init__(self):
        self.cache = AdvancedCache()
        self.search_ttl = 600  # 10 minutes
    
    def get_search_results(self, query: str, filters: Dict = None) -> Optional[List[Dict]]:
        """
        Get cached search results
        """
        cache_key = self._generate_search_key(query, filters)
        return self.cache.get(cache_key)
    
    def set_search_results(self, query: str, results: List[Dict], filters: Dict = None) -> bool:
        """
        Cache search results
        """
        cache_key = self._generate_search_key(query, filters)
        return self.cache.set(cache_key, results, self.search_ttl)
    
    def _generate_search_key(self, query: str, filters: Dict = None) -> str:
        """
        Generate cache key for search results
        """
        key_parts = [query]
        if filters:
            key_parts.append(hashlib.md5(json.dumps(filters, sort_keys=True).encode()).hexdigest()[:8])
        
        return f"search_{'_'.join(key_parts)}"

class CacheManager:
    """
    Central cache management system
    """
    
    def __init__(self):
        self.user_cache = UserCache()
        self.post_cache = PostCache()
        self.mining_cache = MiningCache()
        self.notification_cache = NotificationCache()
        self.search_cache = SearchCache()
        self.advanced_cache = AdvancedCache()
    
    def get_cache_stats(self) -> Dict:
        """
        Get comprehensive cache statistics
        """
        stats = self.advanced_cache.cache_stats.copy()
        stats['hit_rate'] = self._calculate_hit_rate(stats)
        stats['total_operations'] = stats['hits'] + stats['misses'] + stats['sets'] + stats['deletes']
        
        return stats
    
    def _calculate_hit_rate(self, stats: Dict) -> float:
        """
        Calculate cache hit rate
        """
        total_requests = stats['hits'] + stats['misses']
        if total_requests > 0:
            return (stats['hits'] / total_requests) * 100
        return 0.0
    
    def clear_all_cache(self) -> bool:
        """
        Clear all cache data
        """
        try:
            cache.clear()
            logger.info("All cache cleared successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to clear cache: {e}")
            return False
    
    def warm_cache(self) -> Dict:
        """
        Warm up cache with frequently accessed data
        """
        warmed_items = {
            'user_profiles': 0,
            'user_feeds': 0,
            'popular_posts': 0,
            'mining_leaderboard': 0,
            'trending_hashtags': 0
        }
        
        try:
            # Warm up popular posts
            from bsn_social_network.models import Post
            popular_posts = Post.objects.annotate(
                likes_count=Count('likes'),
                comments_count=Count('comments')
            ).order_by('-likes_count', '-comments_count')[:20]
            
            if popular_posts.exists():
                self.post_cache.set_popular_posts(list(popular_posts.values()))
                warmed_items['popular_posts'] = popular_posts.count()
            
            # Warm up trending hashtags
            trending_hashtags = Post.objects.filter(
                content__icontains='#'
            ).values('content').annotate(
                count=Count('id')
            ).order_by('-count')[:10]
            
            if trending_hashtags.exists():
                self.post_cache.set_trending_hashtags(list(trending_hashtags))
                warmed_items['trending_hashtags'] = trending_hashtags.count()
            
            logger.info(f"Cache warmed up: {warmed_items}")
            return warmed_items
            
        except Exception as e:
            logger.error(f"Failed to warm cache: {e}")
            return warmed_items
    
    def get_cache_performance_report(self) -> Dict:
        """
        Generate comprehensive cache performance report
        """
        stats = self.get_cache_stats()
        
        report = {
            'timestamp': timezone.now().isoformat(),
            'cache_stats': stats,
            'performance_metrics': {
                'hit_rate_percentage': stats['hit_rate'],
                'total_operations': stats['total_operations'],
                'cache_efficiency': self._calculate_cache_efficiency(stats)
            },
            'recommendations': self._generate_cache_recommendations(stats)
        }
        
        return report
    
    def _calculate_cache_efficiency(self, stats: Dict) -> float:
        """
        Calculate cache efficiency score
        """
        if stats['total_operations'] == 0:
            return 0.0
        
        hit_rate = stats['hit_rate'] / 100
        operation_efficiency = min(stats['sets'] / max(stats['total_operations'], 1), 1.0)
        
        return (hit_rate * 0.7 + operation_efficiency * 0.3) * 100
    
    def _generate_cache_recommendations(self, stats: Dict) -> List[str]:
        """
        Generate cache optimization recommendations
        """
        recommendations = []
        
        if stats['hit_rate'] < 80:
            recommendations.append("Increase cache hit rate by caching more frequently accessed data")
        
        if stats['misses'] > stats['hits']:
            recommendations.append("Consider implementing cache warming strategies")
        
        if stats['sets'] > stats['hits']:
            recommendations.append("Optimize cache invalidation to reduce unnecessary cache sets")
        
        if stats['total_operations'] > 10000:
            recommendations.append("Consider implementing cache partitioning for better performance")
        
        return recommendations

# Initialize cache manager
cache_manager = CacheManager() 