import React from 'react';
import { useMining } from '@/hooks/mining/useMining';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Zap, X, Hourglass, Gem } from 'lucide-react';
import { useLiveTokenCounter } from '@/hooks/mining/useLiveTokenCounter';
import { useAuth } from '@/context/AuthContext.utils';

const MiningWidget: React.FC = () => {
  const { user } = useAuth();
  const { isMining } = useMining();
  const liveTokenValue = useLiveTokenCounter();
  const { theme } = useTheme();
  if (!user) return null;

  return (
    <div className="p-4 bg-dark-200 rounded-lg border border-gray-800" data-theme={theme}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Gem className="text-primary-400" />
          <h3 className="text-lg font-bold text-white">Mining Status</h3>
        </div>
        <div className={`text-sm font-semibold ${isMining ? 'text-green-400' : 'text-gray-400'}`}>
          {isMining ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      <div className="space-y-2 text-center">
        <p className="text-xs text-gray-500">Accumulated</p>
        <p className="text-2xl font-bold text-white">
          {liveTokenValue.toFixed(3) || '0.000'} <span className="text-base font-normal text-gray-400">BSN</span>
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          {isMining 
            ? "Mining automatically while you're online" 
            : "Mining will start automatically when you're online"
          }
        </p>
      </div>
    </div>
  );
};

export default MiningWidget;

