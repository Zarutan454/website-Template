
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2 } from 'lucide-react';
import { FeedType } from '@/hooks/feed/useFeedData';
import { motion, AnimatePresence } from 'framer-motion';

export interface EnhancedFeedHeaderProps {
  activeFeed: FeedType;
  onRefresh: () => void;
  isRefreshing?: boolean;
  postCount?: number;
  hasNewPosts?: boolean;
  title?: string;
  description?: string;
  customHeader?: React.ReactNode;
}

const EnhancedFeedHeader: React.FC<EnhancedFeedHeaderProps> = ({
  activeFeed,
  onRefresh,
  isRefreshing = false,
  postCount = 0,
  hasNewPosts = false,
  title,
  description,
  customHeader
}) => {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="font-medium">
          {postCount > 0 && (
            <span className="text-sm text-muted-foreground mr-2">
              {postCount} {postCount === 1 ? 'Beitrag' : 'Beiträge'}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="relative"
        >
          {isRefreshing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-1" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Aktualisieren
          
          <AnimatePresence>
            {hasNewPosts && !isRefreshing && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"
              />
            )}
          </AnimatePresence>
        </Button>
      </div>
    </div>
  );
};

export default EnhancedFeedHeader;
