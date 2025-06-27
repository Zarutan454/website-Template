
import React from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActivityHeaderProps {
  isMining: boolean;
  isStarting: boolean;
  onStartMining: () => Promise<boolean>;
  onStopMining: () => Promise<boolean>;
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({
  isMining,
  isStarting,
  onStartMining,
  onStopMining
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-white font-medium flex items-center">
        <Zap className="mr-2 h-5 w-5 text-primary" />
        Aktives Mining
      </h3>
      <Button 
        size="sm" 
        variant={isMining ? "destructive" : "default"}
        onClick={isMining ? onStopMining : onStartMining}
        disabled={isStarting}
      >
        {isStarting ? "Verbinde..." : (isMining ? "Mining stoppen" : "Mining starten")}
      </Button>
    </div>
  );
};

export default ActivityHeader;
