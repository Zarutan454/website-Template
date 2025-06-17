
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Wallet } from 'lucide-react';

interface ProgressDisplayProps {
  dailyProgress: number;
  dailyTokensEarned: number;
  totalEarnings: number;
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ 
  dailyProgress, 
  dailyTokensEarned,
  totalEarnings
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-sm text-gray-400">Täglicher Fortschritt</span>
          <span className="text-sm text-primary">{dailyTokensEarned.toFixed(1)} / 10 BSN</span>
        </div>
        <Progress value={dailyProgress} className="h-1.5" />
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Gesamt verdient:</span>
        <span className="text-white font-medium flex items-center">
          <Wallet className="h-3 w-3 mr-1 text-primary-400" />
          {totalEarnings.toFixed(2)} BSN
        </span>
      </div>
    </div>
  );
};

export default ProgressDisplay;
