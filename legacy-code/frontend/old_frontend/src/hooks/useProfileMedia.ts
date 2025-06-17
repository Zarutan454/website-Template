
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Media } from '@/types/media';

export type MediaType = 'posts' | 'media' | 'saved' | 'liked' | 'collections';

export const useProfileMedia = (
  userId?: string,
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
      
      // Die tatsächliche Implementierung würde hier die entsprechenden Daten aus Supabase laden
      // Dies ist nur eine Beispielimplementierung
      if (type === 'media') {
        // Lade Medien/Fotos des Benutzers
        const { data: albumPhotos, error } = await supabase
          .from('album_photos')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        fetchedMedia = (albumPhotos || []).map(photo => ({
          id: photo.id,
          url: photo.photo_url,
          title: photo.title || '',
          description: photo.description || '',
          createdAt: photo.created_at,
          type: 'image',
          authorId: photo.user_id
        }));
      } else if (type === 'posts') {
        // Lade Posts mit Medien
        const { data: posts, error } = await supabase
          .from('posts')
          .select('*')
          .eq('author_id', userId)
          .not('media_url', 'is', null)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        fetchedMedia = (posts || []).map(post => ({
          id: post.id,
          url: post.media_url,
          createdAt: post.created_at,
          type: post.media_type as 'image' | 'video' || 'image',
          authorId: post.author_id
        }));
      } else if (type === 'saved' && isOwnProfile) {
        // Implementierung für gespeicherte Medien
        // (nur verfügbar für das eigene Profil)
        const { data: bookmarks, error } = await supabase
          .from('bookmarks')
          .select('*, posts(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        fetchedMedia = (bookmarks || [])
          .filter(bookmark => bookmark.posts && bookmark.posts.media_url)
          .map(bookmark => ({
            id: bookmark.post_id,
            url: bookmark.posts.media_url,
            createdAt: bookmark.created_at,
            type: bookmark.posts.media_type as 'image' | 'video' || 'image',
            post_id: bookmark.post_id
          }));
      } else if (type === 'liked' && isOwnProfile) {
        // Implementierung für gelikte Medien
        // (nur verfügbar für das eigene Profil)
        const { data: likes, error } = await supabase
          .from('likes')
          .select('*, posts(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        fetchedMedia = (likes || [])
          .filter(like => like.posts && like.posts.media_url)
          .map(like => ({
            id: like.post_id,
            url: like.posts.media_url,
            createdAt: like.created_at,
            type: like.posts.media_type as 'image' | 'video' || 'image',
            post_id: like.post_id
          }));
      } else if (type === 'collections') {
        // Lade Alben
        const { data: albums, error } = await supabase
          .from('photo_albums')
          .select('*')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        fetchedMedia = (albums || []).map(album => ({
          id: album.id,
          url: album.cover_url,
          title: album.title,
          description: album.description,
          createdAt: album.created_at,
          type: 'image',
          album_id: album.id,
          photo_count: album.photo_count
        }));
      }
      
      setMedia(fetchedMedia);
    } catch (err: Error | unknown) {
      setError(err);
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

  return {
    media,
    isLoading,
    error,
    refreshMedia: fetchMedia
  };
};
