
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { RefreshCw, Loader2, Bell, BellOff, Sparkles, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface SimplifiedFeedHeaderProps {
  title: string;
  isDarkMode: boolean;
  isRefreshing: boolean;
  isSubscribed: boolean;
  postCount?: number;
  onRefresh: () => void;
  onToggleSubscribe: () => void;
}

/**
 * Enhanced header component for SimplifiedFeed with responsive design,
 * animated elements, improved tooltips, and enhanced accessibility
 */
const SimplifiedFeedHeader: React.FC<SimplifiedFeedHeaderProps> = ({
  title,
  isDarkMode,
  isRefreshing,
  isSubscribed,
  postCount,
  onRefresh,
  onToggleSubscribe
}) => {
  const [showDetailedCount, setShowDetailedCount] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Format post count for compact display
  const formatPostCount = () => {
    if (!postCount && postCount !== 0) return '0';
    if (postCount > 1000000) return `${(postCount / 1000000).toFixed(1)}M`;
    if (postCount > 1000) return `${(postCount / 1000).toFixed(1)}K`;
    return postCount.toString();
  };
  
  // Handle refresh with time tracking
  const handleRefresh = () => {
    setLastRefreshTime(new Date());
    onRefresh();
  };
  
  // Format time since last refresh
  const getTimeSinceRefresh = () => {
    if (!lastRefreshTime) return '';
    
    const seconds = Math.floor((new Date().getTime() - lastRefreshTime.getTime()) / 1000);
    
    if (seconds < 60) return `vor ${seconds} Sekunden`;
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Minuten`;
    return `vor ${Math.floor(seconds / 3600)} Stunden`;
  };

  return (
    <Card className={`w-full mb-4 ${isDarkMode ? 'bg-dark-100 border-gray-800' : 'bg-white'}`}>
      <CardHeader className="px-4 py-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center group">
            {title}
            <AnimatePresence>
              {postCount !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="ml-2"
                >
                  <Badge 
                    variant="outline" 
                    className="flex items-center gap-1 group-hover:bg-primary/10 transition-colors cursor-pointer"
                    aria-label={`${postCount} ${postCount === 1 ? 'Beitrag' : 'Beiträge'}`}
                    onClick={() => setShowDetailedCount(!showDetailedCount)}
                  >
                    <motion.div
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                    >
                      <Sparkles size={12} className="text-amber-500" /> 
                    </motion.div>
                    {formatPostCount()}
                    {postCount > 10 && (
                      <motion.div
                        animate={{ y: [0, -2, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        {showDetailedCount ? 
                          <ChevronUp size={12} className="ml-1 opacity-70" /> : 
                          <ChevronDown size={12} className="ml-1 opacity-70" />
                        }
                      </motion.div>
                    )}
                  </Badge>
                  
                  <AnimatePresence>
                    {showDetailedCount && postCount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -5 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="absolute mt-1 bg-background border rounded-md shadow-md p-2 text-xs z-20"
                      >
                        <div className="font-medium mb-1 text-center border-b pb-1">Beitragsstatistik</div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <span className="text-muted-foreground">Gesamt:</span>
                          <span className="font-medium">{postCount.toLocaleString()}</span>
                          <span className="text-muted-foreground">Pro Tag:</span>
                          <span className="font-medium">~{Math.round(postCount / 30).toLocaleString()}</span>
                          {lastRefreshTime && (
                            <>
                              <span className="text-muted-foreground">Aktualisiert:</span>
                              <span className="font-medium">{getTimeSinceRefresh()}</span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </CardTitle>
          <TooltipProvider delayDuration={300}>
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onToggleSubscribe}
                    className={`hidden sm:flex transition-colors ${isSubscribed ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                    aria-pressed={isSubscribed}
                    aria-label={isSubscribed ? "Benachrichtigungen deaktivieren" : "Benachrichtigungen aktivieren"}
                  >
                    <motion.div
                      animate={isSubscribed ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
                      transition={{ duration: 0.4, repeat: 0 }}
                    >
                      {isSubscribed ? (
                        <BellOff className="h-4 w-4 mr-1" />
                      ) : (
                        <Bell className="h-4 w-4 mr-1" />
                      )}
                    </motion.div>
                    <span className="hidden md:inline">{isSubscribed ? "Abbestellen" : "Abonnieren"}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-popover text-popover-foreground">
                  <div className="text-sm">
                    <p className="font-medium">{isSubscribed ? "Benachrichtigungen deaktivieren" : "Benachrichtigungen aktivieren"}</p>
                    <p className="text-xs text-muted-foreground">{isSubscribed ? "Keine Updates mehr erhalten" : "Erhalte Updates bei neuen Beiträgen"}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="relative transition-all hover:shadow-md focus:ring-2 focus:ring-primary/20 focus:outline-none"
                    aria-label="Feed aktualisieren"
                    aria-busy={isRefreshing}
                  >
                    {isRefreshing ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                      </motion.div>
                    )}
                    <span className="hidden md:inline">Aktualisieren</span>
                    
                    {/* Enhanced ripple effect with color transition */}
                    <AnimatePresence>
                      {isRefreshing && (
                        <motion.span
                          initial={{ width: 0, height: 0, opacity: 0.7 }}
                          animate={{ 
                            width: [0, 100], 
                            height: [0, 100], 
                            opacity: [0.5, 0]
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ 
                            duration: 0.8, 
                            times: [0, 1]
                          }}
                          className="absolute rounded-full bg-gradient-to-r from-primary/30 to-primary/10"
                          style={{ 
                            left: '50%', 
                            top: '50%', 
                            transform: 'translate(-50%, -50%)' 
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-popover text-popover-foreground">
                  <div className="text-sm">
                    <p className="font-medium">Feed aktualisieren</p>
                    <p className="text-xs text-muted-foreground">Nach neuen Beiträgen suchen</p>
                    {lastRefreshTime && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Zuletzt aktualisiert: {getTimeSinceRefresh()}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </CardHeader>
    </Card>
  );
};

export default SimplifiedFeedHeader;
