from django.utils import timezone
from django.db import transaction, models
from django.core.cache import cache
from django.conf import settings
from ..models import Story, StoryView
import logging
import os

logger = logging.getLogger(__name__)

class StoryService:
    """
    Story-Service für das BSN-Netzwerk
    
    Dieser Service gewährleistet:
    - Automatisches Cleanup abgelaufener Stories
    - Optimierte Performance durch Batch-Processing
    - Vollständige Fehlerbehandlung
    - Media-File-Cleanup
    """
    
    @classmethod
    def cleanup_expired_stories(cls, dry_run: bool = False) -> dict:
        """
        Cleanup abgelaufener Stories und deren Media-Dateien
        
        Args:
            dry_run: Wenn True, werden keine Stories gelöscht, nur gezählt
            
        Returns:
            dict: Statistiken über das Cleanup
        """
        try:
            now = timezone.now()
            
            # Finde alle abgelaufenen Stories
            expired_stories = Story.objects.filter(
                expires_at__lt=now
            ).select_related('author')
            
            stats = {
                'total_expired': expired_stories.count(),
                'deleted_stories': 0,
                'deleted_media_files': 0,
                'errors': 0,
                'dry_run': dry_run
            }
            
            if dry_run:
                logger.info(f"DRY RUN: Found {stats['total_expired']} expired stories")
                return stats
            
            # Batch-Processing für bessere Performance
            batch_size = 100
            for i in range(0, stats['total_expired'], batch_size):
                batch = expired_stories[i:i + batch_size]
                
                with transaction.atomic():
                    for story in batch:
                        try:
                            # Lösche Media-Datei falls vorhanden
                            if story.media_url and not story.media_url.startswith('http'):
                                media_path = cls._get_media_path(story.media_url)
                                if cls._delete_media_file(media_path):
                                    stats['deleted_media_files'] += 1
                            
                            # Lösche Story-Views
                            StoryView.objects.filter(story=story).delete()
                            
                            # Lösche Story
                            story.delete()
                            stats['deleted_stories'] += 1
                            
                        except Exception as e:
                            logger.error(f"Error deleting story {story.id}: {e}")
                            stats['errors'] += 1
            
            # Cache invalidieren
            cache.delete_pattern("stories_*")
            
            logger.info(f"Story cleanup completed: {stats['deleted_stories']} stories deleted, "
                       f"{stats['deleted_media_files']} media files deleted, {stats['errors']} errors")
            
            return stats
            
        except Exception as e:
            logger.error(f"CRITICAL: Story cleanup failed: {e}")
            return {
                'total_expired': 0,
                'deleted_stories': 0,
                'deleted_media_files': 0,
                'errors': 1,
                'error_message': str(e),
                'dry_run': dry_run
            }
    
    @classmethod
    def _get_media_path(cls, media_url: str) -> str:
        """
        Konvertiert Media-URL zu Dateisystem-Pfad
        """
        try:
            # Entferne /media/ Prefix
            if media_url.startswith('/media/'):
                relative_path = media_url[7:]  # Entferne '/media/'
            else:
                relative_path = media_url
            
            # Vollständiger Pfad
            return os.path.join(settings.MEDIA_ROOT, relative_path)
            
        except Exception as e:
            logger.error(f"Error getting media path for {media_url}: {e}")
            return ""
    
    @classmethod
    def _delete_media_file(cls, file_path: str) -> bool:
        """
        Löscht Media-Datei sicher
        
        Args:
            file_path: Vollständiger Pfad zur Datei
            
        Returns:
            bool: True wenn Datei gelöscht wurde oder nicht existiert
        """
        try:
            if not file_path or not os.path.exists(file_path):
                return True
            
            # Sicherheitscheck: Nur Dateien im media-Verzeichnis löschen
            if not file_path.startswith(settings.MEDIA_ROOT):
                logger.warning(f"Attempted to delete file outside media directory: {file_path}")
                return False
            
            os.remove(file_path)
            logger.debug(f"Deleted media file: {file_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting media file {file_path}: {e}")
            return False
    
    @classmethod
    def get_story_stats(cls) -> dict:
        """
        Gibt Statistiken über Stories zurück
        """
        try:
            now = timezone.now()
            
            total_stories = Story.objects.count()
            active_stories = Story.objects.filter(expires_at__gt=now).count()
            expired_stories = Story.objects.filter(expires_at__lt=now).count()
            
            # Stories nach Typ gruppieren
            story_types = Story.objects.values('story_type').annotate(
                count=models.Count('id')
            )
            
            return {
                'total_stories': total_stories,
                'active_stories': active_stories,
                'expired_stories': expired_stories,
                'story_types': list(story_types),
                'last_cleanup': cache.get('last_story_cleanup')
            }
            
        except Exception as e:
            logger.error(f"Error getting story stats: {e}")
            return {
                'error': str(e)
            }
    
    @classmethod
    def mark_cleanup_completed(cls):
        """
        Markiert Cleanup als abgeschlossen
        """
        cache.set('last_story_cleanup', timezone.now(), timeout=86400)  # 24h 