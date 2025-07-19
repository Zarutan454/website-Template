
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/ThemeProvider.utils';
import { FeedStateRenderer } from './common';
import { useOptimizedFeed, FeedType } from '@/hooks/feed/useOptimizedFeed';
import { useEnhancedFeedActions } from '@/hooks/feed/useEnhancedFeedActions';
import { useFilterControl, UiFilterType } from '@/hooks/feed/useFilterControl';
import { Tabs } from "@/components/ui/tabs";
import VirtualizedFeed from './VirtualizedFeed';
import FeedFilterOptimized from './FeedFilterOptimized';
import EnhancedFeedHeader from './components/EnhancedFeedHeader';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { TooltipProvider } from "@/components/ui/tooltip";

interface OptimizedFeedContainerProps {
  feedType: string;
  showFilters?: boolean;
  showMiningRewards?: boolean;
  showCreatePostForm?: boolean;
  showHeader?: boolean;
  title?: string;
  description?: string;
  headerComponent?: React.ReactNode;
  enableAutoRefresh?: boolean;
}

const OptimizedFeedContainer: React.FC<OptimizedFeedContainerProps> = ({
  feedType = 'recent',
  showFilters = true,
  showMiningRewards = false,
  showCreatePostForm = false,
  showHeader = true,
  title,
  description,
  headerComponent,
  enableAutoRefresh = true
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const navigate = useNavigate();
  const [showFilterMenu, setShowFilterMenu] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { showFilterMenu: filterMenuVisible, selectedFilter, toggleFilters, handleFilterSelect } = useFilterControl();
  
  // Optimized feed hook
  const { 
    adaptedPosts,
    isLoading,
    error,
    hasNewPosts,
    setHasNewPosts,
    refreshFeed,
    fetchPosts,
    profile,
    isAuthenticated,
    profileLoading
  } = useOptimizedFeed({
    feedType: feedType as FeedType,
    enableAutoRefresh
  });
  
  const {
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost
  } = useEnhancedFeedActions({
    fetchPosts,
    showMiningRewards
  });

  const getFeedTitle = (feedType: string): string => {
    switch (feedType) {
      case 'recent': return 'Neueste Beiträge';
      case 'popular': return 'Beliebte Beiträge';
      case 'following': return 'Dein Feed';
      case 'tokens': return 'Token Feed';
      case 'nfts': return 'NFT Feed';
      case 'foryou': return 'Für dich';
      default: return 'Feed';
    }
  };
  
  const getFeedDescription = (feedType: string): string => {
    switch (feedType) {
      case 'recent': return 'Die aktuellsten Beiträge aus dem Netzwerk';
      case 'popular': return 'Die beliebtesten Beiträge im Moment';
      case 'following': return 'Beiträge von Personen, denen du folgst';
      case 'tokens': return 'Alle Beiträge rund um Krypto-Token';
      case 'nfts': return 'Entdecke NFT-bezogene Inhalte';
      case 'foryou': return 'Personalisierte Inhalte basierend auf deinen Interessen';
      default: return 'Entdecke Beiträge';
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header und Filter-Elemente */}
        {showHeader && (
          <EnhancedFeedHeader 
            activeFeed={feedType as FeedType}
            onRefresh={refreshFeed}
            isRefreshing={isLoading}
            postCount={adaptedPosts.length}
            hasNewPosts={hasNewPosts}
            title={title || getFeedTitle(feedType)}
            description={description || getFeedDescription(feedType)}
            customHeader={headerComponent}
          />
        )}
        
        {/* Filter-Kontrollen */}
        {/* Alle Filter-UI und zugehörige Buttons entfernt */}
        
        {/* Feed-Inhalt */}
        <FeedStateRenderer
          posts={adaptedPosts}
          isLoading={isLoading}
          error={error}
          isEmpty={adaptedPosts.length === 0}
          onRetry={refreshFeed}
          onLoginRedirect={() => navigate('/login')}
          profile={profile}
          isDarkMode={isDarkMode}
          showMiningRewards={showMiningRewards}
          onLike={handleLikePost}
          onDelete={handleDeletePost}
          onComment={handleCreateComment}
          onGetComments={handleGetComments}
          onShare={handleSharePost}
          onReport={handleReportPost}
        />
      </div>
    </TooltipProvider>
  );
};

export default OptimizedFeedContainer;

