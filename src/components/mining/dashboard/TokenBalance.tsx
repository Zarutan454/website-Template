import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useMining } from '@/hooks/mining/useMining';
import { useLiveTokenCounter } from '@/hooks/mining/useLiveTokenCounter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gem } from 'lucide-react';

const TokenBalance: React.FC = () => {
  const { miningStats, isLoading } = useMining();
  const liveTokenValue = useLiveTokenCounter();

  if (isLoading && !miningStats) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-200 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-300">
          Accumulated Tokens
        </CardTitle>
        <Gem className="h-4 w-4 text-primary-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">
          {liveTokenValue.toFixed(3)}
          <span className="ml-2 text-base font-normal text-gray-400">BSN</span>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Total Mined: {parseFloat(miningStats?.accumulated_tokens?.toString() || '0').toFixed(3)}
        </p>
      </CardContent>
    </Card>
  );
};

export default TokenBalance; 