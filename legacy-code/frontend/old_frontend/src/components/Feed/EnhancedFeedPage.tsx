
import React from 'react';
import { useUnifiedFeedState } from '@/hooks/feed/useUnifiedFeedState';
import VirtualizedFeedList from './OptimizedFeed/VirtualizedFeedList';
import FeedHeaderWithActions from './FeedHeaderWithActions';
import CreatePostBox from './CreatePostBox';
import { useInitializeAchievements } from '@/hooks/mining/useInitializeAchievements';
import { FeedType } from '@/hooks/feed/useFeedData';
import { type CreatePostData } from '@/types/posts';

interface EnhancedFeedPageProps {
  feedType?: FeedType;
  userId?: string;
  showMiningRewards?: boolean;
}

const EnhancedFeedPage: React.FC<EnhancedFeedPageProps> = ({
  feedType = 'recent', // Geändert von 'main' zu 'recent', um FeedType zu entsprechen
  userId,
  showMiningRewards = true
}) => {
  // Initialize achievements for this user session
  useInitializeAchievements();
  
  const {
    profile,
    isAuthenticated,
    adaptedPosts,
    isLoading,
    error,
    isDarkMode,
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
    setHasNewPosts
  } = useUnifiedFeedState({ 
    feedType, 
    showMiningRewards,
    enableAutoRefresh: true
  });

  // Create a wrapper function that adapts the handleCreatePost to accept CreatePostData
  const createPost = (postData: CreatePostData) => {
    if (postData && postData.content) {
      return handleCreatePost(postData.content);
    }
    return Promise.resolve(false);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Feed Header with refresh button */}
      <FeedHeaderWithActions
        onRefresh={handleRefresh}
        activeFeed={feedType}
        onCreatePost={() => {}} // Add required prop
      />
      
      {/* Create Post Box */}
      {isAuthenticated && (
        <div className="mb-4">
          <CreatePostBox 
            onCreatePost={createPost}
            darkMode={isDarkMode}
            initialContent=""
          />
        </div>
      )}

      {/* Main Feed Content */}
      <VirtualizedFeedList
        posts={adaptedPosts}
        isLoading={isLoading}
        hasMore={true}
        onLoadMore={handleRefresh}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
        onComment={handleCreateComment}
        onGetComments={handleGetComments}
        onShare={handleSharePost}
        onReport={handleReportPost}
        showMiningRewards={showMiningRewards}
        currentUser={profile}
        error={error}
        onRetry={handleRefresh}
      />
    </div>
  );
};

export default EnhancedFeedPage;
