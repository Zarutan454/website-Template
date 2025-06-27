
import React from 'react';
import UnifiedFeed from '../UnifiedFeed';
import FeedLayout from '../FeedLayout';

/**
 * Displays the feed of recent posts
 */
const RecentFeed: React.FC = () => {
  return (
    <FeedLayout>
      <div className="w-full max-w-4xl mx-auto">
        <UnifiedFeed 
          feedType="recent" 
          showFilters={true}
          showMiningRewards={false}
          showHeader={true}
          enableAutoRefresh={true}
        />
      </div>
    </FeedLayout>
  );
};

export default RecentFeed;
