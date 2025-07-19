import React, { useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useDjangoFeed';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import EnhancedFeed from '@/components/Feed/EnhancedFeed';
import CreatePostBox from '@/components/Feed/CreatePostBox';
import { useTheme } from '@/components/ThemeProvider.utils';
import { useDjangoFeed } from '@/hooks/feed/useDjangoFeed';
import FeedHeaderWithActions from '@/components/Feed/FeedHeaderWithActions';
import StoryList from '@/components/Stories/StoryList';
import { toast } from 'sonner';
import { CreatePostData } from '@/types/posts';
import djangoApi from '../lib/django-api-new';
import type { Comment as ApiComment } from '../lib/django-api-new';
import { PostCard } from '@/components/Feed/PostCard';
import { CreatePost } from '@/components/Feed/CreatePost';

/**
 * Main entry point for the Feed section of the application.
 * Uses the EnhancedFeed component with UnifiedPostCard for full functionality.
 */
const Feed: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [isUploading, setIsUploading] = useState(false);
  
  const getFeedTypeFromPath = (): FeedType => {
    const path = location.pathname;
    if (path === '/feed/popular') return 'popular';
    if (path === '/feed/recent') return 'recent';
    if (path === '/feed/following') return 'following';
    if (path === '/feed/tokens') return 'tokens';
    if (path === '/feed/nfts') return 'nfts';
    if (path === '/feed/foryou') return 'recent'; // Map foryou to recent for now
    return 'recent';
  };
  
  const feedType: FeedType = category as FeedType || getFeedTypeFromPath();
  
  const { 
    posts, 
    isLoading, 
    error, 
    fetchPosts,
    commentPost,
    hasMore,
    loadMore,
  } = useDjangoFeed({
    feedType,
  });
  
  const getFeedInfo = () => {
    switch (feedType) {
      case 'recent':
        return {
          title: 'Neueste Beiträge',
          description: 'Die aktuellsten Beiträge aus dem Netzwerk'
        };
      case 'popular':
        return {
          title: 'Beliebte Beiträge',
          description: 'Die beliebtesten Beiträge im Moment'
        };
      case 'following':
        return {
          title: 'Dein Feed',
          description: 'Beiträge von Personen, denen du folgst'
        };
      case 'tokens':
        return {
          title: 'Token-Feed',
          description: 'Alle Beiträge rund um Krypto-Token'
        };
      case 'nfts':
        return {
          title: 'NFT-Feed',
          description: 'Entdecke NFT-bezogene Inhalte'
        };
      default:
        return {
          title: 'Feed',
          description: 'Entdecke Beiträge'
        };
    }
  };
  
  const feedInfo = getFeedInfo();
  
  const handleCreatePost = useCallback(async (postData: CreatePostData) => {
    setIsUploading(true);
    toast.info('Dein Beitrag wird veröffentlicht...');

    try {
      const response = await djangoApi.createPost(postData);

      if (response) {
        toast.success('Beitrag erfolgreich veröffentlicht!');
        await fetchPosts(); // Feed neu laden, um den neuen Beitrag anzuzeigen
        return { success: true };
      } else {
        toast.error('Der Beitrag konnte nicht erstellt werden.');
        return { success: false };
      }
    } catch (error) {
      console.error('Ein unerwarteter Fehler ist aufgetreten:', error);
      toast.error('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  }, [fetchPosts]);
  
  const handleCommentPost = async (postId: string, content: string): Promise<ApiComment | null> => {
    const response = await commentPost(postId, content);
    if (response && response.data) {
      // Optional: Update post state locally if needed
      return response.data;
    }
    return null;
  };

  const handleRefreshFeed = useCallback(async () => {
    try {
      await fetchPosts();
      toast.success("Feed aktualisiert");
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Feeds:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  }, [fetchPosts]);

  return (
    <FeedLayout>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 hide-scrollbar overflow-hidden">
        <div className="mb-6">
          <FeedHeaderWithActions 
            onRefresh={handleRefreshFeed}
            activeFeed={feedType}
          />
        </div>
        
        <EnhancedFeed 
          posts={posts}
          isLoading={isLoading}
          error={error}
          hasMore={hasMore}
          loadMore={loadMore}
          showMiningRewards={true}
          initialFilterType="all"
          initialSortType="newest"
          onComment={handleCommentPost}
          onRetry={handleRefreshFeed}
        />
        
      </div>
    </FeedLayout>
  );
};

export default Feed;
