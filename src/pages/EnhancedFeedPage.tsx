
import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider.utils';
import OptimizedFeedPage from '@/components/Feed/OptimizedFeedPage';
import { FeedType } from '@/hooks/feed/useFeedData';

const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  },
  exit: { opacity: 0, y: -10 }
};

const EnhancedFeed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { category } = useParams();
  
  // Route-Pfade zu Feed-Typen zuordnen
  const getFeedType = (): FeedType => {
    if (location.pathname === '/feed/popular') return 'popular';
    if (location.pathname === '/feed/following') return 'following';
    if (location.pathname === '/feed/recent') return 'recent';
    if (location.pathname === '/feed/tokens') return 'tokens';
    if (location.pathname === '/feed/nfts') return 'nfts';
    // Standard ist recent
    return 'recent';
  };
  
  // Feed-Typ ermitteln
  const feedType = getFeedType();
  
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
      default:
        return {
          title: 'Feed',
          description: 'Entdecke Beiträge'
        };
    }
  };
  
  const feedInfo = getFeedInfo();

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]" data-theme={theme}>
      <motion.div
        key={`feed-page-${feedType}`}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={fadeIn}
        className="w-full h-full container py-6"
      >
        <OptimizedFeedPage 
          feedType={feedType} 
          showFilters={true}
          showHeader={true}
          enableAutoRefresh={true}
          title={feedInfo.title}
          description={feedInfo.description}
        />
      </motion.div>
    </div>
  );
};

export default EnhancedFeed;

