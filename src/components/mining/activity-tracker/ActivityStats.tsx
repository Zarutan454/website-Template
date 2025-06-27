
import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ActivityType } from '@/hooks/mining/types';

interface ActivityStatsProps {
  getRemainingCount: (type: string) => number;
  isActivityLimitReached: (type: string) => boolean;
  MINING_LIMITS: Record<string, any>;
}

const ActivityStats: React.FC<ActivityStatsProps> = ({
  getRemainingCount,
  isActivityLimitReached,
  MINING_LIMITS
}) => {
  const renderActivityStat = (type: string, label: string) => {
    const remaining = getRemainingCount(type as ActivityType);
    const isLimited = isActivityLimitReached(type as ActivityType);
    
    const limit = MINING_LIMITS[type];
    let limitCount = 10;
    
    if (limit && typeof limit === 'object' && 'count' in limit) {
      limitCount = limit.count;
    }
    
    return (
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-400">{label}:</span>
        <div className="flex items-center">
          <span className={isLimited ? "text-gray-500" : "text-primary"}>{remaining}/{limitCount}</span>
          {isLimited && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 ml-1 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Belohnungslimit für heute erreicht</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-dark-200 rounded-lg p-3 space-y-1.5">
      <h4 className="text-sm font-medium text-gray-300 mb-2">Verbleibende Belohnungen heute:</h4>
      {renderActivityStat('post', 'Beiträge')}
      {renderActivityStat('comment', 'Kommentare')}
      {renderActivityStat('like', 'Likes')}
      {renderActivityStat('share', 'Geteilt')}
      {renderActivityStat('invite', 'Einladungen')}
    </div>
  );
};

export default ActivityStats;
