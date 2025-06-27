import { useCallback } from 'react';
import { socialAPI } from '../../lib/django-api-new';
import { toast } from 'sonner';
import { CreatePostData } from '../../types/posts';

/**
 * Hook für Post-Aktionen wie Liken, Löschen, Teilen (Django-API)
 */
export const usePostActions = (
  setPosts: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>,
  setAdaptedPosts: React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>,
  fetchPosts: (feedType?: string) => Promise<void>
) => {
  /**
   * Erstellt einen neuen Post
   */
  const createPost = useCallback(async (profileId: string, postData: CreatePostData) => {
    if (!profileId) {
      toast.error("Du musst angemeldet sein, um einen Beitrag zu erstellen");
      return { success: false, error: "Not authenticated" };
    }
    try {
      const result = await socialAPI.createPost(postData);
      if (!result) throw new Error('Failed to create post');
      await fetchPosts();
      return { success: true };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error creating post:', error);
      toast.error('Fehler beim Erstellen des Beitrags');
      return { success: false, error };
    }
  }, [fetchPosts]);

  /**
   * Likt oder Unlikt einen Post (Django-API)
   */
  const likePost = useCallback(async (postId: string) => {
    try {
      const result = await socialAPI.likePost(parseInt(postId));
      if (result) {
        setPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likes_count: ((p.likes_count as number) || 0) + 1, is_liked_by_user: true } : p
        ));
        setAdaptedPosts(prev => prev.map((p: Record<string, unknown>) =>
          p.id === postId ? { ...p, likesCount: ((p.likesCount as number) || 0) + 1, isLiked: true } : p
        ));
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[usePostActions] Error liking post:', error);
      toast.error('Fehler beim Liken des Posts');
      return false;
    }
  }, [setPosts, setAdaptedPosts]);

  /**
   * Löscht einen Post (Django-API)
   */
  const deletePost = useCallback(async (postId: string) => {
    try {
      const success = await socialAPI.deletePost(parseInt(postId));
      if (success) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setAdaptedPosts(prev => prev.filter((p: Record<string, unknown>) => p.id !== postId));
        toast.success('Beitrag wurde gelöscht');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error deleting post:', error);
      toast.error(error.message || 'Fehler beim Löschen des Beitrags');
      return false;
    }
  }, [setPosts, setAdaptedPosts]);

  /**
   * Teilt einen Post (Django-API)
   */
  const sharePost = useCallback(async (postId: string) => {
    try {
      const result = await socialAPI.sharePost(postId);
      if (result) {
        toast.success('Beitrag wurde geteilt');
        return true;
      }
      return false;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error sharing post:', error);
      toast.error('Fehler beim Teilen des Beitrags');
      return false;
    }
  }, []);

  return {
    createPost,
    likePost,
    deletePost,
    sharePost
  };
};
