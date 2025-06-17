
import React, { useState, useEffect } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { postRepository } from '@/repositories/PostRepository';
import FeedList from './FeedList';
import { adaptPostForCardSync } from '@/utils/postAdapter';
import { CreateCommentData } from '@/types/posts';
import { useMining } from '@/hooks/useMining';
import FeedFilters from './FeedFilters';
import { Tabs } from "@/components/ui/tabs";

interface FeedContainerProps {
  feedType: 'recent' | 'popular' | 'following' | 'foryou' | 'tokens' | 'nfts';
  showFilters?: boolean;
  showMiningRewards?: boolean;
  headerComponent?: React.ReactNode;
}

const FeedContainer: React.FC<FeedContainerProps> = ({
  feedType,
  showFilters = true,
  showMiningRewards = true,
  headerComponent
}) => {
  const { 
    posts, 
    isLoading, 
    error, 
    fetchPosts, 
    likePost, 
    deletePost, 
    createComment, 
    deleteComment,
    getPostComments, 
    sharePost 
  } = usePosts();
  const { profile, isAuthenticated } = useProfile();
  const { recordActivity, isMining } = useMining();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme === 'dark';
  
  const [selectedFilter, setSelectedFilter] = useState<string | null>("Neueste");
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  
  useEffect(() => {
    if (profile && isAuthenticated) {
      fetchPosts(feedType);
    }
  }, [feedType, fetchPosts, profile, isAuthenticated]);
  
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
      }
      
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts([]);
    }
  }, [posts, selectedFilter, feedType]);
  
  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Beiträge zu liken");
      return false;
    }
    
    try {
      const result = await postRepository.togglePostLike(profile.id, postId);
      
      if (result.success) {
        if (showMiningRewards && isMining && result.isLiked) {
          await recordActivity('like', 5, 0.5);
        }
        
        await fetchPosts(feedType);
        return result.isLiked;
      }
      
      return false;
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Beiträge zu löschen");
      return false;
    }
    
    try {
      const result = await deletePost(postId);
      
      if (result) {
        toast.success("Beitrag erfolgreich gelöscht");
        await fetchPosts(feedType);
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
      const commentData: CreateCommentData = {
        post_id: postId,
        content
      };
      
      const result = await createComment(commentData);
      
      if (result) {
        if (showMiningRewards && isMining) {
          await recordActivity('comment', 10, 1);
        }
        
        await getPostComments(postId);
        await fetchPosts(feedType);
      }
      
      return result;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error("Fehler beim Erstellen des Kommentars");
      return null;
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (!isAuthenticated || !profile) {
      toast.error("Bitte melde dich an, um Kommentare zu löschen");
      return false;
    }
    
    try {
      const result = await deleteComment(commentId);
      
      if (result) {
        await fetchPosts(feedType);
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error("Fehler beim Löschen des Kommentars");
      return false;
    }
  };
  
  const handleSharePost = async (postId: string) => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um Beiträge zu teilen");
      return false;
    }
    
    try {
      const shareResult = await sharePost(postId);
      
      if (shareResult) {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast.success("Link zum Beitrag wurde in die Zwischenablage kopiert");
        
        if (showMiningRewards && isMining) {
          await recordActivity('share', 15, 1.5);
        }
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
      const result = await postRepository.reportPost(profile.id, postId, reason);
      
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
  
  const handleRetry = () => fetchPosts(feedType);
  
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
        onGetComments={getPostComments}
        onShare={handleSharePost}
        onReport={handleReportPost}
        onRetry={handleRetry}
        onLoginRedirect={handleLoginRedirect}
        showMiningRewards={showMiningRewards}
      />
    </div>
  );
};

export default FeedContainer;
