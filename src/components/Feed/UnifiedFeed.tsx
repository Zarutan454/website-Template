import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from "@/components/ui/tooltip";
import { FeedStateRenderer } from './common';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import { FeedType } from '@/hooks/feed/useFeedData';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import CreatePostBox from './components/CreatePostBox';
import CreatePostModal from './CreatePostModal';
import FeedHeader from './components/FeedHeader';
import FeedFilterOptimized from './FeedFilterOptimized';
import { toast } from 'sonner';

export interface UnifiedFeedProps {
  feedType: FeedType;
  showFilters?: boolean;
  showMiningRewards?: boolean;
  showCreatePostForm?: boolean;
  showHeader?: boolean;
  headerComponent?: React.ReactNode;
  enableAutoRefresh?: boolean; // Property to control auto refresh functionality
}

const UnifiedFeed: React.FC<UnifiedFeedProps> = ({
  feedType,
  showFilters = true,
  showMiningRewards = false,
  showCreatePostForm = true,
  showHeader = true,
  headerComponent,
  enableAutoRefresh = true
}) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showFilterMenu, selectedFilter, toggleFilters, handleFilterSelect } = useFilterControl();

  const { 
    profile,
    isAuthenticated,
    profileLoading,
    adaptedPosts, 
    isLoading, 
    error,
    isDarkMode,
    lastRefresh,
    hasNewPosts,
    showMiningRewards: miningRewardsEnabled,
    handleRefresh,
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost,
    handleCreatePost,
    fetchPosts
  } = useUnifiedFeedState({ 
    feedType, 
    showMiningRewards,
    enableAutoRefresh: true
  });

  const handleRetry = () => fetchPosts(feedType);
  const handleLoginRedirect = () => navigate('/login');

  const handleOpenCreatePost = () => {
    if (!isAuthenticated) {
      toast.error("Bitte melde dich an, um einen Beitrag zu erstellen");
      navigate('/login');
      return;
    }
    setShowCreateModal(true);
  };

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
              showMiningRewards={miningRewardsEnabled}
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
