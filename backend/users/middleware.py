import time
import logging
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache

logger = logging.getLogger(__name__)

class APIPerformanceMiddleware(MiddlewareMixin):
    """
    Middleware für Performance-Monitoring von API-Calls
    """
    
    def process_request(self, request):
        request.start_time = time.time()
        
        # Log API request
        if request.path.startswith('/api/'):
            logger.info(f"API Request: {request.method} {request.path} - User: {request.user.username if request.user.is_authenticated else 'Anonymous'}")
    
    def process_response(self, request, response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log API response time
            if request.path.startswith('/api/'):
                logger.info(f"API Response: {request.method} {request.path} - {duration:.3f}s - Status: {response.status_code}")
                
                # Alert bei langsamen API-Calls
                if duration > 1.0:  # Über 1 Sekunde
                    logger.warning(f"Slow API Call: {request.method} {request.path} - {duration:.3f}s")
                
                # Cache performance metrics
                cache_key = f'api_performance_{request.path}'
                cached_metrics = cache.get(cache_key, {'count': 0, 'total_time': 0, 'avg_time': 0})
                
                cached_metrics['count'] += 1
                cached_metrics['total_time'] += duration
                cached_metrics['avg_time'] = cached_metrics['total_time'] / cached_metrics['count']
                
                cache.set(cache_key, cached_metrics, timeout=3600)  # 1 Stunde
        
        return response
    
    def process_exception(self, request, exception):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            
            # Log API errors
            if request.path.startswith('/api/'):
                logger.error(f"API Error: {request.method} {request.path} - {duration:.3f}s - Exception: {str(exception)}")
        
        return None


class UserActivityMiddleware(MiddlewareMixin):
    """
    Middleware für User-Aktivitäts-Tracking
    """
    
    def process_request(self, request):
        if request.user.is_authenticated and request.path.startswith('/api/'):
            # Track Profile-Page-Besuche
            if 'profile' in request.path:
                logger.info(f"Profile visit: {request.user.username} -> {request.path}")
            
            # Track API usage patterns
            cache_key = f'user_api_usage_{request.user.id}'
            usage_data = cache.get(cache_key, {'endpoints': {}, 'total_calls': 0})
            
            endpoint = request.path
            usage_data['endpoints'][endpoint] = usage_data['endpoints'].get(endpoint, 0) + 1
            usage_data['total_calls'] += 1
            
            cache.set(cache_key, usage_data, timeout=86400)  # 24 Stunden 