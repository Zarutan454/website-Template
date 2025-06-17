
import React from 'react';
import { FeedType } from '@/hooks/feed/useFeedData';

interface FeedHeaderProps {
  feedType: FeedType;
  customHeader?: React.ReactNode;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ feedType, customHeader }) => {
  if (customHeader) {
    return <>{customHeader}</>;
  }
  
  const getFeedTitle = () => {
    switch (feedType) {
      case 'recent':
        return 'Neueste Beiträge';
      case 'popular':
        return 'Beliebte Beiträge';
      case 'following':
        return 'Dein Feed';
      case 'tokens':
        return 'Token-Feed';
      case 'nfts':
        return 'NFT-Feed';
      case 'foryou':
        return 'Für dich';
      default:
        return 'Feed';
    }
  };
  
  const getFeedDescription = () => {
    switch (feedType) {
      case 'recent':
        return 'Die aktuellsten Beiträge aus dem Netzwerk';
      case 'popular':
        return 'Die beliebtesten Beiträge im Moment';
      case 'following':
        return 'Beiträge von Personen, denen du folgst';
      case 'tokens':
        return 'Alle Beiträge rund um Krypto-Token';
      case 'nfts':
        return 'Entdecke NFT-bezogene Inhalte';
      case 'foryou':
        return 'Personalisierte Inhalte basierend auf deinen Interessen';
      default:
        return 'Entdecke Beiträge';
    }
  };
  
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{getFeedTitle()}</h1>
      <p className="text-muted-foreground">{getFeedDescription()}</p>
    </div>
  );
};

export default FeedHeader;
