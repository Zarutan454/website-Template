
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface MiningProgressBarProps {
  dailyTokensEarned: number;
}

const MiningProgressBar: React.FC<MiningProgressBarProps> = ({ dailyTokensEarned }) => {
  // Berechnen des Fortschritts als Prozentsatz (maximal 10 BSN pro Tag)
  const progressPercentage = Math.min(100, (dailyTokensEarned / 10) * 100);

  return (
    <div className="p-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-400">Tägliches Mining</span>
        <span className="text-gray-400">{dailyTokensEarned.toFixed(2)}/10.0 BSN</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
};

export default MiningProgressBar;
