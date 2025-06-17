import React, { useState, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useFeedData';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { UnifiedFeed, CreatePostModal } from '@/components/Feed/unified';
import { useTheme } from '@/components/ThemeProvider';
import { usePosts } from '@/hooks/usePosts';
import FeedHeaderWithActions from '@/components/Feed/FeedHeaderWithActions';
import { toast } from 'sonner';

/**
 * Main entry point for the Feed section of the application.
 * Uses the unified feed component for better maintainability.
 */
const Feed: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { createPost, fetchPosts } = usePosts();
  
  const getFeedTypeFromPath = (): FeedType => {
    const path = location.pathname;
    if (path === '/feed/popular') return 'popular';
    if (path === '/feed/recent') return 'recent';
    if (path === '/feed/following') return 'following';
    if (path === '/feed/tokens') return 'tokens';
    if (path === '/feed/nfts') return 'nfts';
    if (path === '/feed/foryou') return 'foryou';
    return 'recent';
  };
  
  const feedType: FeedType = category as FeedType || getFeedTypeFromPath();
  
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
      case 'foryou':
        return {
          title: 'Für dich',
          description: 'Personalisierte Inhalte basierend auf deinen Interessen'
        };
      default:
        return {
          title: 'Feed',
          description: 'Entdecke Beiträge'
        };
    }
  };
  
  const feedInfo = getFeedInfo();
  
  const handleOpenCreatePost = useCallback(() => {
    setShowCreateModal(true);
  }, []);
  
  const handleCreatePost = useCallback(async (content: string, mediaUrl?: string | null, mediaType?: string | null) => {
    if (!content.trim() && !mediaUrl) return false;
    
    try {
      const result = await createPost({
        content,
        media_url: mediaUrl || undefined,
        media_type: mediaType || undefined
      });
      
      if (result.success) {
        await fetchPosts(feedType);
        return true;
      }
      
      return false;
    } catch (error) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
      return false;
    }
  }, [createPost, fetchPosts, feedType]);
  
  const handleRefreshFeed = useCallback(async () => {
    try {
      await fetchPosts(feedType);
      toast.success("Feed aktualisiert");
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Feeds:", error);
      toast.error("Fehler beim Aktualisieren");
    }
  }, [fetchPosts, feedType]);

  return (
    <FeedLayout>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 hide-scrollbar overflow-hidden">
        <div className="mb-6">
          <FeedHeaderWithActions 
            onCreatePost={handleOpenCreatePost} 
            onRefresh={handleRefreshFeed}
            activeFeed={feedType}
          />
        </div>
        
        <UnifiedFeed 
          feedType={feedType}
          showFilters={true}
          showHeader={false} // We're using FeedHeaderWithActions, so disable standard header
          showMiningRewards={true}
          showCreatePostForm={false} // We're already using CreatePostBoxLight above
        />
        
        <CreatePostModal
          showModal={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreatePost={handleCreatePost}
          darkMode={isDarkMode}
          showMiningRewards={true}
        />
      </div>
    </FeedLayout>
  );
};

export default Feed;
