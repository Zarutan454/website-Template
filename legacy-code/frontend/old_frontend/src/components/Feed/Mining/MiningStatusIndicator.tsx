
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Activity, AlertTriangle, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMining } from '@/hooks/useMining';
import { cn } from '@/lib/utils';

interface MiningStatusIndicatorProps {
  // Direct state props
  isMining?: boolean;
  isMiningHealthy?: boolean;
  timeElapsed?: number;
  pendingActivities?: number;
  
  // Legacy props
  showDetailed?: boolean;
  className?: string;
}

const MiningStatusIndicator: React.FC<MiningStatusIndicatorProps> = ({
  // Accept both direct props and use hook
  isMining: isMiningProp,
  isMiningHealthy: isMiningHealthyProp,
  timeElapsed = 0,
  pendingActivities: pendingActivitiesProp,
  
  // Legacy props
  showDetailed = false,
  className
}) => {
  // Use hook for backward compatibility
  const { 
    isMining: hookIsMining, 
    isMiningHealthy: hookIsMiningHealthy, 
    pendingActivities: hookPendingActivities = 0 
  } = useMining();
  
  // Prioritize props over hook values
  const isMining = isMiningProp !== undefined ? isMiningProp : hookIsMining;
  const isMiningHealthy = isMiningHealthyProp !== undefined ? isMiningHealthyProp : hookIsMiningHealthy;
  const pendingActivities = pendingActivitiesProp !== undefined ? pendingActivitiesProp : hookPendingActivities;

  // Support old behavior where component wouldn't render if mining is inactive
  if (!isMining && !showDetailed) {
    return null;
  }
  
  // If mining is inactive but we want to show it (showDetailed is true)
  if (!isMining) {
    return (
      <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 flex items-center">
        <Clock className="h-3 w-3 mr-1" />
        Inaktiv
      </Badge>
    );
  }

  // Format elapsed time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // If showDetailed is true, use the more detailed UI
  if (showDetailed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn(
              "inline-flex items-center gap-1.5 py-1 px-2 rounded-full text-xs font-medium",
              isMiningHealthy 
                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/20",
              className
            )}>
              {isMiningHealthy ? (
                <>
                  <Zap className="h-3.5 w-3.5 animate-pulse" />
                  <span>Mining aktiv</span>
                  {pendingActivities > 0 && (
                    <span className="bg-green-500 text-white rounded-full px-1.5 text-xs">
                      {pendingActivities}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Synchronisiere...</span>
                </>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="space-y-2 p-1">
              <p className="font-semibold">
                {isMiningHealthy ? "Mining ist aktiv" : "Mining-Status wird synchronisiert"}
              </p>
              {pendingActivities > 0 && (
                <p className="text-xs text-gray-400">
                  <Activity className="inline h-3 w-3 mr-1" />
                  {pendingActivities} Aktivitäten in Verarbeitung
                </p>
              )}
              <p className="text-xs text-gray-400">
                <Clock className="inline h-3 w-3 mr-1" />
                Belohnungen werden automatisch gutgeschrieben
              </p>
              {timeElapsed > 0 && (
                <p className="text-xs text-gray-400">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Laufzeit: {formatTime(timeElapsed)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Simple indicator when not showing detailed view
  if (!isMiningHealthy) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="destructive" className="flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Warnung
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Mining-Status ungesund. Synchronisiere...</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Badge variant="success" className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 flex items-center">
      <Activity className="h-3 w-3 mr-1" />
      Aktiv {timeElapsed > 0 && `• ${formatTime(timeElapsed)}`}
    </Badge>
  );
};

export default MiningStatusIndicator;
