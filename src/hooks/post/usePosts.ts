import { useState, useEffect, useCallback } from 'react';
import { djangoApi, type ApiResponse, type PaginatedResponse } from '@/lib/django-api-new';

export interface Post {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatar?: string;
  };
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  media?: string[];
  group?: {
    id: number;
    name: string;
  };
  is_liked?: boolean;
}

export interface CreatePostData {
  content: string;
  media?: File[];
  group?: number;
}

export interface UpdatePostData {
  content?: string;
  media?: File[];
  group?: number;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(async (page: number = 1, append: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const response: ApiResponse<PaginatedResponse<Post>> = await djangoApi.getPosts(page);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        const newPosts = response.data.results;
        
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setHasMore(!!response.data.next);
        setCurrentPage(page);
      }
    } catch (err) {
      setError('Failed to fetch posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (postData: CreatePostData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await djangoApi.createPost(postData);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Refresh posts to show the new post
      await fetchPosts(1, false);
      return true;
    } catch (err) {
      setError('Failed to create post');
      console.error('Error creating post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchPosts]);

  const likePost = useCallback(async (postId: number): Promise<boolean> => {
    try {
      const response = await djangoApi.likePost(postId);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Update the post in the local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            is_liked: response.data?.liked || !post.is_liked,
            likes_count: response.data?.like_count || post.likes_count
          };
        }
        return post;
      }));

      return true;
    } catch (err) {
      setError('Failed to like post');
      console.error('Error liking post:', err);
      return false;
    }
  }, []);

  const sharePost = useCallback(async (postId: number): Promise<boolean> => {
    try {
      const response = await djangoApi.sharePost(postId);
      
      if (response.error) {
        setError(response.error);
        return false;
      }

      // Update the post in the local state
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            shares_count: response.data?.shares_count || post.shares_count
          };
        }
        return post;
      }));

      return true;
    } catch (err) {
      setError('Failed to share post');
      console.error('Error sharing post:', err);
      return false;
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchPosts(currentPage + 1, true);
    }
  }, [loading, hasMore, currentPage, fetchPosts]);

  const refresh = useCallback(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts(1, false);
  }, [fetchPosts]);

  return {
    posts,
    loading,
    error,
    hasMore,
    createPost,
    likePost,
    sharePost,
    loadMore,
    refresh,
  };
}; 
