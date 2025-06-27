import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import { FeedType } from '@/hooks/feed/useDjangoFeed';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import CreatePostBox from './components/CreatePostBox';
import CreatePostModal from '../CreatePostModal';
import FeedHeader from './components/FeedHeader';
import FeedFilterOptimized from './FeedFilterOptimized';
import StoriesSection from '../StoriesSection';
import { toast } from 'sonner';
import PostCard from '../PostCard';
import FeedSkeletonLoader from '../FeedSkeletonLoader';
import { FeedStateRenderer } from './common';

export interface UnifiedFeedProps {
  feedType: FeedType;
  showFilters?: boolean;
  showMiningRewards?: boolean;
  showCreatePostForm?: boolean;
  showHeader?: boolean;
  showStories?: boolean;
  headerComponent?: React.ReactNode;
  enableAutoRefresh?: boolean;
}

const UnifiedFeed: React.FC<UnifiedFeedProps> = ({
  feedType,
  showFilters = true,
  showMiningRewards = false,
  showCreatePostForm = true,
  showHeader = true,
  showStories = true,
  headerComponent,
  enableAutoRefresh = true
}) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const { showFilterMenu, selectedFilter, toggleFilters, handleFilterSelect } = 
    useFilterControl(feedType === 'popular' ? 'Beliebt' : 'Neueste');
  
  const {
    adaptedPosts,
    isLoading,
    error,
    profile,
    isAuthenticated,
    profileLoading,
    isDarkMode,
    lastRefresh,
    hasNewPosts,
    handleRefresh,
    setHasNewPosts,
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost,
    handleCreatePost
  } = useUnifiedFeedState({
    feedType,
    enableAutoRefresh,
    showMiningRewards
  });
  
  const handleRetry = useCallback(() => {
    return handleRefresh();
  }, [handleRefresh]);
  
  const handleLoginRedirect = useCallback(() => {
    navigate('/login');
  }, [navigate]);
  
  const handleOpenCreatePost = useCallback(() => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um einen Beitrag zu erstellen");
      navigate('/login');
      return;
    }
    setShowCreateModal(true);
  }, [isAuthenticated, navigate]);
  
  if (!isAuthenticated && !profileLoading) {
    return (
      <div className="pt-6">
        <div className="text-red-500">Fehler: Bitte melde dich an, um Beiträge zu sehen</div>
      </div>
    );
  }
  
  if (profileLoading) {
    return (
      <div className="pt-6">
        <FeedSkeletonLoader count={3} darkMode={isDarkMode} />
      </div>
    );
  }
  
  return (
    <TooltipProvider>
      <motion.div 
        className="space-y-6 hide-scrollbar"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {showHeader && (
          <FeedHeader feedType={feedType} customHeader={headerComponent} />
        )}
        
        {showStories && isAuthenticated && (
          <div className="mb-6">
            <StoriesSection />
          </div>
        )}
        
        {showCreatePostForm && (
          <CreatePostBox 
            darkMode={isDarkMode}
            onOpenCreateModal={handleOpenCreatePost}
          />
        )}
        
        {showFilters && (
          <div className="mt-2">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-medium text-muted-foreground">
                {feedType === 'recent' ? 'Chronologische Reihenfolge' : 
                feedType === 'popular' ? 'Nach Popularität sortiert' : 
                feedType === 'following' ? 'Beiträge von Personen, denen du folgst' :
                feedType === 'tokens' ? 'Token-bezogene Inhalte' :
                feedType === 'nfts' ? 'NFT-bezogene Inhalte' :
                feedType === 'trending' ? 'Trending Inhalte' :
                'Alle Inhalte'}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={toggleFilters}
                  className="text-sm text-primary hover:underline"
                >
                  {showFilterMenu ? 'Filter ausblenden' : 'Filter anzeigen'}
                </button>
                
                {hasNewPosts && (
                  <button 
                    onClick={handleRefresh}
                    className="text-sm text-primary hover:underline"
                  >
                    Neue Beiträge anzeigen
                  </button>
                )}
              </div>
            </div>
            
            <FeedFilterOptimized
              showFilters={showFilterMenu}
              selectedFilter={selectedFilter}
              handleFilterSelect={handleFilterSelect}
              feedType={feedType}
              lastUpdated={lastRefresh}
            />
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={`feed-${feedType}-${selectedFilter}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="w-full feed-scroll-container hide-scrollbar"
          >
            <FeedStateRenderer
              isLoading={isLoading}
              error={error}
              posts={adaptedPosts}
              profile={profile}
              isEmpty={adaptedPosts.length === 0 && !isLoading}
              onLike={handleLikePost}
              onDelete={handleDeletePost}
              onComment={handleCreateComment}
              onGetComments={handleGetComments}
              onShare={handleSharePost}
              onReport={handleReportPost}
              onRetry={handleRefresh}
              onLoginRedirect={handleLoginRedirect}
              isDarkMode={isDarkMode}
              showMiningRewards={showMiningRewards}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handleCreatePost}
      />
    </TooltipProvider>
  );
};

export default UnifiedFeed;
