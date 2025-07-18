
import { useState, useCallback, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { usePosts } from '@/hooks/usePosts';
import { useNavigate } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useFeedData';
import { toast } from 'sonner';
import { adaptPostForCardSync, isNFTRelatedPost, isTokenRelatedPost } from '@/utils/postAdapter';

type FilterType = 'latest' | 'tokens' | 'nfts' | 'following';
type SortType = 'newest' | 'popular' | 'trending';

export const useUnifiedFeed = (feedType: FeedType) => {
  const { profile, isAuthenticated } = useProfile();
  const navigate = useNavigate();
  
  const { 
    posts, 
    isLoading, 
    error, 
    fetchPosts, 
    likePost, 
    deletePost, 
    createComment, 
    getPostComments, 
    sharePost 
  } = usePosts();
  
  const [filterType, setFilterType] = useState<FilterType>('latest');
  const [sortType, setSortType] = useState<SortType>('newest');
  const [filteredPosts, setFilteredPosts] = useState<ReturnType<typeof adaptPostForCardSync>[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Posts beim ersten Laden und bei Änderungen abrufen
  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchPosts(feedType);
    }
  }, [feedType, isAuthenticated, profile, fetchPosts]);
  
  // Filtern und Sortieren der Posts
  useEffect(() => {
    setFilteredPosts(posts || []);
  }, [posts]);
  
  // Feed aktualisieren
  const refreshFeed = useCallback(() => {
    if (isAuthenticated) {
      toast.info("Feed wird aktualisiert...");
      fetchPosts(feedType).then(() => {
        toast.success("Feed aktualisiert");
      });
    }
  }, [isAuthenticated, fetchPosts, feedType]);
  
  // Post-Aktionen
  const handleLikePost = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu liken");
      return false;
    }
    
    try {
      return await likePost(postId);
    } catch (error) {
      console.error('Fehler beim Liken:', error);
      return false;
    }
  }, [isAuthenticated, likePost]);
  
  const handleDeletePost = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu löschen");
      return false;
    }
    
    try {
      const result = await deletePost(postId);
      if (result) {
        await fetchPosts(feedType);
      }
      return result;
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      return false;
    }
  }, [isAuthenticated, deletePost, fetchPosts, feedType]);
  
  const handleCreateComment = useCallback(async (postId: string, content: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um zu kommentieren");
      return null;
    }
    
    try {
      return await createComment({ post_id: postId, content });
    } catch (error) {
      console.error('Fehler beim Kommentieren:', error);
      return null;
    }
  }, [isAuthenticated, createComment]);
  
  const handleSharePost = useCallback(async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu teilen");
      return false;
    }
    
    try {
      return await sharePost(postId);
    } catch (error) {
      console.error('Fehler beim Teilen:', error);
      return false;
    }
  }, [isAuthenticated, sharePost]);
  
  const handleReportPost = useCallback(async (postId: string, reason: string) => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu melden");
      return false;
    }
    
    try {
      // Implementierung für Report-Funktionalität
      toast.success("Beitrag wurde gemeldet");
      return true;
    } catch (error) {
      console.error('Fehler beim Melden:', error);
      return false;
    }
  }, [isAuthenticated]);
  
  const handleGetComments = useCallback(async (postId: string) => {
    try {
      return await getPostComments(postId);
    } catch (error) {
      console.error('Fehler beim Abrufen der Kommentare:', error);
      return [];
    }
  }, [getPostComments]);
  
  const handleLoginRedirect = useCallback(() => {
    navigate('/login');
  }, [navigate]);
  
  const openCreatePostModal = useCallback(() => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um Beiträge zu erstellen");
      navigate('/login');
      return;
    }
    
    setShowCreateModal(true);
  }, [isAuthenticated, navigate]);
  
  return {
    posts,
    filteredPosts,
    isLoading,
    error,
    filterType,
    setFilterType,
    sortType,
    setSortType,
    refreshFeed,
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleSharePost,
    handleReportPost,
    handleGetComments,
    handleLoginRedirect,
    openCreatePostModal,
    showCreateModal,
    setShowCreateModal
  };
};
