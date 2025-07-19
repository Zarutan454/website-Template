
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider.utils';
import { FeedType } from '@/hooks/feed/useFeedData';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import { FeedStateRenderer } from './common';
import CreatePostBox from './components/CreatePostBox';
import CreatePostModal from './CreatePostModal';
import FeedHeader from './components/FeedHeader';
import FeedFilterOptimized from './FeedFilterOptimized';
import { toast } from 'sonner';

interface OptimizedFeedProps {
  feedType: FeedType;
  showFilters?: boolean;
  showCreatePostForm?: boolean;
  showHeader?: boolean;
  enableAutoRefresh?: boolean;
  showMiningRewards?: boolean;
  title?: string;
  description?: string;
}

const OptimizedFeed: React.FC<OptimizedFeedProps> = ({
  feedType,
  showFilters = true,
  showCreatePostForm = true,
  showHeader = true,
  enableAutoRefresh = true,
  showMiningRewards = false,
  title,
  description
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
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
    enableAutoRefresh
  });

  const handleRetry = () => fetchPosts(feedType);
  const handleLoginRedirect = () => navigate('/login');

  const handleOpenCreatePost = () => {
    if (!isAuthenticated) {
      toast.error("Du musst angemeldet sein, um einen Beitrag zu erstellen");
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
    <div className="space-y-4">
      {/* Feed Header */}
      {showHeader && (
        <FeedHeader
          feedType={feedType}
          showFilters={showFilters}
          showCreatePostForm={showCreatePostForm}
          onOpenCreatePost={handleOpenCreatePost}
          headerComponent={title || description ? (
            <div className="space-y-2 mb-4">
              {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          ) : null}
        />
      )}

      {/* Filter Section entfernt */}

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

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handleCreatePost}
      />
    </div>
  );
};

export default OptimizedFeed;

