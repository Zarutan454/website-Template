
import React from 'react';
import { FeedType } from '@/hooks/feed/useFeedData';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeedHeaderProps {
  feedType: FeedType;
  customHeader?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  animated?: boolean;
}

const FeedHeader: React.FC<FeedHeaderProps> = ({ 
  feedType, 
  customHeader,
  title: customTitle,
  description: customDescription,
  className,
  animated = true
}) => {
  if (customHeader) {
    return <>{customHeader}</>;
  }

  const getFeedTitle = () => {
    if (customTitle) return customTitle;
    
    switch (feedType) {
      case 'recent': return 'Neueste Beiträge';
      case 'popular': return 'Beliebte Beiträge';
      case 'following': return 'Dein Feed';
      case 'tokens': return 'Token-Feed';
      case 'nfts': return 'NFT-Feed';
      case 'foryou': return 'Für dich';
      default: return 'Feed';
    }
  };
  
  const getFeedDescription = () => {
    if (customDescription) return customDescription;
    
    switch (feedType) {
      case 'recent': return 'Die aktuellsten Beiträge aus dem Netzwerk';
      case 'popular': return 'Die beliebtesten Beiträge im Moment';
      case 'following': return 'Beiträge von Personen, denen du folgst';
      case 'tokens': return 'Alle Beiträge rund um Krypto-Token';
      case 'nfts': return 'Entdecke NFT-bezogene Inhalte';
      case 'foryou': return 'Personalisierte Inhalte basierend auf deinen Interessen';
      default: return 'Entdecke Beiträge';
    }
  };

  const Content = () => (
    <div className={cn("space-y-2 mb-4", className)}>
      <h1 className="text-2xl font-bold tracking-tight">{getFeedTitle()}</h1>
      <p className="text-muted-foreground">{getFeedDescription()}</p>
    </div>
  );

  // Wir fügen Animation hinzu, können sie aber auch abschalten
  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Content />
      </motion.div>
    );
  }

  return <Content />;
};

export default FeedHeader;
