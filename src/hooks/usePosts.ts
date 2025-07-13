import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePostsFetch } from './post/usePostsFetch';
import { usePostActions } from './post/usePostActions';
import { useCommentActions } from './post/useCommentActions';
import { CreatePostData, CreateCommentData, Post } from '../types/posts';
import { toast } from 'sonner';

// Re-export the types for backward compatibility
export type { CreatePostData, CreateCommentData, Post };

/**
 * Haupthook für Posts, der alle Post-bezogenen Funktionalitäten kombiniert
 */
export const usePosts = () => {
  const { user: profile } = useAuth();
  
  // Post-Fetch-Hook für das Laden von Posts
  const { 
    posts, 
    setPosts, 
    adaptedPosts, 
    setAdaptedPosts, 
    isLoading, 
    error, 
    fetchPosts: fetchPostsInternal 
  } = usePostsFetch();
  
  // Wrapper für fetchPosts, der den Benutzer automatisch mitgibt
  const fetchPosts = useCallback(async (feedType: string = 'recent', userFilter?: string) => {
    // userFilter = user_id (Profilseite) oder undefined (Feed)
    if (userFilter) {
      return fetchPostsInternal(feedType, userFilter, undefined);
    }
    if (!profile) {
      console.log('[usePosts] No profile found, cannot fetch posts');
      return;
    }
    return fetchPostsInternal(feedType, profile.id.toString());
  }, [profile, fetchPostsInternal]);
  
  // Post-Actions-Hook für Like, Delete, Share
  const { 
    createPost: createPostInternal, 
    likePost, 
    deletePost, 
    sharePost 
  } = usePostActions(
    setPosts as unknown as React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>, 
    setAdaptedPosts as unknown as React.Dispatch<React.SetStateAction<Record<string, unknown>[]>>, 
    fetchPosts
  );
  
  // Kommentar-Actions-Hook für Kommentare
  const { 
    createComment: createCommentInternal, 
    getPostComments,
    deleteComment: deleteCommentInternal 
  } = useCommentActions(fetchPosts);
  
  // Wrapper für createPost mit Profil-ID
  const createPost = useCallback(async (postData: CreatePostData) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um einen Beitrag zu erstellen");
      return { success: false, error: "Not authenticated" };
    }
    
    return createPostInternal(profile.id.toString(), postData);
  }, [profile, createPostInternal]);
  
  // Wrapper für createComment mit Profil-ID
  const createComment = useCallback(async (commentData: CreateCommentData) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um zu kommentieren");
      return null;
    }
    
    return createCommentInternal(profile.id.toString(), commentData);
  }, [profile, createCommentInternal]);
  
  // Wrapper für deleteComment mit Profil-ID
  const deleteComment = useCallback(async (commentId: string) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um Kommentare zu löschen");
      return false;
    }
    
    return deleteCommentInternal(commentId, profile.id.toString());
  }, [profile, deleteCommentInternal]);

  return {
    posts,
    adaptedPosts,
    isLoading,
    error,
    fetchPosts,
    createPost,
    likePost,
    deletePost,
    createComment,
    deleteComment,
    getPostComments,
    sharePost
  };
};
