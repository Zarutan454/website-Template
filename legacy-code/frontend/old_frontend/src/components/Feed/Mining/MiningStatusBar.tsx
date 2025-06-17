
import React from 'react';
import { Hammer, Activity, Clock } from 'lucide-react';
import { formatTimeElapsed } from '@/utils/timeUtils';

export interface MiningStatusBarProps {
  isMining: boolean;
  isMiningHealthy: boolean;
  timeElapsed: number;
  isTogglingMining?: boolean;
  handleMiningToggle?: () => Promise<void> | void;
}

export const MiningStatusBar: React.FC<MiningStatusBarProps> = ({
  isMining,
  isMiningHealthy,
  timeElapsed,
  isTogglingMining,
  handleMiningToggle
}) => {
  return (
    <div className={`p-3 flex items-center justify-between ${isMining ? (isMiningHealthy ? 'bg-green-900/20' : 'bg-amber-900/20') : 'bg-gray-800/50'}`}>
      <div className="flex items-center gap-2">
        {isMining ? (
          <>
            <Hammer className={`h-4 w-4 ${isMiningHealthy ? 'text-green-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={`text-sm ${isMiningHealthy ? 'text-green-400' : 'text-amber-400'}`}>
              {isMiningHealthy ? 'Mining aktiv' : 'Mining ungesund'}
            </span>
          </>
        ) : (
          <>
            <Activity className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">Mining inaktiv</span>
          </>
        )}
      </div>
      
      {isMining && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="h-3 w-3" />
          <span>{formatTimeElapsed(timeElapsed)}</span>
        </div>
      )}
    </div>
  );
};

export default MiningStatusBar;
