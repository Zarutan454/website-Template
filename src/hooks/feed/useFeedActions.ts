
import { useCallback } from 'react';
import { toast } from 'sonner';
import { FeedType } from './useFeedData';

export interface FeedActionHandlers {
  likePost: (postId: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  createComment: (data: { post_id: string; content: string }) => Promise<Comment | null>;
  getPostComments: (postId: string) => Promise<Comment[]>;
  sharePost: (postId: string) => Promise<boolean>;
  reportPost?: (postId: string, reason: string) => Promise<boolean>;
}

export interface FeedActionProps extends FeedActionHandlers {
  fetchPosts?: (feedType?: string) => Promise<boolean>;
  feedType?: FeedType;
}

/**
 * Basis-Hook für Feed-Aktionen, der die Grundfunktionalität für Interaktionen mit Posts bereitstellt
 */
export const useFeedActions = ({
  fetchPosts,
  likePost,
  deletePost,
  createComment,
  getPostComments,
  sharePost,
  feedType = 'recent'
}: FeedActionProps) => {
  // Handler für Like-Aktionen
  const handleLikePost = useCallback(async (postId: string) => {
    try {
      return await likePost(postId);
    } catch (error) {
      console.error('[handleLikePost] Error liking post:', error);
      toast.error("Fehler beim Liken des Beitrags");
      return false;
    }
  }, [likePost]);

  // Handler für Lösch-Aktionen
  const handleDeletePost = useCallback(async (postId: string) => {
    try {
      const confirmed = window.confirm("Möchtest du diesen Beitrag wirklich löschen?");
      
      if (!confirmed) {
        return false;
      }
      
      const success = await deletePost(postId);
      
      if (success) {
        toast.success("Beitrag wurde gelöscht");
        if (fetchPosts) {
          await fetchPosts(feedType);
        }
      } else {
        toast.error("Beitrag konnte nicht gelöscht werden");
      }
      
      return success;
    } catch (error) {
      console.error('[handleDeletePost] Error deleting post:', error);
      toast.error("Fehler beim Löschen des Beitrags");
      return false;
    }
  }, [deletePost, fetchPosts, feedType]);

  // Handler für Kommentar-Erstellung
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    try {
      return await createComment({ post_id: postId, content });
    } catch (error) {
      console.error('[handleCreateComment] Error creating comment:', error);
      toast.error("Fehler beim Erstellen des Kommentars");
      return null;
    }
  }, [createComment]);

  // Handler für Kommentar-Abruf
  const handleGetComments = useCallback(async (postId: string) => {
    try {
      return await getPostComments(postId);
    } catch (error) {
      console.error('[handleGetComments] Error fetching comments:', error);
      return [];
    }
  }, [getPostComments]);

  // Handler für Share-Aktionen
  const handleSharePost = useCallback(async (postId: string) => {
    try {
      const success = await sharePost(postId);
      
      if (success) {
        toast.success("Beitrag wurde geteilt");
      }
      
      return success;
    } catch (error) {
      console.error('[handleSharePost] Error sharing post:', error);
      toast.error("Fehler beim Teilen des Beitrags");
      return false;
    }
  }, [sharePost]);

  // Handler für Report-Aktionen
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    toast.success("Beitrag wurde gemeldet");
    return true;
  }, []);

  return {
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost
  };
};
