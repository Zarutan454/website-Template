import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { Media } from '@/types/media';

export type MediaType = 'posts' | 'media' | 'saved' | 'liked' | 'collections';

// Create a simple event emitter for post updates
class PostUpdateEmitter {
  private listeners: Array<(userId: string) => void> = [];
  
  addListener(listener: (userId: string) => void) {
    this.listeners.push(listener);
  }
  
  removeListener(listener: (userId: string) => void) {
    this.listeners = this.listeners.filter(l => l !== listener);
  }
  
  emit(userId: string) {
    this.listeners.forEach(listener => listener(userId));
  }
}

export const postUpdateEmitter = new PostUpdateEmitter();

export const useProfileMedia = (
  userId?: string | number,
  type: MediaType = 'media',
  isOwnProfile: boolean = false
) => {
  const [media, setMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMedia = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedMedia: Media[] = [];
      
      if (type === 'posts') {
        // Lade ALLE Posts des Benutzers (nicht nur mit Medien)
        const response = await apiClient.get(`/posts/?author=${userId}`);
        if (response && response.results) {
          fetchedMedia = response.results.map((post: any) => ({
            id: post.id.toString(),
            url: post.media_url || post.media_urls?.[0] || '',
            title: post.content?.substring(0, 50) || 'Post',
            description: post.content || '',
            createdAt: post.created_at,
            type: post.media_type || 'text',
            authorId: post.author?.id?.toString() || userId.toString(),
            media_urls: post.media_urls || [],
            like_count: post.like_count || 0,
            comment_count: post.comment_count || 0,
            is_liked: post.is_liked || false,
            is_bookmarked: post.is_bookmarked || false
          }));
        }
      } else if (type === 'saved' && isOwnProfile) {
        // Lade gespeicherte Posts mit Medien
        const response = await apiClient.get(`/posts/?bookmarked_by=${userId}&has_media=true`);
        if (response && response.results) {
          fetchedMedia = response.results
            .filter((post: any) => post.media_url || (post.media_urls && post.media_urls.length > 0))
            .map((post: any) => ({
              id: post.id.toString(),
              url: post.media_url || post.media_urls?.[0] || '',
              title: post.content?.substring(0, 50) || 'Gespeicherter Post',
              description: post.content || '',
              createdAt: post.created_at,
              type: post.media_type || 'image',
              authorId: post.author?.id?.toString() || userId.toString(),
              media_urls: post.media_urls || []
            }));
        }
      } else if (type === 'liked' && isOwnProfile) {
        // Lade gelikte Posts mit Medien
        const response = await apiClient.get(`/posts/?liked_by=${userId}&has_media=true`);
        if (response && response.results) {
          fetchedMedia = response.results
            .filter((post: any) => post.media_url || (post.media_urls && post.media_urls.length > 0))
            .map((post: any) => ({
              id: post.id.toString(),
              url: post.media_url || post.media_urls?.[0] || '',
              title: post.content?.substring(0, 50) || 'Gelikter Post',
              description: post.content || '',
              createdAt: post.created_at,
              type: post.media_type || 'image',
              authorId: post.author?.id?.toString() || userId.toString(),
              media_urls: post.media_urls || []
            }));
        }
      } else if (type === 'collections') {
        // Lade Alben/Collections (falls implementiert)
        // Für jetzt verwenden wir Posts als Collections
        const response = await apiClient.get(`/posts/?author=${userId}&has_media=true&limit=20`);
        if (response && response.results) {
          fetchedMedia = response.results
            .filter((post: any) => post.media_url || (post.media_urls && post.media_urls.length > 0))
            .map((post: any) => ({
              id: post.id.toString(),
              url: post.media_url || post.media_urls?.[0] || '',
              title: `Album ${post.id}`,
              description: post.content || '',
              createdAt: post.created_at,
              type: post.media_type || 'image',
              authorId: post.author?.id?.toString() || userId.toString(),
              media_urls: post.media_urls || []
            }));
        }
      } else if (type === 'media') {
        // Kombiniere alle Medien des Benutzers
        const response = await apiClient.get(`/posts/?author=${userId}&has_media=true`);
        if (response && response.results) {
          fetchedMedia = response.results
            .filter((post: any) => post.media_url || (post.media_urls && post.media_urls.length > 0))
            .map((post: any) => ({
              id: post.id.toString(),
              url: post.media_url || post.media_urls?.[0] || '',
              title: post.content?.substring(0, 50) || 'Medieninhalt',
              description: post.content || '',
              createdAt: post.created_at,
              type: post.media_type || 'image',
              authorId: post.author?.id?.toString() || userId.toString(),
              media_urls: post.media_urls || []
            }));
        }
      }
      
      setMedia(fetchedMedia);
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching media');
      setError(error);
      console.error('Error fetching profile media:', error);
      toast.error('Fehler beim Laden der Medien');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchMedia();
    } else {
      setIsLoading(false);
    }
  }, [userId, type]);

  // Listen for post updates
  useEffect(() => {
    const handlePostUpdate = (updatedUserId: string) => {
      // Refresh media if the update is for the current user
      if (userId && updatedUserId === userId.toString()) {
        fetchMedia();
      }
    };

    postUpdateEmitter.addListener(handlePostUpdate);
    return () => postUpdateEmitter.removeListener(handlePostUpdate);
  }, [userId, type]);

  return {
    media,
    isLoading,
    error,
    refreshMedia: fetchMedia
  };
};
