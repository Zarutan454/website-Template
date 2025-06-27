import { useState, useEffect, useCallback } from 'react';
import { djangoApi, type ApiResponse } from '@/lib/django-api-new';

export interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  post: number;
  created_at: string;
  updated_at: string;
  likes_count: number;
  is_liked?: boolean;
}

export interface CreateCommentData {
  post: number;
  content: string;
}

export const useComments = (postId: number) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<Comment[]> = await djangoApi.getComments(postId);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        // Filter comments by postId for safety
        const filtered = response.data.filter(c => c.post == postId);
        setComments(filtered);
      }
    } catch (err) {
      setError('Failed to fetch comments');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createComment = useCallback(async (content: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await djangoApi.createComment(postId, content);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Refresh comments to show the new comment
      await fetchComments();
      return true;
    } catch (err) {
      setError('Failed to create comment');
      console.error('Error creating comment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [postId, fetchComments]);

  const likeComment = useCallback(async (commentId: number): Promise<boolean> => {
    try {
      const response = await djangoApi.likeComment(commentId);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Update the comment in the local state
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: response.data?.liked || !comment.is_liked,
            likes_count: response.data?.like_count || comment.likes_count
          };
        }
        return comment;
      }));

      return true;
    } catch (err) {
      setError('Failed to like comment');
      console.error('Error liking comment:', err);
      return false;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    if (postId) {
      fetchComments();
    }
  }, [postId, fetchComments]);

  return {
    comments,
    loading,
    error,
    createComment,
    likeComment,
    refresh,
  };
}; 
