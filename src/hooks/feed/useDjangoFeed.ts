import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext.utils';
import { socialAPI, type Post, type PaginatedResponse } from '../../lib/django-api-new';
import { toast } from 'sonner';
import { commentRepository } from '../../repositories/CommentRepository';

export type FeedType = 'recent' | 'popular' | 'following' | 'tokens' | 'nfts';

export interface UseDjangoFeedProps {
  feedType?: FeedType;
  pageSize?: number;
}

/**
 * Moderner, robuster und korrekter Feed-Hook für Django.
 * Diese Implementierung ist von Grund auf neu und behebt die Fehler der Vorgängerversion.
 */
export const useDjangoFeed = ({ feedType = 'recent', pageSize = 10 }: UseDjangoFeedProps) => {
  const { user, isAuthenticated } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(async (page: number, append: boolean = false) => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await socialAPI.getPosts(page, pageSize);

      if (response && Array.isArray(response)) {
        // Direkte Array-Antwort
        const typedResponse = response as Post[];
        setPosts(prev => append ? [...prev, ...typedResponse] : typedResponse);
        setHasMore(typedResponse.length === pageSize);
        setCurrentPage(page);
      } else if (response && typeof response === 'object' && 'results' in response) {
        // Paginierte Antwort
        const paginatedResponse = response as PaginatedResponse<Post>;
        const newPosts = paginatedResponse.results || [];
        setPosts(prev => append ? [...prev, ...newPosts] : newPosts);
        setHasMore(!!paginatedResponse.next);
        setCurrentPage(page);
      } else {
        throw new Error('Ungültige Antwort vom Server.');
      }

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, pageSize]);

  // Initialer Ladevorgang
  useEffect(() => {
    fetchPosts(1, false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, pageSize, feedType]);

  const refresh = useCallback(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      fetchPosts(currentPage + 1, true);
    }
  }, [hasMore, isLoading, currentPage, fetchPosts]);

  const createComment = useCallback(async (postId: string, content: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Bitte melde dich an, um zu kommentieren.');
      return null;
    }
    try {
      const response = await socialAPI.createComment(parseInt(postId), { content });
      
      if (response) {
        toast.success('Kommentar hinzugefügt!');
        // Update den Post-State lokal, um den Kommentar-Zähler zu erhöhen.
        setPosts(prevPosts => prevPosts.map(p => 
            p.id === parseInt(postId)
                ? { ...p, comments_count: (p.comments_count || 0) + 1 } 
                : p
        ));
        return response;
      }
      throw new Error('Kommentar konnte nicht erstellt werden.');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Fehler beim Hinzufügen des Kommentars.';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, [isAuthenticated, user]);


  return {
    posts,
    isLoading,
    error,
    hasMore,
    fetchPosts: refresh,
    loadMore,
    commentPost: createComment,
  };
}; 
