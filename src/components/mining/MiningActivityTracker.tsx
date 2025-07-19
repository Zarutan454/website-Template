import React from 'react';
import { useAuth } from '@/context/AuthContext.utils';
import { useMining } from '@/hooks/mining/useMining';
import { useLiveTokenCounter } from '@/hooks/mining/useLiveTokenCounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Hammer, Activity, Zap, Clock } from 'lucide-react';

const MiningActivityTracker: React.FC = () => {
  const { user: profile } = useAuth();
  const { 
    miningStats, 
    isLoading,
    error
  } = useMining();
  const liveTokenValue = useLiveTokenCounter();
  
  // Loading state
  if (isLoading) {
    return (
      <Card className="bg-dark-200 border-gray-800">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-8 w-1/3" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-red-900 bg-opacity-20 border-red-700">
        <CardContent className="p-4">
          <p className="text-red-400 text-sm">Error loading mining data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  const isMining = miningStats?.is_mining || false;
  const miningPower = miningStats?.mining_power || 0;
  const currentRate = miningStats?.current_rate_per_minute || 0;

  return (
    <Card className="bg-gray-800 bg-opacity-50 border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Mining Activity
        </CardTitle>
        {isMining && (
          <Badge variant="default" className="bg-green-600 animate-pulse">
            <Hammer className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isMining ? (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-400">Mining Power</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-400" />
                  {parseFloat(miningPower.toString()).toFixed(2)}x
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">Rate/Min</p>
                <p className="text-white font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3 text-blue-400" />
                  {parseFloat(currentRate.toString()).toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Accumulated Tokens</p>
              <p className="text-2xl font-bold text-green-400">
                {liveTokenValue.toFixed(3)} BSN
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-400">
                Mining automatically while you're online
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-4">
              <Hammer className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-400 text-sm mb-4">Mining is currently inactive</p>
              <p className="text-xs text-gray-500">
                Mining will start automatically when you're online
              </p>
            </div>
          </>
        )}
        
        {miningStats && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              User: {profile?.username || 'Unknown'} • 
              Streak: {miningStats.streak_days || 0} days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MiningActivityTracker;

