
import React from 'react';
import { useParams } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useFeedData';
import SimplifiedFeedContainer from '@/components/Feed/SimplifiedFeedContainer';

/**
 * Vereinfachte Feed-Seite mit klarer Struktur und reduzierten Abhängigkeiten
 */
const SimplifiedFeedPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  
  const getFeedTypeFromCategory = (): FeedType => {
    switch (category) {
      case 'popular': return 'popular';
      case 'following': return 'following';
      case 'tokens': return 'tokens';
      case 'nfts': return 'nfts';
      default: return 'recent';
    }
  };
  
  const feedType = getFeedTypeFromCategory();

  return (
    <div className="container py-8">
      <SimplifiedFeedContainer 
        feedType={feedType}
        showFilters={true}
        showMiningRewards={false}
        showCreateBox={true}
        showHeader={true}
      />
    </div>
  );
};

export default SimplifiedFeedPage;
