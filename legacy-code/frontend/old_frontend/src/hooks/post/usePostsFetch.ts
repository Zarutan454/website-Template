
import { useState, useCallback } from 'react';
import { postRepository } from '@/repositories/PostRepository';
import { Post } from '@/types/posts';
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
  const fetchPosts = useCallback(async (feedType: string = 'recent', userId?: string) => {
    if (!userId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Die gültige feedType ist jetzt 'recent', 'popular', 'following', 'tokens' oder 'nfts'
      const fetchedPosts = await postRepository.getFeedPosts(
        feedType as any, 
        userId
      );
      
      console.log(`[usePostsFetch] Fetched ${fetchedPosts.length} posts for feed type '${feedType}'`);
      
      // Sicherstellen, dass die Posts dem Post-Interface entsprechen
      const typedPosts: Post[] = fetchedPosts.map((post: any) => ({
        id: post.id,
        content: post.content,
        author_id: post.author_id,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at,
        media_url: post.media_url,
        media_type: post.media_type,
        user: post.user ? {
          id: post.user.id,
          username: post.user.username,
          display_name: post.user.display_name,
          avatar_url: post.user.avatar_url
        } : undefined,
        is_liked_by_user: post.is_liked_by_user
      }));
      
      setPosts(typedPosts);
      
      // Angepasste Posts für die UI
      setAdaptedPosts(typedPosts.map((post: Post) => ({
        id: post.id,
        content: post.content,
        likesCount: post.likes_count || 0,
        commentsCount: post.comments_count || 0,
        sharesCount: post.shares_count || 0,
        createdAt: post.created_at,
        user: post.user,
        isLiked: post.is_liked_by_user
      })));
      
    } catch (err: any) {
      console.error('[usePostsFetch] Error fetching posts:', err);
      setError(err);
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
