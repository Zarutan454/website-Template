
import React from 'react';
import FeedLoading from './FeedLoading';
import FeedError from './FeedError';
import { adaptPostForCardSync } from '@/utils/postAdapter';
import PostListHeader from './PostListHeader';
import PostFilters from './PostFilters';
import PostListContent from './PostListContent';
import { usePostList } from './hooks/usePostList';
import { toast } from 'sonner';
import { postRepository } from '@/repositories/PostRepository';

interface PostListProps {
  feedType?: 'foryou' | 'following' | 'recent';
}

export const PostList: React.FC<PostListProps> = ({ feedType = 'foryou' }) => {
  const {
    profile,
    isAuthenticated,
    profileLoading,
    showFilters,
    selectedFilter,
    filteredPosts,
    posts,
    adaptedPosts,
    isLoading,
    error,
    isDarkMode,
    toggleFilters,
    handleFilterSelect,
    handleLikePost,
    handleDeletePost,
    handleCreateComment,
    handleGetComments,
    handleSharePost,
    handleRetry,
    handleLoginRedirect
  } = usePostList(feedType);
  
  // Verbesserte handleReportPost-Funktion, die einen bool zurückgibt
  const handleReportPost = async (postId: string, reason: string) => {
    if (!profile) {
      toast.error("Bitte melde dich an, um Beiträge zu melden");
      return false;
    }
    
    try {
      const result = await postRepository.reportPost(profile.id, postId, reason);
      
      if (result) {
        toast.success("Deine Meldung wurde erfolgreich übermittelt. Unser Team wird den Beitrag überprüfen.");
      } else {
        toast.error("Fehler beim Melden des Beitrags.");
      }
      
      return result;
    } catch (error) {
      toast.error("Ein Fehler ist aufgetreten. Bitte versuche es später erneut.");
      return false;
    }
  };

  if (profileLoading) {
    return <FeedLoading />;
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-6">
        <FeedError 
          message="Bitte melde dich an, um Beiträge zu sehen" 
          onRetry={handleLoginRedirect} 
          retryText="Zum Login"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PostListHeader 
        toggleFilters={toggleFilters} 
        showFilters={showFilters} 
        selectedFilter={selectedFilter} 
      />
      
      <PostFilters
        showFilters={showFilters}
        selectedFilter={selectedFilter}
        handleFilterSelect={handleFilterSelect}
      />
      
      <div className="space-y-4">
        {error && error.message !== "User not authenticated" ? (
          <div className="pt-6">
            <FeedError 
              message="Beim Laden der Beiträge ist ein Fehler aufgetreten" 
              onRetry={handleRetry} 
            />
          </div>
        ) : (
          <PostListContent
            isLoading={isLoading}
            error={error}
            filteredPosts={filteredPosts}
            adaptedPosts={adaptedPosts}
            posts={posts}
            profile={profile}
            handleLikePost={handleLikePost}
            handleDeletePost={handleDeletePost}
            handleCreateComment={handleCreateComment}
            handleGetComments={handleGetComments}
            handleSharePost={handleSharePost}
            handleRetry={handleRetry}
            isDarkMode={isDarkMode}
            adaptPostForCardSync={adaptPostForCardSync}
            handleLoginRedirect={handleLoginRedirect}
            handleReportPost={handleReportPost}
          />
        )}
      </div>
    </div>
  );
};

export default PostList;
