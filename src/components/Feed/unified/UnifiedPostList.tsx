
import React from 'react';
import { FeedStateRenderer, FeedFilterSection } from '../common';
import PostListHeader from '../PostListHeader';
import { useFeedData, FeedType } from '@/hooks/feed/useFeedData';
import { useFeedActions } from '@/hooks/feed/useFeedActions';
import { useFilterControl } from '@/hooks/feed/useFilterControl';
import { useTheme } from '@/components/ThemeProvider';
import { useNavigate } from 'react-router-dom';
import { Tabs } from "@/components/ui/tabs";

interface UnifiedPostListProps {
  feedType?: FeedType;
  showFilters?: boolean;
  showHeader?: boolean;
  showMiningRewards?: boolean;
  enableAutoRefresh?: boolean;
}

/**
 * Einheitliche Komponente zum Anzeigen von Beiträgen mit Filtern und Aktionen
 */
const UnifiedPostList: React.FC<UnifiedPostListProps> = ({ 
  feedType = 'recent',
  showFilters = true,
  showHeader = true,
  showMiningRewards = false,
  enableAutoRefresh = true
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDarkMode = theme === 'dark';
  
  // Setup filter controls
  const { showFilterMenu, selectedFilter, toggleFilters, handleFilterSelect } = useFilterControl();
  
  // Setup feed data
  const { 
    adaptedPosts, 
    isLoading, 
    error, 
    fetchPosts, 
    profileLoading, 
    isAuthenticated, 
    profile,
    likePost,
    deletePost,
    createComment,
    getPostComments,
    sharePost
  } = useFeedData({ feedType, selectedFilter, enableAutoRefresh });
  
  // Setup feed actions with all required properties
  const {
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleReportPost
  } = useFeedActions({ 
    fetchPosts, 
    likePost, 
    deletePost, 
    createComment, 
    getPostComments, 
    sharePost,
    feedType
  });
  
  // Handle retry loading posts
  const handleRetry = () => fetchPosts();
  
  // Handle login redirect
  const handleLoginRedirect = () => navigate('/login');
  
  // Check if user is not authenticated
  if (!isAuthenticated && !profileLoading) {
    return (
      <div className="pt-6">
        <FeedStateRenderer
          isLoading={false}
          error={new Error("Bitte melde dich an, um Beiträge zu sehen")}
          posts={[]}
          profile={null}
          isEmpty={true}
          onLike={handleLikePost}
          onDelete={handleDeletePost}
          onComment={handleCreateComment}
          onGetComments={handleGetComments}
          onShare={handleSharePost}
          onReport={handleReportPost}
          onRetry={handleLoginRedirect}
          onLoginRedirect={handleLoginRedirect}
          isDarkMode={isDarkMode}
          showMiningRewards={showMiningRewards}
        />
      </div>
    );
  }
  
  // Check if profile is still loading
  if (profileLoading) {
    return (
      <div className="pt-6">
        <FeedStateRenderer
          isLoading={true}
          error={null}
          posts={[]}
          profile={null}
          isEmpty={false}
          onLike={handleLikePost}
          onDelete={handleDeletePost}
          onComment={handleCreateComment}
          onGetComments={handleGetComments}
          onShare={handleSharePost}
          onReport={handleReportPost}
          onRetry={handleRetry}
          onLoginRedirect={handleLoginRedirect}
          isDarkMode={isDarkMode}
          showMiningRewards={showMiningRewards}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {showHeader && (
        <Tabs defaultValue="filters" className="w-full">
          <PostListHeader 
            toggleFilters={toggleFilters} 
            showFilters={showFilterMenu} 
            selectedFilter={selectedFilter} 
          />
          
          {showFilters && (
            <FeedFilterSection
              showFilters={showFilterMenu}
              selectedFilter={selectedFilter}
              handleFilterSelect={handleFilterSelect}
              feedType={feedType}
            />
          )}
        </Tabs>
      )}
      
      <FeedStateRenderer
        isLoading={isLoading}
        error={error}
        posts={adaptedPosts}
        profile={profile}
        isEmpty={adaptedPosts.length === 0}
        onLike={handleLikePost}
        onDelete={handleDeletePost}
        onComment={handleCreateComment}
        onGetComments={handleGetComments}
        onShare={handleSharePost}
        onReport={handleReportPost}
        onRetry={handleRetry}
        onLoginRedirect={handleLoginRedirect}
        isDarkMode={isDarkMode}
        showMiningRewards={showMiningRewards}
      />
    </div>
  );
};

export default UnifiedPostList;
