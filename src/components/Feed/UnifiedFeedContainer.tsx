import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider';
import { FeedStateRenderer } from './common';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import { FeedType } from '@/hooks/feed/useFeedData';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import { TooltipProvider } from "@/components/ui/tooltip";
import FeedHeader from './components/FeedHeader';
import CreatePostBox from './components/CreatePostBox';
import CreatePostModal from './CreatePostModal';

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

  // Zentrale Feed-Logik: ALLE States und Handler kommen aus useUnifiedFeedState
  const {
    profile,
    isAuthenticated,
    profileLoading,
    adaptedPosts,
    isLoading,
    error,
    isDarkMode: feedDarkMode,
    lastRefresh,
    hasNewPosts,
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

  const handleOpenCreatePost = useCallback(() => {
    if (!isAuthenticated) {
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

        {/* Feed Content */}
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
      </div>
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handleCreatePost}
      />
    </TooltipProvider>
  );
};

export default UnifiedFeedContainer;
