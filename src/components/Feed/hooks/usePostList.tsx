import { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useTheme } from '@/components/ThemeProvider.utils';
import { postRepository } from '@/repositories/PostRepository';

export const usePostList = (feedType: 'foryou' | 'following' | 'recent' | 'popular' | 'nfts' = 'foryou') => {
  const { theme } = useTheme();
  const { profile, isAuthenticated, isLoading: profileLoading } = useProfile();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Neueste");
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const { 
    posts, 
    adaptedPosts,
    isLoading, 
    error, 
    likePost, 
    deletePost, 
    getPostComments, 
    createComment,
    fetchPosts,
    sharePost
  } = usePosts();

  const isDarkMode = theme === "dark";

  useEffect(() => {
    if (posts.length > 0 && adaptedPosts.length === 0) {
    }
  }, [posts, adaptedPosts, isLoading, error, isAuthenticated, profileLoading]);

  useEffect(() => {
    if (!profileLoading) {
      console.log('User authentication in PostList:', isAuthenticated ? 'Authenticated' : 'Not authenticated');
      
      if (!isLoading && posts.length === 0 && !error) {
        console.log('Fetching posts in PostList useEffect');
        fetchPosts(feedType);
      }
    }
  }, [isAuthenticated, profileLoading, feedType, fetchPosts, isLoading, posts.length, error]);

  useEffect(() => {
    if (!profileLoading && isAuthenticated) {
      console.log('Feed type changed, reloading posts:', feedType);
      fetchPosts(feedType);
    }
  }, [feedType, isAuthenticated, profileLoading, fetchPosts]);

  useEffect(() => {
    setFilteredPosts(posts || []);
  }, [posts]);

  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Beiträge zu liken");
      return false;
    }
    
    try {
      const result = await postRepository.togglePostLike(profile.id, postId);
      console.log('Like operation result:', result);
      
      if (result.success) {
        fetchPosts(feedType);
      }
      
      return result.success ? result.isLiked : false;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Beiträge zu löschen");
      return false;
    }
    return await deletePost(postId);
  };

  const handleCreateComment = async (postId: string, content: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um zu kommentieren");
      return null;
    }
    
    console.log('Creating comment on post:', postId, content);
    const result = await createComment({ post_id: postId, content });
    
    if (result) {
      console.log('Comment created successfully');
      
      await getPostComments(postId);
    }
    
    return result;
  };

  const handleGetComments = async (postId: string) => {
    console.log('Getting comments for post:', postId);
    return await getPostComments(postId);
  };

  const handleSharePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Beiträge zu teilen");
      return false;
    }
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Teile diesen Beitrag',
          url: `${window.location.origin}/post/${postId}`
        });
        await sharePost(postId);
        return true;
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast.success("Link in die Zwischenablage kopiert");
        await sharePost(postId);
        return true;
      }
    } catch (err) {
      console.error('Error sharing post:', err);
      toast.error("Fehler beim Teilen des Beitrags");
      return false;
    }
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterSelect = (filter: string | null) => {
    setSelectedFilter(filter);
    toast.success(`Filter auf ${filter || 'Alle'} gesetzt`);
    setShowFilters(false);
  };

  const handleRetry = () => {
    console.log('Retrying post fetch...');
    fetchPosts(feedType);
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return {
    profile,
    isAuthenticated,
    profileLoading,
    showFilters,
    selectedFilter,
    filteredPosts,
    posts,
    adaptedPosts,
    isLoading,
    error,
    isDarkMode,
    toggleFilters,
    handleFilterSelect,
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleRetry,
    handleLoginRedirect
  };
};

