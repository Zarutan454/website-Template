
import { useCallback } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { usePostsFetch } from './post/usePostsFetch';
import { usePostActions } from './post/usePostActions';
import { useCommentActions } from './post/useCommentActions';
import { CreatePostData, CreateCommentData, Post } from '@/types/posts';
import { toast } from 'sonner';

// Re-export the types for backward compatibility
export type { CreatePostData, CreateCommentData, Post };

/**
 * Haupthook für Posts, der alle Post-bezogenen Funktionalitäten kombiniert
 */
export const usePosts = () => {
  const { profile } = useProfile();
  
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
  const fetchPosts = useCallback(async (feedType: string = 'recent') => {
    if (!profile) return;
    return fetchPostsInternal(feedType, profile.id);
  }, [profile, fetchPostsInternal]);
  
  // Post-Actions-Hook für Like, Delete, Share
  const { 
    createPost: createPostInternal, 
    likePost, 
    deletePost, 
    sharePost 
  } = usePostActions(setPosts, setAdaptedPosts, fetchPosts);
  
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
    
    return createPostInternal(profile.id, postData);
  }, [profile, createPostInternal]);
  
  // Wrapper für createComment mit Profil-ID
  const createComment = useCallback(async (commentData: CreateCommentData) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um zu kommentieren");
      return null;
    }
    
    return createCommentInternal(profile.id, commentData);
  }, [profile, createCommentInternal]);
  
  // Wrapper für deleteComment mit Profil-ID
  const deleteComment = useCallback(async (commentId: string) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um Kommentare zu löschen");
      return false;
    }
    
    return deleteCommentInternal(commentId, profile.id);
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
