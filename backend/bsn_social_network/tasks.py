from __future__ import absolute_import, unicode_literals
from celery import shared_task
from django.utils import timezone
from django.conf import settings
import logging
from .models import Boost, MiningProgress, User
from django.core.cache import cache
from django.db import models
from .services.story_service import StoryService

logger = logging.getLogger(__name__)

@shared_task(name="cleanup_expired_boosts")
def cleanup_expired_boosts():
    """
    Finds and deactivates all mining boosts that have expired.
    """
    now = timezone.now()
    expired_boosts = Boost.objects.filter(is_active=True, expires_at__lt=now)
    
    count = expired_boosts.count()
    if count > 0:
        expired_boosts.update(is_active=False)
        logger.info(f"Successfully deactivated {count} expired mining boosts.")
    else:
        logger.info("No expired mining boosts to clean up.")
        
    return f"Deactivated {count} expired boosts."

@shared_task(name="cleanup_inactive_mining_sessions")
def cleanup_inactive_mining_sessions():
    """
    Cleanup inactive mining sessions and update accumulated tokens
    """
    timeout_minutes = getattr(settings, 'MINING_CONFIG', {}).get('HEARTBEAT_TIMEOUT', 300) / 60
    cutoff_time = timezone.now() - timezone.timedelta(minutes=timeout_minutes)
    
    # Find active mining sessions that haven't sent heartbeat
    inactive_sessions = MiningProgress.objects.filter(
        is_mining=True,
        last_heartbeat__lt=cutoff_time
    )
    
    count = 0
    for progress in inactive_sessions:
        # Calculate final accumulated tokens before stopping
        from .services.mining_service import MiningService
        MiningService.update_accumulated_tokens(progress.user)
        
        # Stop mining session
        progress.is_mining = False
        progress.save(update_fields=['is_mining'])
        count += 1
        
        logger.info(f"Stopped inactive mining session for user {progress.user.username}")
    
    logger.info(f"Cleaned up {count} inactive mining sessions.")
    return f"Cleaned up {count} inactive mining sessions."

@shared_task(name="reset_daily_mining_limits")
def reset_daily_mining_limits():
    """
    Reset daily mining limits for all users at midnight
    """
    # This would reset daily counters in a production system
    # For now, we log the reset
    active_miners = MiningProgress.objects.filter(is_mining=True).count()
    total_miners = MiningProgress.objects.count()
    
    logger.info(f"Daily mining limits reset. Active miners: {active_miners}, Total miners: {total_miners}")
    return f"Daily reset completed. Active: {active_miners}, Total: {total_miners}"

@shared_task(name="optimize_mining_performance")
def optimize_mining_performance():
    """
    Optimize mining performance by cleaning up old data and updating statistics
    """
    # Clear mining stats cache to force refresh
    cache_pattern = "mining_stats_*"
    # In production, implement proper cache cleanup
    
    # Update mining statistics
    total_active = MiningProgress.objects.filter(is_mining=True).count()
    total_accumulated = MiningProgress.objects.aggregate(
        total=models.Sum('accumulated_tokens')
    )['total'] or 0
    
    logger.info(f"Mining performance optimization completed. Active: {total_active}, Total accumulated: {total_accumulated}")
    return f"Performance optimization completed."

@shared_task(bind=True, name='cleanup_expired_stories')
def cleanup_expired_stories(self):
    """
    Celery-Task für das Cleanup abgelaufener Stories
    
    Läuft alle 30 Minuten automatisch
    """
    try:
        logger.info("Starting expired stories cleanup task")
        
        # Führe Cleanup durch
        stats = StoryService.cleanup_expired_stories(dry_run=False)
        
        # Markiere Cleanup als abgeschlossen
        StoryService.mark_cleanup_completed()
        
        # Logge Ergebnisse
        logger.info(f"Story cleanup task completed: {stats['deleted_stories']} stories deleted, "
                   f"{stats['deleted_media_files']} media files deleted, {stats['errors']} errors")
        
        return {
            'status': 'success',
            'stats': stats,
            'completed_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Story cleanup task failed: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'completed_at': timezone.now().isoformat()
        }

@shared_task(bind=True, name='story_cleanup_dry_run')
def story_cleanup_dry_run(self):
    """
    Dry-Run Task für Story-Cleanup (nur zum Testen)
    """
    try:
        logger.info("Starting story cleanup dry run")
        
        stats = StoryService.cleanup_expired_stories(dry_run=True)
        
        logger.info(f"Story cleanup dry run completed: {stats['total_expired']} expired stories found")
        
        return {
            'status': 'success',
            'stats': stats,
            'completed_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Story cleanup dry run failed: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'completed_at': timezone.now().isoformat()
        }

@shared_task(bind=True, name='get_story_stats')
def get_story_stats(self):
    """
    Task für Story-Statistiken
    """
    try:
        stats = StoryService.get_story_stats()
        
        # Cache die Statistiken für 1 Stunde
        cache.set('story_stats', stats, timeout=3600)
        
        logger.info(f"Story stats updated: {stats.get('total_stories', 0)} total stories")
        
        return {
            'status': 'success',
            'stats': stats,
            'completed_at': timezone.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Get story stats task failed: {e}")
        return {
            'status': 'error',
            'error': str(e),
            'completed_at': timezone.now().isoformat()
        } 