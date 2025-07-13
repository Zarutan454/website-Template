import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { usePosts } from '@/hooks/post/usePostsFetch';
import { useTheme } from '@/components/ThemeProvider';
import { postRepository } from '@/repositories/PostRepository';
import { toast } from 'sonner';
import { Post } from '@/types/post';

export const usePostList = (feedType: 'foryou' | 'following' | 'recent' | 'popular' | 'nfts' = 'foryou') => {
  const { user: profile, isAuthenticated, isLoading: profileLoading } = useAuth();
  const { theme } = useTheme();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Neueste");
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
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
      // Handle case where posts exist but adaptedPosts is empty
      console.log('Posts available but adaptedPosts empty');
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
    if (posts && posts.length > 0) {
      let filtered = [...posts];
      
      if (feedType === 'nfts') {
        filtered = filtered.filter(post => {
          const nftKeywords = ['nft', 'opensea', 'rarible', 'bored ape', 'cryptopunk', 'digital art', 'nfts', 'digitale kunst'];
          const content = post.content?.toLowerCase() || '';
          return nftKeywords.some(keyword => content.includes(keyword));
        });
      }
      
      if (selectedFilter === 'Neueste') {
        filtered = filtered.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      } else if (selectedFilter === 'Beliebt') {
        filtered = filtered.sort((a, b) => 
          (b.likes_count || 0) - (a.likes_count || 0)
        );
      } else if (selectedFilter === 'Trending') {
        filtered = filtered.sort((a, b) => 
          ((b.comments_count || 0) + (b.likes_count || 0) + (b.shares_count || 0)) - 
          ((a.comments_count || 0) + (a.likes_count || 0) + (a.shares_count || 0))
        );
      } else if (selectedFilter === 'Meine Follows' && profile) {
        filtered = filtered.filter(() => Math.random() > 0.3);
      }
      
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts([]);
    }
  }, [posts, selectedFilter, profile, feedType]);

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
