
import React from 'react';
import { Loader2, Play, Square, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatElapsedTime } from '@/utils/formatters';

interface MiningControlsProps {
  isMining: boolean;
  isMiningHealthy: boolean;
  timeElapsed: number;
  onToggleMining: () => Promise<void>;
  isProcessing: boolean;
}

const MiningControls: React.FC<MiningControlsProps> = ({
  isMining,
  isMiningHealthy,
  timeElapsed,
  onToggleMining,
  isProcessing
}) => {
  return (
    <div className="flex items-center space-x-4">
      <Button
        variant={isMining ? "destructive" : "default"}
        size="sm"
        className="flex items-center space-x-2"
        onClick={onToggleMining}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : isMining ? (
          <Square className="h-4 w-4 mr-2" />
        ) : (
          <Play className="h-4 w-4 mr-2" />
        )}
        <span>
          {isProcessing 
            ? "Wird verarbeitet..." 
            : isMining 
              ? "Mining stoppen" 
              : "Mining starten"}
        </span>
      </Button>
      
      {isMining && (
        <div className="flex items-center">
          <span className="text-sm font-mono">
            {formatElapsedTime(timeElapsed)}
          </span>
          
          {!isMiningHealthy && (
            <AlertCircle 
              className="ml-2 h-4 w-4 text-amber-500" 
              aria-label="Mining-Status möglicherweise nicht synchronisiert"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MiningControls;
