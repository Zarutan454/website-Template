
import React from 'react';
import UnifiedFeedContainer from '../UnifiedFeedContainer';

const PopularFeed: React.FC = () => {
  return (
    <UnifiedFeedContainer 
      feedType="popular" 
      showFilters={true}
      showMiningRewards={true}
    />
  );
};

export default PopularFeed;
