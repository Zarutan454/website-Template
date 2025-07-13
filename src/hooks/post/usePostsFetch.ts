import { useState, useCallback } from 'react';
import { socialAPI } from '../../lib/django-api-new';
import { Post } from '../../types/posts';
import { toast } from 'sonner';

/**
 * Hook für das Laden von Posts
 */
export const usePostsFetch = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [adaptedPosts, setAdaptedPosts] = useState<{
    id: string;
    content: string;
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
    createdAt: string;
    user?: {
      id: string;
      username: string;
      display_name: string;
      avatar_url: string;
    };
    isLiked: boolean;
  }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Lädt Posts für verschiedene Feed-Typen
   */
  const fetchPosts = useCallback(async (feedType: string = 'recent', userId?: string, username?: string) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Verwende die neue socialAPI
      let fetchedPosts: any[] = [];
      
      if (username) {
        // KORREKTUR: Nur author-Parameter verwenden, da nur dieser im Backend unterstützt wird
        const paramVariants = [
          { author: username }
        ];
        let found = false;
        for (const params of paramVariants) {
          // DEBUG: Logge die exakte URL und Parameter für den Profil-Feed
          const debugUrl = `/posts/?${new URLSearchParams(params).toString()}`;
          console.log('[ProfileFeed][DEBUG] Requesting:', debugUrl, 'params:', params);
          console.log('[ProfileFeed] Teste API-Parameter:', params);
          try {
            const response: unknown = await socialAPI.getFeed(params);
            console.log('[ProfileFeed] API-Response für', params, ':', response);
            if (
              response &&
              typeof response === 'object' &&
              'results' in response &&
              Array.isArray((response as { results: unknown[] }).results) &&
              (response as { results: unknown[] }).results.length > 0
            ) {
              fetchedPosts = (response as { results: Post[] }).results;
              found = true;
              break;
            }
          } catch (err: unknown) {
            console.error('[ProfileFeed] API-Fehler für', params, ':', err);
          }
        }
        if (!found) {
          fetchedPosts = [];
          console.warn('[ProfileFeed] Keine Posts gefunden für author:', username);
        }
      } else {
        switch (feedType) {
          case 'recent':
            fetchedPosts = await socialAPI.getPosts(1, 20) as Post[];
            break;
          case 'popular':
            fetchedPosts = await socialAPI.getTrendingPosts() as Post[];
            break;
          case 'following':
            fetchedPosts = await socialAPI.getPosts(1, 20) as Post[];
            break;
          case 'tokens':
            fetchedPosts = await socialAPI.getPosts(1, 20) as Post[];
            break;
          case 'nfts':
            fetchedPosts = await socialAPI.getPosts(1, 20) as Post[];
            break;
          default:
            fetchedPosts = await socialAPI.getPosts(1, 20) as Post[];
        }
      }
      
      console.log(`[usePostsFetch] Fetched ${fetchedPosts.length} posts for feed type '${feedType}'`);
      
      // Sicherstellen, dass fetchedPosts ein Array ist (PaginatedResponse oder Array)
      let postsArray: Post[] = [];
      if (Array.isArray(fetchedPosts)) {
        postsArray = fetchedPosts;
      } else if (fetchedPosts && Array.isArray((fetchedPosts as any).results)) {
        postsArray = (fetchedPosts as any).results;
      } else {
        console.error('[usePostsFetch][DEBUG] fetchedPosts ist kein Array und hat keine results:', fetchedPosts);
      }
      // Sicherstellen, dass die Posts dem Post-Interface entsprechen
      const typedPosts: Post[] = postsArray.map((post: Post) => ({
        id: post.id,
        author: post.author,
        content: post.content,
        created_at: post.created_at,
        updated_at: post.updated_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        is_liked_by_user: post.is_liked_by_user || false,
        media_url: post.media_url,
        media_type: post.media_type,
      }));
      
      setPosts(typedPosts);
      
      // Konvertiere Posts zu adaptedPosts für das Feed
      const adapted = typedPosts.map(post => ({
        id: post.id,
        content: post.content,
        likesCount: post.likes_count,
        commentsCount: post.comments_count,
        sharesCount: post.shares_count,
        createdAt: post.created_at,
        user: post.author ? {
          id: post.author.id,
          username: post.author.username,
          display_name: post.author.display_name,
          avatar_url: post.author.avatar_url || ''
        } : undefined,
        isLiked: post.is_liked_by_user
      }));
      
      setAdaptedPosts(adapted);
      console.log(`[usePostsFetch] Set ${adapted.length} adapted posts for display`);
      
    } catch (err: unknown) {
      console.error('[usePostsFetch] Error fetching posts:', err);
      setError(err instanceof Error ? err : new Error('Unknown error fetching posts'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    posts,
    setPosts,
    adaptedPosts,
    setAdaptedPosts,
    isLoading,
    error,
    fetchPosts
  };
};
