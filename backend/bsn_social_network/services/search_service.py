import logging
from django.db.models import Q, Count, F, Case, When, Value, IntegerField
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.cache import cache
from django.db.models.functions import Coalesce
from datetime import timedelta
import json
import hashlib
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass

logger = logging.getLogger(__name__)
User = get_user_model()

@dataclass
class SearchFilters:
    """Search filters configuration"""
    content_type: Optional[str] = None  # 'user', 'post', 'comment'
    category: Optional[str] = None  # 'crypto_streamer', 'influencer', etc.
    location: Optional[str] = None
    min_followers: Optional[int] = None
    max_followers: Optional[int] = None
    is_verified: Optional[bool] = None
    is_alpha_user: Optional[bool] = None
    created_after: Optional[str] = None
    created_before: Optional[str] = None
    sort_by: str = 'relevance'  # 'relevance', 'followers', 'posts', 'recent'
    sort_order: str = 'desc'  # 'asc', 'desc'

class SearchService:
    """
    Advanced search service for user discovery and content search
    """
    
    CACHE_TTL = 600  # 10 minutes
    SEARCH_CACHE_PREFIX = "search_results_"
    TRENDING_CACHE_PREFIX = "trending_search_"
    
    @staticmethod
    def search_users(query: str, filters: SearchFilters = None, page: int = 1, limit: int = 20) -> Dict:
        """
        Advanced user search with filters and pagination
        """
        try:
            # Generate cache key
            cache_key = SearchService._generate_cache_key(query, filters, page, limit)
            
            # Try to get from cache
            cached_results = cache.get(cache_key)
            if cached_results:
                logger.info(f"Search results served from cache for query: {query}")
                return cached_results
            
            # Build search query
            queryset = User.objects.filter(is_active=True)
            
            # Apply search query
            if query:
                queryset = queryset.filter(
                    Q(username__icontains=query) |
                    Q(first_name__icontains=query) |
                    Q(last_name__icontains=query) |
                    Q(email__icontains=query) |
                    Q(influencer_category__icontains=query)
                )
            
            # Apply filters
            if filters:
                queryset = SearchService._apply_filters(queryset, filters)
            
            # Annotate with relevance score
            queryset = SearchService._annotate_relevance(queryset, query)
            
            # Apply sorting
            queryset = SearchService._apply_sorting(queryset, filters.sort_by if filters else 'relevance')
            
            # Pagination
            total_count = queryset.count()
            start = (page - 1) * limit
            end = start + limit
            users_page = queryset[start:end]
            
            # Serialize results
            results = []
            for user in users_page:
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'avatar_url': user.avatar_url,
                    'cover_url': user.cover_url,
                    'influencer_category': user.influencer_category,
                    'follower_count': user.follower_count,
                    'is_alpha_user': user.is_alpha_user,
                    'created_at': user.created_at.isoformat(),
                    'relevance_score': getattr(user, 'relevance_score', 0)
                }
                results.append(user_data)
            
            # Pagination info
            has_next = end < total_count
            has_previous = page > 1
            
            search_results = {
                'results': results,
                'count': total_count,
                'page': page,
                'limit': limit,
                'has_next': has_next,
                'has_previous': has_previous,
                'next_page': page + 1 if has_next else None,
                'previous_page': page - 1 if has_previous else None
            }
            
            # Cache results
            cache.set(cache_key, search_results, SearchService.CACHE_TTL)
            
            # Track search analytics
            SearchService._track_search_analytics(query, total_count)
            
            return search_results
            
        except Exception as e:
            logger.error(f"Error in search_users: {e}")
            return {
                'results': [],
                'count': 0,
                'error': str(e)
            }
    
    @staticmethod
    def get_user_recommendations(user_id: int, limit: int = 10) -> List[Dict]:
        """
        Get personalized user recommendations based on following patterns
        """
        try:
            cache_key = f"user_recommendations_{user_id}_{limit}"
            cached_recommendations = cache.get(cache_key)
            
            if cached_recommendations:
                return cached_recommendations
            
            user = User.objects.get(id=user_id)
            
            # Get users that the current user follows
            following = user.following.all()
            
            # Get users that are followed by people the current user follows
            recommended_users = User.objects.filter(
                followers__in=following
            ).exclude(
                id=user.id
            ).exclude(
                followers=user
            ).annotate(
                mutual_followers=Count('followers', filter=Q(followers__in=following))
            ).order_by('-mutual_followers', '-follower_count')[:limit]
            
            recommendations = []
            for recommended_user in recommended_users:
                user_data = {
                    'id': recommended_user.id,
                    'username': recommended_user.username,
                    'first_name': recommended_user.first_name,
                    'last_name': recommended_user.last_name,
                    'avatar_url': recommended_user.avatar_url,
                    'influencer_category': recommended_user.influencer_category,
                    'follower_count': recommended_user.follower_count,
                    'mutual_followers': recommended_user.mutual_followers,
                    'is_alpha_user': recommended_user.is_alpha_user
                }
                recommendations.append(user_data)
            
            # Cache recommendations
            cache.set(cache_key, recommendations, 1800)  # 30 minutes
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error in get_user_recommendations: {e}")
            return []
    
    @staticmethod
    def get_trending_users(limit: int = 10) -> List[Dict]:
        """
        Get trending users based on recent activity and follower growth
        """
        try:
            cache_key = f"trending_users_{limit}"
            cached_trending = cache.get(cache_key)
            
            if cached_trending:
                return cached_trending
            
            # Get users with high activity in the last 7 days
            week_ago = timezone.now() - timedelta(days=7)
            
            trending_users = User.objects.filter(
                is_active=True,
                posts__created_at__gte=week_ago
            ).annotate(
                recent_posts=Count('posts', filter=Q(posts__created_at__gte=week_ago)),
                recent_likes=Count('likes', filter=Q(likes__created_at__gte=week_ago))
            ).order_by('-recent_posts', '-recent_likes', '-follower_count')[:limit]
            
            trending_data = []
            for user in trending_users:
                user_data = {
                    'id': user.id,
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'avatar_url': user.avatar_url,
                    'influencer_category': user.influencer_category,
                    'follower_count': user.follower_count,
                    'recent_posts': user.recent_posts,
                    'recent_likes': user.recent_likes,
                    'trending_score': user.recent_posts + user.recent_likes
                }
                trending_data.append(user_data)
            
            # Cache trending users
            cache.set(cache_key, trending_data, 3600)  # 1 hour
            
            return trending_data
            
        except Exception as e:
            logger.error(f"Error in get_trending_users: {e}")
            return []
    
    @staticmethod
    def get_similar_users(user_id: int, limit: int = 10) -> List[Dict]:
        """
        Find users similar to the given user based on interests and behavior
        """
        try:
            cache_key = f"similar_users_{user_id}_{limit}"
            cached_similar = cache.get(cache_key)
            
            if cached_similar:
                return cached_similar
            
            user = User.objects.get(id=user_id)
            
            # Find users with similar interests (influencer category)
            similar_users = User.objects.filter(
                is_active=True,
                influencer_category=user.influencer_category
            ).exclude(
                id=user.id
            ).annotate(
                similarity_score=Case(
                    When(follower_count__range=(user.follower_count * 0.5, user.follower_count * 1.5), then=Value(3)),
                    When(follower_count__range=(user.follower_count * 0.3, user.follower_count * 2), then=Value(2)),
                    default=Value(1),
                    output_field=IntegerField()
                )
            ).order_by('-similarity_score', '-follower_count')[:limit]
            
            similar_data = []
            for similar_user in similar_users:
                user_data = {
                    'id': similar_user.id,
                    'username': similar_user.username,
                    'first_name': similar_user.first_name,
                    'last_name': similar_user.last_name,
                    'avatar_url': similar_user.avatar_url,
                    'influencer_category': similar_user.influencer_category,
                    'follower_count': similar_user.follower_count,
                    'similarity_score': similar_user.similarity_score
                }
                similar_data.append(user_data)
            
            # Cache similar users
            cache.set(cache_key, similar_data, 1800)  # 30 minutes
            
            return similar_data
            
        except Exception as e:
            logger.error(f"Error in get_similar_users: {e}")
            return []
    
    @staticmethod
    def get_search_suggestions(query: str, limit: int = 5) -> List[str]:
        """
        Get search suggestions based on partial query
        """
        try:
            if len(query) < 2:
                return []
            
            cache_key = f"search_suggestions_{query}_{limit}"
            cached_suggestions = cache.get(cache_key)
            
            if cached_suggestions:
                return cached_suggestions
            
            # Get usernames that match the query
            suggestions = User.objects.filter(
                username__icontains=query
            ).values_list('username', flat=True)[:limit]
            
            # Cache suggestions
            cache.set(cache_key, list(suggestions), 1800)  # 30 minutes
            
            return list(suggestions)
            
        except Exception as e:
            logger.error(f"Error in get_search_suggestions: {e}")
            return []
    
    @staticmethod
    def get_popular_searches(limit: int = 10) -> List[Dict]:
        """
        Get popular search terms
        """
        try:
            cache_key = f"popular_searches_{limit}"
            cached_popular = cache.get(cache_key)
            
            if cached_popular:
                return cached_popular
            
            # This would typically come from search analytics
            # For now, return some common search terms
            popular_searches = [
                {'term': 'crypto', 'count': 150},
                {'term': 'influencer', 'count': 120},
                {'term': 'blockchain', 'count': 100},
                {'term': 'developer', 'count': 80},
                {'term': 'trader', 'count': 75}
            ]
            
            # Cache popular searches
            cache.set(cache_key, popular_searches, 3600)  # 1 hour
            
            return popular_searches
            
        except Exception as e:
            logger.error(f"Error in get_popular_searches: {e}")
            return []
    
    @staticmethod
    def _apply_filters(queryset, filters: SearchFilters):
        """Apply search filters to queryset"""
        if filters.category:
            queryset = queryset.filter(influencer_category=filters.category)
        
        if filters.min_followers:
            queryset = queryset.filter(follower_count__gte=filters.min_followers)
        
        if filters.max_followers:
            queryset = queryset.filter(follower_count__lte=filters.max_followers)
        
        if filters.is_verified is not None:
            queryset = queryset.filter(is_staff=filters.is_verified)
        
        if filters.is_alpha_user is not None:
            queryset = queryset.filter(is_alpha_user=filters.is_alpha_user)
        
        if filters.created_after:
            queryset = queryset.filter(created_at__gte=filters.created_after)
        
        if filters.created_before:
            queryset = queryset.filter(created_at__lte=filters.created_before)
        
        return queryset
    
    @staticmethod
    def _annotate_relevance(queryset, query: str):
        """Annotate queryset with relevance score"""
        if not query:
            return queryset
        
        return queryset.annotate(
            relevance_score=Case(
                When(username__icontains=query, then=Value(5)),
                When(first_name__icontains=query, then=Value(4)),
                When(last_name__icontains=query, then=Value(4)),
                When(influencer_category__icontains=query, then=Value(3)),
                default=Value(1),
                output_field=IntegerField()
            )
        )
    
    @staticmethod
    def _apply_sorting(queryset, sort_by: str):
        """Apply sorting to queryset"""
        if sort_by == 'relevance':
            return queryset.order_by('-relevance_score', '-follower_count')
        elif sort_by == 'followers':
            return queryset.order_by('-follower_count')
        elif sort_by == 'posts':
            return queryset.annotate(
                posts_count=Count('posts')
            ).order_by('-posts_count')
        elif sort_by == 'recent':
            return queryset.order_by('-created_at')
        else:
            return queryset.order_by('-relevance_score')
    
    @staticmethod
    def _generate_cache_key(query: str, filters: SearchFilters, page: int, limit: int) -> str:
        """Generate cache key for search results"""
        key_parts = [
            SearchService.SEARCH_CACHE_PREFIX,
            hashlib.md5(query.encode()).hexdigest()[:8],
            str(page),
            str(limit)
        ]
        
        if filters:
            filter_hash = hashlib.md5(json.dumps(filters.__dict__, sort_keys=True).encode()).hexdigest()[:8]
            key_parts.append(filter_hash)
        
        return '_'.join(key_parts)
    
    @staticmethod
    def _track_search_analytics(query: str, result_count: int):
        """Track search analytics for insights"""
        try:
            # Increment search count
            cache_key = f"search_count_{query}"
            current_count = cache.get(cache_key, 0)
            cache.set(cache_key, current_count + 1, 86400)  # 24 hours
            
            # Track search with results
            analytics_key = f"search_analytics_{query}"
            analytics = cache.get(analytics_key, {'count': 0, 'total_results': 0})
            analytics['count'] += 1
            analytics['total_results'] += result_count
            cache.set(analytics_key, analytics, 86400)  # 24 hours
            
        except Exception as e:
            logger.error(f"Error tracking search analytics: {e}") 