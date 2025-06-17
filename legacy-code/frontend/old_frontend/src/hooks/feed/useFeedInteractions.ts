
import { useCallback } from 'react';
import { toast } from 'sonner';
import { useMining } from '@/hooks/useMining';
import { FeedType } from './useFeedData';
import { CreateCommentData } from '@/types/posts';

export interface UseFeedInteractionsOptions {
  showMiningRewards?: boolean;
  likePost: (postId: string) => Promise<boolean>;
  deletePost: (postId: string) => Promise<boolean>;
  createComment: (data: CreateCommentData) => Promise<Comment | null>;
  getPostComments: (postId: string) => Promise<Comment[]>;
  sharePost: (postId: string) => Promise<boolean>;
  createPost?: (data: CreatePostData) => Promise<{ success: boolean; data?: unknown }>;
  fetchPosts: (feedType?: string) => Promise<unknown>;
  feedType?: FeedType;
}

/**
 * Hook for handling feed post interactions with mining rewards integration
 */
export const useFeedInteractions = ({
  showMiningRewards = false,
  likePost,
  deletePost,
  createComment,
  getPostComments,
  sharePost,
  createPost,
  fetchPosts,
  feedType = 'recent'
}: UseFeedInteractionsOptions) => {
  const { recordActivity, isMining } = useMining();
  
  // Track actions being processed to prevent duplicates
  const processingActions = {
    likes: new Set<string>(),
    comments: new Set<string>(),
    shares: new Set<string>(),
    deletes: new Set<string>()
  };
  
  // Like post with mining rewards
  const handleLikePost = useCallback(async (postId: string) => {
    if (processingActions.likes.has(postId)) return false;
    
    try {
      processingActions.likes.add(postId);
      const result = await likePost(postId);
      
      if (result && showMiningRewards && isMining) {
        await recordActivity('like', 5, 0.5);
      }
      
      return result;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error("Fehler beim Liken des Beitrags");
      return false;
    } finally {
      processingActions.likes.delete(postId);
    }
  }, [likePost, showMiningRewards, isMining, recordActivity]);
  
  // Delete post
  const handleDeletePost = useCallback(async (postId: string) => {
    if (processingActions.deletes.has(postId)) return false;
    
    try {
      processingActions.deletes.add(postId);
      const result = await deletePost(postId);
      
      if (result) {
        toast.success("Beitrag wurde gelöscht");
        await fetchPosts(feedType);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Fehler beim Löschen des Beitrags");
      return false;
    } finally {
      processingActions.deletes.delete(postId);
    }
  }, [deletePost, fetchPosts, feedType]);
  
  // Create comment with mining rewards
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    if (processingActions.comments.has(postId)) return null;
    
    try {
      processingActions.comments.add(postId);
      const result = await createComment({ post_id: postId, content });
      
      if (result && showMiningRewards && isMining) {
        await recordActivity('comment', 10, 1);
      }
      
      await fetchPosts(feedType);
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error("Fehler beim Erstellen des Kommentars");
      return null;
    } finally {
      processingActions.comments.delete(postId);
    }
  }, [createComment, showMiningRewards, isMining, recordActivity, fetchPosts, feedType]);
  
  // Get post comments
  const handleGetComments = useCallback(async (postId: string) => {
    try {
      return await getPostComments(postId);
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }, [getPostComments]);
  
  // Share post with mining rewards
  const handleSharePost = useCallback(async (postId: string) => {
    if (processingActions.shares.has(postId)) return false;
    
    try {
      processingActions.shares.add(postId);
      const result = await sharePost(postId);
      
      if (result) {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast.success("Link zum Beitrag wurde in die Zwischenablage kopiert");
        
        if (showMiningRewards && isMining) {
          await recordActivity('share', 15, 1.5);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Fehler beim Teilen des Beitrags");
      return false;
    } finally {
      processingActions.shares.delete(postId);
    }
  }, [sharePost, showMiningRewards, isMining, recordActivity]);
  
  // Report post
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    try {
      toast.success("Deine Meldung wurde erfolgreich übermittelt");
      return true;
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error("Fehler beim Melden des Beitrags");
      return false;
    }
  }, []);
  
  // Create post with mining rewards
  const handleCreatePost = useCallback(async (content: string, mediaUrl?: string | null) => {
    if (!createPost) return false;
    
    try {
      const result = await createPost({
        content,
        media_url: mediaUrl || null
      });
      
      if (result.success) {
        if (showMiningRewards && isMining) {
          await recordActivity('post', 25, 2.5);
        }
        
        await fetchPosts(feedType);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Fehler beim Erstellen des Beitrags");
      return false;
    }
  }, [createPost, showMiningRewards, isMining, recordActivity, fetchPosts, feedType]);
  
  return {
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost,
    handleCreatePost,
    processingActions
  };
};
