
import React from 'react';
import UnifiedFeedContainer from '@/components/Feed/UnifiedFeedContainer';
import { FeedType } from '@/hooks/feed/useFeedData';

interface UnifiedFeedProps {
  feedType: FeedType;
  showFilters?: boolean;
  showHeader?: boolean;
  showMiningRewards?: boolean;
  showCreatePostForm?: boolean;
  headerComponent?: React.ReactNode;
}

/**
 * Unified Feed Component - Main entry point for all feed types
 * Uses a container + presenter pattern to separate data fetching from presentation
 */
export const UnifiedFeed: React.FC<UnifiedFeedProps> = ({
  feedType = 'recent',
  showFilters = true,
  showHeader = true,
  showMiningRewards = false,
  showCreatePostForm = true,
  headerComponent
}) => {
  return (
    <UnifiedFeedContainer
      feedType={feedType}
      showFilters={showFilters}
      showHeader={showHeader}
      showMiningRewards={showMiningRewards}
      showCreatePostForm={showCreatePostForm}
      headerComponent={headerComponent}
    />
  );
};

// Named export for better tree-shaking
export { UnifiedFeed };
