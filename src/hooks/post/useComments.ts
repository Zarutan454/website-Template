import { useState, useEffect, useCallback } from 'react';
import djangoApi from '@/lib/django-api-new';

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
      const response = await djangoApi.getComments(postId);
      
      if (response && Array.isArray(response)) {
        // Response is directly an array of comments
        const filtered = response.filter(c => c.post == postId);
        setComments(filtered);
      } else if (response && response.results) {
        // Response is paginated
        const filtered = response.results.filter(c => c.post == postId);
        setComments(filtered);
      } else {
        setComments([]);
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
      const response = await djangoApi.createComment(postId, { content });
      
      if (!response) {
        setError('Failed to create comment');
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
      if (!response) {
        setError('Failed to like comment');
        return false;
      }
      // Update the comment in the local state mit echten Werten aus der Response
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            is_liked: response.liked,
            likes_count: response.like_count || 0
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
