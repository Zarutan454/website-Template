
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { FeedType } from '@/hooks/feed/useFeedData';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, TrendingUp, Users, Coins, Image, RefreshCw, Sparkles, Bell, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface EnhancedFeedHeaderProps {
  activeFeed: FeedType;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  postCount?: number;
  hasNewPosts?: boolean;
}

const EnhancedFeedHeader: React.FC<EnhancedFeedHeaderProps> = ({ 
  activeFeed, 
  onRefresh,
  isRefreshing = false,
  postCount = 0,
  hasNewPosts = false
}) => {
  const navigate = useNavigate();
  const [showNewPostsNotification, setShowNewPostsNotification] = useState(hasNewPosts);

  // Alle Tabs, Buttons und Filter-UI entfernt

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setShowNewPostsNotification(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto no-scrollbar pb-2">
        <div className="flex items-center justify-between mb-2">
          {/* Alle Tabs, Buttons und Filter-UI entfernt */}
          
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {showNewPostsNotification && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1.5"
                  >
                    <Bell size={14} className="animate-pulse" />
                    Neue Beiträge
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {postCount > 0 && (
              <Badge variant="outline" className="flex-shrink-0">
                <Sparkles size={12} className="mr-1" /> 
                {postCount} {postCount === 1 ? 'Beitrag' : 'Beiträge'}
              </Badge>
            )}
            
            {onRefresh && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="ml-2 flex-shrink-0"
                  >
                    <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Feed aktualisieren</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EnhancedFeedHeader;
