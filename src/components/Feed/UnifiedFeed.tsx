import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TooltipProvider } from "@/components/ui/tooltip";
import { FeedStateRenderer } from './common';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import { FeedType } from '@/hooks/feed/useFeedData';
import FeedHeader from './components/FeedHeader';
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
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const { showFilterMenu, selectedFilter, toggleFilters, handleFilterSelect } = React.useState({ showFilterMenu: false, selectedFilter: 'all', toggleFilters: () => {}, handleFilterSelect: (filter: string) => {} });

  // Zentrale Feed-Logik: ALLE States und Handler kommen aus useUnifiedFeedState
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Lade Feed...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Feed Header */}
        {showHeader && (
          <FeedHeader
            feedType={feedType}
            showFilters={showFilters}
            showCreatePostForm={showCreatePostForm}
            onOpenCreatePost={handleOpenCreatePost}
            headerComponent={headerComponent}
          />
        )}

        {/* Filter Section entfernt */}

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
      </div>

      {/* CreatePostModal entfernt */}
    </TooltipProvider>
  );
};

export default UnifiedFeed;
