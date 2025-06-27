
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MiningStatusBar } from './Mining/MiningStatusBar';

interface MiningControlSectionProps {
  isMining: boolean;
  isMiningHealthy: boolean;
  timeElapsed: number;
  handleMiningToggle: () => Promise<void> | void;
  isTogglingMining: boolean;
}

const MiningControlSection: React.FC<MiningControlSectionProps> = ({
  isMining,
  isMiningHealthy,
  timeElapsed,
  handleMiningToggle,
  isTogglingMining
}) => {
  return (
    <div className="mining-control-section">
      <MiningStatusBar 
        isMining={isMining}
        isMiningHealthy={isMiningHealthy}
        timeElapsed={timeElapsed}
      />

      <div className="flex justify-center mt-4 mb-2">
        <Button
          onClick={handleMiningToggle}
          disabled={isTogglingMining}
          variant={isMining ? "destructive" : "default"}
          className="w-full max-w-xs"
        >
          {isTogglingMining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isMining ? "Stoppe Mining..." : "Starte Mining..."}
            </>
          ) : (
            isMining ? "Mining stoppen" : "Mining starten"
          )}
        </Button>
      </div>
    </div>
  );
};

export default MiningControlSection;
