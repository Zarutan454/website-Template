
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { FeedStateRenderer } from './common';
import { useFeedData, FeedType } from '@/hooks/feed/useFeedData';
import { useEnhancedFeedActions } from '@/hooks/feed/useEnhancedFeedActions';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import { Tabs } from "@/components/ui/tabs";
import VirtualizedFeed from './VirtualizedFeed';
import FeedFilterOptimized from './FeedFilterOptimized';
import EnhancedFeedHeader from './components/EnhancedFeedHeader';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { TooltipProvider } from "@/components/ui/tooltip";
import FeedHeader from './components/FeedHeader';
import CreatePostBox from './components/CreatePostBox';
import CreatePostModal from './components/CreatePostModal';
import { CreateCommentData } from '@/types/posts';

interface UnifiedFeedContainerProps {
  feedType: FeedType;
  showFilters?: boolean;
  showMiningRewards?: boolean;
  showCreatePostForm?: boolean;
  showHeader?: boolean;
  headerComponent?: React.ReactNode;
}

const UnifiedFeedContainer: React.FC<UnifiedFeedContainerProps> = ({
  feedType,
  showFilters = true,
  showMiningRewards = false,
  showCreatePostForm = true,
  showHeader = true,
  headerComponent
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme === 'dark';
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { showFilterMenu, selectedFilter, toggleFilters, handleFilterSelect } = useFilterControl();

  const { 
    adaptedPosts, 
    isLoading, 
    error, 
    fetchPosts, 
    profileLoading, 
    isAuthenticated, 
    profile,
    likePost,
    deletePost,
    createPost,
    createComment,
    getPostComments,
    sharePost,
    lastUpdated,
    hasNewPosts
  } = useFeedData({ 
    feedType, 
    selectedFilter,
    enableAutoRefresh: true,
    refreshInterval: 120000
  });

  // Create adapter functions to match expected signatures
  
  // Adapter for fetchPosts to match the signature expected by useEnhancedFeedActions
  const adaptedFetchPosts = useCallback(async (checkForNew?: boolean, reset?: boolean) => {
    await fetchPosts(feedType as string);
  }, [fetchPosts, feedType]);

  // Adapter for createComment to match the signature expected by useEnhancedFeedActions
  const adaptedCreateComment = useCallback(async (postId: string, content: string) => {
    return createComment({ post_id: postId, content });
  }, [createComment]);

  const {
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost,
    processingActions
  } = useEnhancedFeedActions({ 
    fetchPosts: adaptedFetchPosts,
    showMiningRewards,
    likePost,
    deletePost,
    createComment: adaptedCreateComment,
    getPostComments,
    sharePost
  });

  const handleRefresh = useCallback(async () => {
    toast.info("Feed wird aktualisiert...");
    await fetchPosts();
    toast.success("Feed wurde aktualisiert");
  }, [fetchPosts]);

  useEffect(() => {
    const handleScroll = () => {
      if (hasNewPosts && window.scrollY < 100) {
        handleRefresh();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNewPosts, handleRefresh]);

  const handleRetry = () => fetchPosts();

  const handleLoginRedirect = () => navigate('/login');

  const handleCreatePost = async (content: string, mediaUrl?: string | null) => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um Beiträge zu erstellen");
      return false;
    }
    
    try {
      const result = await createPost({
        content,
        media_url: mediaUrl || undefined
      });
      
      if (result.success) {
        await fetchPosts();
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleOpenCreatePost = () => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um einen Beitrag zu erstellen");
      navigate('/login');
      return;
    }
    setShowCreateModal(true);
  };

  if (!isAuthenticated && !profileLoading) {
    return (
      <div className="pt-6">
        <FeedStateRenderer
          isLoading={false}
          error={new Error("Bitte melde dich an, um Beiträge zu sehen")}
          posts={[]}
          profile={null}
          isEmpty={true}
          onLike={handleLikePost}
          onDelete={handleDeletePost}
          onComment={handleCreateComment}
          onGetComments={handleGetComments}
          onShare={handleSharePost}
          onReport={handleReportPost}
          onRetry={handleLoginRedirect}
          onLoginRedirect={handleLoginRedirect}
          isDarkMode={isDarkMode}
          showMiningRewards={false}
        />
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="pt-6">
        <FeedStateRenderer
          isLoading={true}
          error={null}
          posts={[]}
          profile={null}
          isEmpty={false}
          onLike={handleLikePost}
          onDelete={handleDeletePost}
          onComment={handleCreateComment}
          onGetComments={handleGetComments}
          onShare={handleSharePost}
          onReport={handleReportPost}
          onRetry={handleRetry}
          onLoginRedirect={handleLoginRedirect}
          isDarkMode={isDarkMode}
          showMiningRewards={false}
        />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {showHeader && (
          <FeedHeader feedType={feedType} customHeader={headerComponent} />
        )}
        
        {showCreatePostForm && (
          <CreatePostBox 
            darkMode={isDarkMode}
            onOpenCreateModal={handleOpenCreatePost}
          />
        )}
        
        <Tabs defaultValue="filters" className="w-full">
          <EnhancedFeedHeader 
            activeFeed={feedType}
            onRefresh={handleRefresh}
            isRefreshing={isLoading}
            postCount={adaptedPosts.length}
            hasNewPosts={hasNewPosts}
          />
          
          {showFilters && (
            <div className="mt-2">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {feedType === 'recent' ? 'Chronologische Reihenfolge' : 
                  feedType === 'popular' ? 'Nach Popularität sortiert' : 
                  feedType === 'following' ? 'Beiträge von Personen, denen du folgst' :
                  feedType === 'tokens' ? 'Token-bezogene Inhalte' :
                  feedType === 'nfts' ? 'NFT-bezogene Inhalte' :
                  feedType === 'foryou' ? 'Für dich personalisiert' :
                  'Alle Inhalte'}
                </div>
                <button 
                  onClick={toggleFilters}
                  className="text-sm text-primary hover:underline"
                >
                  {showFilterMenu ? 'Filter ausblenden' : 'Filter anzeigen'}
                </button>
              </div>
              
              <FeedFilterOptimized
                showFilters={showFilterMenu}
                selectedFilter={selectedFilter}
                handleFilterSelect={handleFilterSelect}
                feedType={feedType}
                lastUpdated={lastUpdated}
              />
            </div>
          )}
        </Tabs>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`feed-${feedType}-${selectedFilter}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <FeedStateRenderer
              isLoading={isLoading}
              error={error}
              posts={adaptedPosts}
              profile={profile}
              isEmpty={adaptedPosts.length === 0}
              onLike={handleLikePost}
              onDelete={handleDeletePost}
              onComment={handleCreateComment}
              onGetComments={handleGetComments}
              onShare={handleSharePost}
              onReport={handleReportPost}
              onRetry={handleRetry}
              onLoginRedirect={handleLoginRedirect}
              isDarkMode={isDarkMode}
              showMiningRewards={showMiningRewards}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <CreatePostModal
        showModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreatePost={handleCreatePost}
        darkMode={isDarkMode}
        showMiningRewards={showMiningRewards}
      />
    </TooltipProvider>
  );
};

export default UnifiedFeedContainer;
