
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { postRepository } from '@/repositories/PostRepository';
import { commentRepository } from '@/repositories/CommentRepository';
import { interactionRepository } from '@/repositories/InteractionRepository';
import { useMining } from '@/hooks/useMining';
import { CreateCommentData } from '@/types/posts';

interface UseEnhancedFeedActionsProps {
  fetchPosts: (feedType?: string | boolean, reset?: boolean) => Promise<void>;
  showMiningRewards?: boolean;
  likePost?: (postId: string, userId: string) => Promise<{ success?: boolean; isLiked?: boolean }>;
  deletePost?: (postId: string) => Promise<boolean>;
  createComment?: (postId: string, content: string) => Promise<CreateCommentData | null>;
  getPostComments?: (postId: string) => Promise<CreateCommentData[]>;
  sharePost?: (postId: string) => Promise<boolean>;
}

export const useEnhancedFeedActions = ({
  fetchPosts,
  showMiningRewards = false,
  likePost: propLikePost,
  deletePost: propDeletePost,
  createComment: propCreateComment,
  getPostComments: propGetComments,
  sharePost: propSharePost
}: UseEnhancedFeedActionsProps) => {
  const { recordActivity, isMining } = useMining();
  const [processingActions, setProcessingActions] = useState<Record<string, boolean>>({});

  // Hilfsfunktion zum Setzen des Verarbeitungsstatus
  const setProcessing = (action: string, postId: string, isProcessing: boolean) => {
    setProcessingActions(prev => ({
      ...prev,
      [`${action}_${postId}`]: isProcessing
    }));
  };

  const isProcessing = (action: string, postId: string) => {
    return processingActions[`${action}_${postId}`] || false;
  };

  // Like/Unlike Post
  const handleLikePost = useCallback(async (postId: string) => {
    if (isProcessing('like', postId)) return false;
    
    try {
      setProcessing('like', postId, true);
      
      // Verwende die übergebene Funktion oder das Repository
      const result = propLikePost 
        ? await propLikePost(postId, 'current-user-id') // userId würde normalerweise aus dem auth context kommen
        : await interactionRepository.togglePostLike('current-user-id', postId);
      
      if (result?.success && showMiningRewards && isMining && result.isLiked) {
        await recordActivity('like', 5, 0.5);
      }
      
      return result?.isLiked || false;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    } finally {
      setProcessing('like', postId, false);
    }
  }, [propLikePost, showMiningRewards, isMining, recordActivity]);

  // Delete Post
  const handleDeletePost = useCallback(async (postId: string) => {
    if (isProcessing('delete', postId)) return false;
    
    try {
      setProcessing('delete', postId, true);
      
      // Bestätigungsdialog
      if (!confirm("Möchtest du diesen Beitrag wirklich löschen?")) {
        return false;
      }
      
      const result = propDeletePost 
        ? await propDeletePost(postId)
        : await postRepository.deletePost(postId);
      
      if (result) {
        toast.success("Beitrag erfolgreich gelöscht");
        // Handle different signature between fetchPosts implementations
        if (typeof fetchPosts === 'function') {
          // Use boolean parameters if that's what the function expects
          if (fetchPosts.length <= 2) {
            await fetchPosts(false, true);
          } else {
            // Use string parameter if that's what the function expects
            await fetchPosts();
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Fehler beim Löschen des Beitrags");
      return false;
    } finally {
      setProcessing('delete', postId, false);
    }
  }, [propDeletePost, fetchPosts]);

  // Create Comment
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    if (isProcessing('comment', postId) || !content.trim()) return null;
    
    try {
      setProcessing('comment', postId, true);
      
      const result = propCreateComment 
        ? await propCreateComment(postId, content)
        : await commentRepository.createComment('current-user-id', postId, content);
      
      if (result && showMiningRewards && isMining) {
        await recordActivity('comment', 10, 1);
      }
      
      // Handle different signature between fetchPosts implementations
      if (typeof fetchPosts === 'function') {
        // Use boolean parameters if that's what the function expects
        if (fetchPosts.length <= 2) {
          await fetchPosts(false, true);
        } else {
          // Use string parameter if that's what the function expects
          await fetchPosts();
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error("Fehler beim Erstellen des Kommentars");
      return null;
    } finally {
      setProcessing('comment', postId, false);
    }
  }, [propCreateComment, fetchPosts, showMiningRewards, isMining, recordActivity]);

  // Get Comments
  const handleGetComments = useCallback(async (postId: string) => {
    try {
      return propGetComments
        ? await propGetComments(postId)
        : await commentRepository.getPostComments(postId);
    } catch (error) {
      console.error('Error getting comments:', error);
      toast.error("Fehler beim Laden der Kommentare");
      return [];
    }
  }, [propGetComments]);

  // Share Post
  const handleSharePost = useCallback(async (postId: string) => {
    if (isProcessing('share', postId)) return false;
    
    try {
      setProcessing('share', postId, true);
      
      const shareResult = propSharePost
        ? await propSharePost(postId)
        : await interactionRepository.sharePost(postId);
      
      if (shareResult) {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast.success("Link zum Beitrag wurde in die Zwischenablage kopiert");
        
        if (showMiningRewards && isMining) {
          await recordActivity('share', 15, 1.5);
        }
        
        // Handle different signature between fetchPosts implementations
        if (typeof fetchPosts === 'function') {
          // Use boolean parameters if that's what the function expects
          if (fetchPosts.length <= 2) {
            await fetchPosts(false, true);
          } else {
            // Use string parameter if that's what the function expects
            await fetchPosts();
          }
        }
      }
      
      return shareResult;
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Fehler beim Teilen des Beitrags");
      return false;
    } finally {
      setProcessing('share', postId, false);
    }
  }, [propSharePost, fetchPosts, showMiningRewards, isMining, recordActivity]);

  // Report Post
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    if (isProcessing('report', postId)) return false;
    
    try {
      setProcessing('report', postId, true);
      
      const result = await interactionRepository.reportPost('current-user-id', postId, reason);
      
      if (result) {
        toast.success("Deine Meldung wurde erfolgreich übermittelt. Unser Team wird den Beitrag überprüfen.");
      } else {
        toast.error("Fehler beim Melden des Beitrags.");
      }
      
      return result;
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    } finally {
      setProcessing('report', postId, false);
    }
  }, []);

  return {
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost,
    processingActions,
    isProcessing
  };
};
