import React, { useState, useEffect } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { postRepository } from '@/repositories/PostRepository';
import { commentRepository } from '@/repositories/CommentRepository';
import { interactionRepository } from '@/repositories/InteractionRepository';
import FeedList from './FeedList';
import { adaptPostForCardSync } from '@/utils/postAdapter';
import { useMining } from '@/hooks/useMining';
import { useFeedFilter } from '@/hooks/feed/useFeedFilter';
import FeedFilters from './FeedFilters';
import { Tabs } from "@/components/ui/tabs";
import { FeedType } from '@/hooks/feed/useFeedData';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';

interface EnhancedFeedContainerProps {
  feedType: FeedType;
  showFilters?: boolean;
  showMiningRewards?: boolean;
  headerComponent?: React.ReactNode;
}

const EnhancedFeedContainer: React.FC<EnhancedFeedContainerProps> = ({
  feedType,
  showFilters = true,
  showMiningRewards = true,
  headerComponent
}) => {
  const { profile, isAuthenticated } = useProfile();
  const { recordActivity, isMining } = useMining();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Neueste");
  
  const fetchPosts = async () => {
    if (!isAuthenticated || !profile) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const fetchedPosts = await postRepository.getFeedPosts(feedType, profile.id);
      setPosts(fetchedPosts);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (profile && isAuthenticated) {
      fetchPosts();
    }
  }, [feedType, profile, isAuthenticated]);
  
  const { filteredPosts } = useFeedFilter({
    posts,
    currentUserId: profile?.id || '',
    initialSort: 'newest',
    initialFilter: feedType === 'tokens' ? 'tokens' : feedType === 'nfts' ? 'nfts' : 'all'
  });
  
  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Beiträge zu liken");
      return false;
    }
    
    try {
      const result = await interactionRepository.togglePostLike(profile.id, postId);
      
      if (result.success) {
        if (showMiningRewards && isMining && result.isLiked) {
          await recordActivity('like', 5, 0.5);
        }
        
        await fetchPosts();
        return result.isLiked;
      }
      
      return false;
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Beiträge zu löschen");
      return false;
    }
    
    try {
      const result = await postRepository.deletePost(postId);
      
      if (result) {
        toast.success("Beitrag erfolgreich gelöscht");
        await fetchPosts();
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error("Fehler beim Löschen des Beitrags");
      return false;
    }
  };
  
  const handleCreateComment = async (postId: string, content: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um zu kommentieren");
      return null;
    }
    
    try {
      const result = await commentRepository.createComment(profile.id, postId, content);
      
      if (result) {
        if (showMiningRewards && isMining) {
          await recordActivity('comment', 10, 1);
        }
        
        await fetchPosts();
      }
      
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error("Fehler beim Erstellen des Kommentars");
      return null;
    }
  };
  
  const handleGetComments = async (postId: string) => {
    try {
      return await commentRepository.getPostComments(postId);
    } catch (error) {
      console.error('Error getting comments:', error);
      toast.error("Fehler beim Laden der Kommentare");
      return [];
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Kommentare zu löschen");
      return false;
    }
    
    try {
      const result = await commentRepository.deleteComment(commentId, profile.id);
      
      if (result) {
        await fetchPosts();
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Fehler beim Löschen des Kommentars");
      return false;
    }
  };
  
  const handleSharePost = async (postId: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Beiträge zu teilen");
      return false;
    }
    
    try {
      const shareResult = await interactionRepository.sharePost(postId);
      
      if (shareResult) {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast.success("Link zum Beitrag wurde in die Zwischenablage kopiert");
        
        if (showMiningRewards && isMining) {
          await recordActivity('share', 15, 1.5);
        }
        
        await fetchPosts();
      }
      
      return shareResult;
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error("Fehler beim Teilen des Beitrags");
      return false;
    }
  };
  
  const handleReportPost = async (postId: string, reason: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Beiträge zu melden");
      return false;
    }
    
    try {
      const result = await interactionRepository.reportPost(profile.id, postId, reason);
      
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
    }
  };
  
  const toggleFilters = () => setShowFilterMenu(!showFilterMenu);
  
  const handleFilterSelect = (filter: string | null) => {
    setSelectedFilter(filter);
    setShowFilterMenu(false);
  };
  
  const handleRetry = () => fetchPosts();
  
  const handleLoginRedirect = () => navigate('/login');
  
  const postsToDisplay = filteredPosts.map(post => 
    adaptPostForCardSync(post, profile?.id || '')
  );
  
  return (
    <div className="space-y-6">
      {headerComponent}
      
      {showFilters && (
        <Tabs defaultValue="filters" className="w-full">
          <FeedFilters
            showFilters={showFilterMenu}
            selectedFilter={selectedFilter}
            handleFilterSelect={handleFilterSelect}
            toggleFilters={toggleFilters}
          />
        </Tabs>
      )}
      
      <FeedList
        posts={postsToDisplay}
        profile={profile}
        isLoading={isLoading}
        error={error}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
        onComment={handleCreateComment}
        onDeleteComment={handleDeleteComment}
        onGetComments={handleGetComments}
        onShare={handleSharePost}
        onReport={handleReportPost}
        onRetry={handleRetry}
        onLoginRedirect={handleLoginRedirect}
        showMiningRewards={showMiningRewards}
      />
    </div>
  );
};

export default EnhancedFeedContainer;
