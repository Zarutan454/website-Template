
import React from 'react';
import UnifiedFeedContainer from '../UnifiedFeedContainer';

const FollowingFeed: React.FC = () => {
  return (
    <UnifiedFeedContainer 
      feedType="following" 
      showFilters={true}
      showMiningRewards={true}
    />
  );
};

export default FollowingFeed;
