
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useFeedData';
import OptimizedFeed from './OptimizedFeed';

interface OptimizedFeedPageProps {
  feedType?: FeedType;
  showFilters?: boolean;
  showHeader?: boolean;
  enableAutoRefresh?: boolean;
  title?: string;
  description?: string;
}

/**
 * Eine vereinfachte und optimierte Feed-Page-Komponente, die als Einstiegspunkt
 * für verschiedene Feed-Typen dient
 */
const OptimizedFeedPage: React.FC<OptimizedFeedPageProps> = ({
  feedType: propsFeedType,
  showFilters = true,
  showHeader = true,
  enableAutoRefresh = true,
  title,
  description
}) => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  
  // Bestimme den Feed-Typ aus URL und Props
  const getFeedType = (): FeedType => {
    // Priorisiere den explizit übergebenen Feed-Typ
    if (propsFeedType) return propsFeedType;
    
    // Bestimme Feed-Typ aus der URL, wenn kein expliziter Typ übergeben wurde
    if (category) {
      switch (category) {
        case 'popular': return 'popular';
        case 'following': return 'following';
        case 'tokens': return 'tokens';
        case 'nfts': return 'nfts';
        case 'recent': return 'recent';
        default: return 'recent';
      }
    }
    
    // Bestimme Feed-Typ aus dem vollständigen Pfad, falls nötig
    const path = location.pathname;
    if (path === '/feed/popular') return 'popular';
    if (path === '/feed/following') return 'following';
    if (path === '/feed/tokens') return 'tokens';
    if (path === '/feed/nfts') return 'nfts';
    
    // Standard ist 'recent'
    return 'recent';
  };
  
  const feedType = getFeedType();
  
  // Generiere Feed-Titel und Beschreibung basierend auf dem Feed-Typ
  const getFeedTitle = () => {
    if (title) return title;
    
    switch (feedType) {
      case 'recent': return 'Neueste Beiträge';
      case 'popular': return 'Beliebte Beiträge';
      case 'following': return 'Dein Feed';
      case 'tokens': return 'Token-Feed';
      case 'nfts': return 'NFT-Feed';
      default: return 'Feed';
    }
  };
  
  const getFeedDescription = () => {
    if (description) return description;
    
    switch (feedType) {
      case 'recent': return 'Die aktuellsten Beiträge aus dem Netzwerk';
      case 'popular': return 'Die beliebtesten Beiträge im Moment';
      case 'following': return 'Beiträge von Personen, denen du folgst';
      case 'tokens': return 'Alle Beiträge rund um Krypto-Token';
      case 'nfts': return 'Entdecke NFT-bezogene Inhalte';
      default: return 'Entdecke Beiträge';
    }
  };

  return (
    <div className="container py-8">
      <OptimizedFeed 
        feedType={feedType}
        showFilters={showFilters}
        showCreatePostForm={true}
        showHeader={showHeader}
        enableAutoRefresh={enableAutoRefresh}
        showMiningRewards={true}
        title={getFeedTitle()}
        description={getFeedDescription()}
      />
    </div>
  );
};

export default OptimizedFeedPage;
