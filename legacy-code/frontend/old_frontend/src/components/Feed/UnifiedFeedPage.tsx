
import React from 'react';
import { FeedType } from '@/hooks/feed/useFeedData';
import UnifiedFeedContainer from './UnifiedFeedContainer';
import { FeedLayout } from './FeedLayout';

interface UnifiedFeedPageProps {
  feedType: FeedType;
  showFilters?: boolean;
  showHeader?: boolean;
  enableAutoRefresh?: boolean;
  title?: string;
  description?: string;
}

/**
 * Eine vereinheitlichte Feed-Page-Komponente, die als neuer Einstiegspunkt
 * für alle Feed-Arten dient und eine verbesserte Struktur bietet.
 */
const UnifiedFeedPage: React.FC<UnifiedFeedPageProps> = ({
  feedType,
  showFilters = true,
  showHeader = true,
  enableAutoRefresh = true,
  title,
  description
}) => {
  return (
    <FeedLayout>
      <div className="w-full max-w-6xl mx-auto px-4 pb-8">
        <UnifiedFeedContainer
          feedType={feedType}
          showFilters={showFilters}
          showHeader={showHeader}
          showMiningRewards={true}
          showCreatePostForm={true}
          headerComponent={
            showHeader && (title || description) ? (
              <div className="space-y-2 mb-4">
                {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
                {description && <p className="text-muted-foreground">{description}</p>}
              </div>
            ) : null
          }
        />
      </div>
    </FeedLayout>
  );
};

export default UnifiedFeedPage;
