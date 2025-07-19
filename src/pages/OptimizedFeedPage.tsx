import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { FeedType } from '@/hooks/feed/useFeedData';
import OptimizedFeedContainer from '@/components/Feed/OptimizedFeed/OptimizedFeedContainer';
import CreatePostModal from '@/components/Feed/CreatePostModal';
import { useTheme } from '@/components/ThemeProvider.utils';
import { usePosts } from '@/hooks/usePosts';
import { toast } from 'sonner';
import FeedHeaderWithActions from '@/components/Feed/FeedHeaderWithActions';
import { motion } from 'framer-motion';

/**
 * Optimierte Feed-Seite mit verbesserter Performance und Benutzererfahrung
 */
const OptimizedFeedPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { createPost, fetchPosts } = usePosts();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const getFeedTypeFromPath = (): FeedType => {
    const path = location.pathname;
    if (path.includes('/feed/popular')) return 'popular';
    if (path.includes('/feed/following')) return 'following';
    if (path.includes('/feed/tokens')) return 'tokens';
    if (path.includes('/feed/nfts')) return 'nfts';
    if (path.includes('/feed/foryou')) return 'foryou';
    return 'recent';
  };
  
  const feedType = category as FeedType || getFeedTypeFromPath();
  
  // Feed-Titel und Beschreibung basierend auf dem Feed-Typ
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
  
  const handleOpenCreatePost = () => {
    setShowCreateModal(true);
  };
  
  const handleCreatePost = async (content: string) => {
    if (!content.trim()) return false;
    
    try {
      const result = await createPost({
        content,
        media_url: null,
        media_type: null
      });
      
      if (result.success) {
        await fetchPosts(feedType);
        return true;
      }
      
      return false;
    } catch (error) {
      toast.error("Fehler beim Erstellen des Beitrags");
      return false;
    }
  };
  
  return (
    <FeedLayout>
      <motion.div 
        className="w-full max-w-6xl mx-auto px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <FeedHeaderWithActions onCreatePost={handleOpenCreatePost} />
        </div>
        
        <OptimizedFeedContainer
          feedType={feedType}
          showFilters={true}
          showMiningRewards={true}
          showCreateBox={false} // Wir verwenden bereits FeedHeaderWithActions
          title={feedInfo.title}
          description={feedInfo.description}
          onOpenCreateModal={handleOpenCreatePost}
        />
        
        <CreatePostModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={handleCreatePost}
        />
      </motion.div>
    </FeedLayout>
  );
};

export default OptimizedFeedPage;

