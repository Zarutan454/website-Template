
import React from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { timeAgo } from '@/utils/timeAgo';

interface MiningSummaryProps {
  miningStats: {
    totalPoints: number;
    totalTokensEarned: number;
    dailyPoints: number;
    dailyTokensEarned: number;
    lastActivityAt: Date;
  };
  isMining: boolean;
  miningRate: number;
}

const MiningSummary: React.FC<MiningSummaryProps> = ({
  miningStats,
  isMining,
  miningRate
}) => {
  const lastActivity = timeAgo(miningStats.lastActivityAt);

  return (
    <div className="p-3 text-sm space-y-2">
      <div className="flex justify-between">
        <div className="text-gray-400">Letzte Aktivität:</div>
        <div className="text-gray-300">{lastActivity}</div>
      </div>
      
      <div className="flex justify-between">
        <div className="text-gray-400">Heute verdient:</div>
        <div className="text-primary">{miningStats.dailyTokensEarned.toFixed(2)} BSN</div>
      </div>
      
      <div className="flex justify-between">
        <div className="text-gray-400">Insgesamt verdient:</div>
        <div className="text-white">{miningStats.totalTokensEarned.toFixed(2)} BSN</div>
      </div>
      
      {isMining && (
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-800">
          <div className="flex items-center text-green-500">
            <TrendingUp className="h-3 w-3 mr-1" />
            <span className="text-xs">Mining-Rate:</span>
          </div>
          <div className="text-green-500">{miningRate.toFixed(2)} BSN/h</div>
        </div>
      )}
    </div>
  );
};

export default MiningSummary;
