
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

  // Feed-Typen mit Konfigurations-Metadaten
  const feedTypes = [
    { 
      id: 'recent', 
      label: 'Neueste', 
      icon: <Calendar size={16} />,
      path: '/feed/recent',
      tooltip: 'Zeigt die neuesten Beiträge'
    },
    { 
      id: 'popular', 
      label: 'Beliebt', 
      icon: <TrendingUp size={16} />,
      path: '/feed/popular',
      tooltip: 'Zeigt beliebte Beiträge'
    },
    { 
      id: 'following', 
      label: 'Mein Feed', 
      icon: <Users size={16} />,
      path: '/feed/following',
      tooltip: 'Zeigt Beiträge von Nutzern, denen du folgst'
    },
    { 
      id: 'tokens', 
      label: 'Tokens', 
      icon: <Coins size={16} />,
      path: '/feed/tokens',
      tooltip: 'Zeigt Token-bezogene Beiträge'
    },
    { 
      id: 'nfts', 
      label: 'NFTs', 
      icon: <Image size={16} />,
      path: '/feed/nfts',
      tooltip: 'Zeigt NFT-bezogene Beiträge'
    },
    { 
      id: 'foryou', 
      label: 'Für dich', 
      icon: <Zap size={16} />,
      path: '/feed/foryou',
      tooltip: 'Zeigt für dich personalisierte Beiträge'
    }
  ];

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
          <div className="flex space-x-2 flex-1 overflow-x-auto no-scrollbar">
            {feedTypes.map((feed) => (
              <Tooltip key={feed.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeFeed === feed.id ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-2 whitespace-nowrap relative"
                    onClick={() => navigate(feed.path)}
                  >
                    {feed.icon}
                    <span>{feed.label}</span>
                    {activeFeed === feed.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{feed.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          
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
