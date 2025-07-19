
import React from 'react';
import { FeedStateRenderer, FeedFilterSection } from '../common';
import { FeedType } from '@/hooks/feed/useFeedData';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import { useTheme } from '@/components/ThemeProvider.utils';
import { useNavigate } from 'react-router-dom';
import { Tabs } from "@/components/ui/tabs";

interface UnifiedPostListProps {
  feedType?: FeedType;
  showFilters?: boolean;
  showHeader?: boolean;
  showMiningRewards?: boolean;
  enableAutoRefresh?: boolean;
}

const UnifiedPostList: React.FC<UnifiedPostListProps> = ({ 
  feedType = 'recent',
  showFilters = true,
  showHeader = true,
  showMiningRewards = false,
  enableAutoRefresh = true
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme === 'dark';
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
    </div>
  );
};

export default UnifiedPostList;

