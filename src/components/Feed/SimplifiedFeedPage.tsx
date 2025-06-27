
import React from 'react';
import { useParams } from 'react-router-dom';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import OptimizedFeed from './OptimizedFeed';
import { FeedType } from '@/hooks/feed/useFeedData';

/**
 * Vereinfachte Feed-Seite, die die OptimizedFeed-Komponente verwendet
 */
const SimplifiedFeedPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  
  // Bestimme den Feed-Typ basierend auf dem URL-Parameter
  const getFeedType = (): FeedType => {
    if (!category) return 'recent';
    
    switch (category) {
      case 'popular':
        return 'popular';
      case 'following':
        return 'following';
      case 'tokens':
        return 'tokens';
      case 'nfts':
        return 'nfts';
      case 'recent':
        return 'recent';
      default:
        return 'recent';
    }
  };
  
  const feedType = getFeedType();
  
  return (
    <FeedLayout>
      <div className="container mx-auto px-4 py-6">
        <OptimizedFeed 
          feedType={feedType}
          showFilters={true}
          showCreatePostForm={true}
          showHeader={true}
          enableAutoRefresh={true}
          showMiningRewards={true}
        />
      </div>
    </FeedLayout>
  );
};

export default SimplifiedFeedPage;
