
import React, { useState, useEffect } from 'react';
import { useMining } from '@/hooks/useMining';
import { useTheme } from '@/components/ThemeProvider';
import { toast } from 'sonner';
import {
  MiningProgressBar,
  MiningSummary,
  MiningFooterLink,
  MiningLoadingState,
  MiningControlSection
} from './Mining';

interface MiningWidgetProps {
  closePopover?: () => void;
}

const MiningWidget: React.FC<MiningWidgetProps> = ({ closePopover }) => {
  const { 
    miningStats, 
    isMining, 
    isMiningHealthy,
    isLoading,
    startMining, 
    stopMining, 
    recordActivity,
    syncMiningState,
    miningRate,
  } = useMining();
  const { theme } = useTheme();
  const [isPerformingAction, setIsPerformingAction] = useState<string | null>(null);
  const [lastActionTime, setLastActionTime] = useState<Date | null>(null);
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [syncAttempted, setSyncAttempted] = useState(false);
  const [isTogglingMining, setIsTogglingMining] = useState(false);

  useEffect(() => {
    if (syncMiningState) {
      syncMiningState().then(status => {
      });
    }
  }, [syncMiningState]);

  useEffect(() => {
    if (!isMining || !lastActionTime) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - lastActionTime.getTime()) / 1000);
      setTimeElapsed(elapsed);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isMining, lastActionTime]);

  useEffect(() => {
    if (isMining && !lastActionTime) {
      setLastActionTime(new Date());
    }
    
    if (!isMining) {
      setLastActionTime(null);
      setTimeElapsed(0);
    }
  }, [isMining, lastActionTime]);

  useEffect(() => {
    if (isMining && !isMiningHealthy && !syncAttempted) {
      syncMiningState?.().then((success) => {
        setSyncAttempted(true);
        if (success) {
          toast.info('Mining-Status wurde synchronisiert');
        }
      });
    }
  }, [isMining, isMiningHealthy, syncMiningState, syncAttempted]);

  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (syncMiningState) {
        syncMiningState().then(status => {
        });
      }
    }, 45000); // Sync every 45 seconds
    
    return () => clearInterval(syncInterval);
  }, [syncMiningState]);

  const handleMiningToggle = async () => {
    if (isTogglingMining) return;
    
    try {
      setIsTogglingMining(true);
      
      if (isMining) {
        const result = await stopMining();
        if (result) {
          toast.success("Mining gestoppt");
        } else {
          toast.error("Fehler beim Stoppen des Minings");
        }
        setSyncAttempted(false);
      } else {
        const result = await startMining();
        if (result) {
          setLastActionTime(new Date());
          toast.success("Mining gestartet");
        } else {
          toast.error("Fehler beim Starten des Minings");
        }
        setSyncAttempted(false);
      }
      
      // Re-sync after toggle
      if (syncMiningState) {
        await syncMiningState();
      }
    } catch (error) {
      toast.error("Fehler beim Umschalten des Mining-Status");
    } finally {
      setIsTogglingMining(false);
    }
  };

  if (isLoading) {
    return <MiningLoadingState />;
  }
  
  const mappedStats = {
    totalPoints: miningStats.total_points || 0,
    totalTokensEarned: miningStats.total_tokens_earned || 0,
    dailyPoints: miningStats.daily_points || 0,
    dailyTokensEarned: miningStats.daily_tokens_earned || 0,
    lastActivityAt: typeof miningStats.last_activity_at === 'string' 
      ? new Date(miningStats.last_activity_at)
      : (miningStats.last_activity_at || new Date())
  };
  
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-800">
      <MiningControlSection 
        isMining={isMining}
        isMiningHealthy={isMiningHealthy}
        timeElapsed={timeElapsed}
        handleMiningToggle={handleMiningToggle}
        isTogglingMining={isTogglingMining}
      />
      
      <MiningProgressBar dailyTokensEarned={mappedStats.dailyTokensEarned} />
      
      <MiningSummary 
        miningStats={mappedStats} 
        isMining={isMining} 
        miningRate={miningRate} 
      />
      
      <MiningFooterLink onClose={closePopover} />
    </div>
  );
};

export default MiningWidget;
