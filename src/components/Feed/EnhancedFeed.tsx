import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useFeedData';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import { FeedStateRenderer } from './common';
import FacebookCreatePostBox from './FacebookCreatePostBox';
import StoryList from '@/components/Stories/StoryList';

const EnhancedFeed: React.FC = () => {
  console.log('MOUNT EnhancedFeed');
  const navigate = useNavigate();
  const feed = useUnifiedFeedState({ feedType: 'recent' });
  const filterControl = useFilterControl();

  // NEU: Globales Feed-Refresh-Event abfangen
  useEffect(() => {
    const handleRefreshFeed = () => {
      feed.handleRefresh();
    };
    window.addEventListener('refreshFeed', handleRefreshFeed);
    return () => window.removeEventListener('refreshFeed', handleRefreshFeed);
  }, [feed]);

  return (
    <div>
      {/* Entferne FacebookCreatePostBox und StoryList aus dem Render-Teil */}
      {/* Nur noch FeedStateRenderer bleibt im Render-Tree */}
      <FeedStateRenderer
        isLoading={feed.isLoading}
        error={feed.error}
        posts={feed.adaptedPosts}
        profile={feed.profile}
        isEmpty={feed.adaptedPosts.length === 0}
        onGetComments={feed.handleGetComments}
        onRetry={feed.handleRefresh}
        onLoginRedirect={() => navigate('/login')}
        isDarkMode={feed.isDarkMode}
        showMiningRewards={false}
      />
    </div>
  );
};

export default EnhancedFeed;
