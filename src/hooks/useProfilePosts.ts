import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/django-api-new';
import { toast } from 'sonner';
import { postUpdateEmitter } from './useProfileMedia';

interface PostData {
  id: string;
  content?: string;
  media_url?: string;
  media_type?: string;
  created_at: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
    display_name?: string;
  };
  like_count?: number;
  comment_count?: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export const useProfilePosts = (userId?: string | number) => {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPosts = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Lade ALLE Posts des Benutzers (mit und ohne Medien)
      const response = await apiClient.get(`/posts/?author=${userId}`);
      if (response && (response as any).results) {
        const fetchedPosts = (response as any).results.map((post: any) => ({
          id: post.id.toString(),
          content: post.content || '',
          media_url: post.media_url || post.media_urls?.[0] || '',
          media_type: post.media_type || 'text',
          created_at: post.created_at,
          author: {
            id: post.author?.id?.toString() || userId.toString(),
            username: post.author?.username || 'Unknown',
            avatar_url: post.author?.avatar_url || '',
            display_name: post.author?.display_name || post.author?.username || 'Unknown'
          },
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          is_liked: post.is_liked || false,
          is_bookmarked: post.is_bookmarked || false
        }));
        
        setPosts(fetchedPosts);
      }
    } catch (err: Error | unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error fetching posts');
      setError(error);
      console.error('Error fetching profile posts:', error);
      toast.error('Fehler beim Laden der Posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPosts();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  // Listen for post updates
  useEffect(() => {
    const handlePostUpdate = (updatedUserId: string) => {
      // Refresh posts if the update is for the current user
      if (userId && updatedUserId === userId.toString()) {
        fetchPosts();
      }
    };

    postUpdateEmitter.addListener(handlePostUpdate);
    return () => postUpdateEmitter.removeListener(handlePostUpdate);
  }, [userId]);

  return {
    posts,
    isLoading,
    error,
    refreshPosts: fetchPosts
  };
}; 