
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMining } from '@/hooks/useMining';
import { formatNumber } from '@/utils/formatters';
import { Gem, ArrowUpRight, Wallet } from 'lucide-react';

interface TokenBalanceProps {
  miningRate: number;
  isLoading: boolean;
  showWalletButton?: boolean;
  speedBoost?: number;
  effectiveRate?: number;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ 
  miningRate, 
  isLoading,
  showWalletButton = true,
  speedBoost = 0,
  effectiveRate
}) => {
  const { miningStats } = useMining();
  const actualEffectiveRate = effectiveRate || miningRate;
  const [liveBalance, setLiveBalance] = useState<number>(0);
  
  // Initialize the balance
  useEffect(() => {
    if (!isLoading && miningStats) {
      setLiveBalance(miningStats.total_tokens_earned || 0);
    }
  }, [isLoading, miningStats]);
  
  // Update the balance in real time if mining is active
  useEffect(() => {
    if (actualEffectiveRate <= 0) return;
    
    const interval = setInterval(() => {
      setLiveBalance(prev => {
        const increase = actualEffectiveRate / 3600; // Convert per hour to per second
        return prev + increase;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [actualEffectiveRate]);
  
  if (isLoading) {
    return (
      <Card className="border border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center text-lg">
            <Skeleton className="h-6 w-6 mr-2 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-24" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="border border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800 overflow-hidden relative">
      {/* Glowing effect for active mining */}
      {miningRate > 0 && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 animate-pulse"></div>
      )}
      
      <CardHeader className="pb-2 relative z-10">
        <CardTitle className="flex items-center text-lg">
          <Gem className="h-5 w-5 mr-2 text-primary-400" />
          BSN Token Balance
        </CardTitle>
        <CardDescription>
          Your mined tokens
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold text-white">
              {formatNumber(liveBalance, 2)}
              <span className="ml-1 text-lg font-normal text-gray-400">BSN</span>
            </div>
            
            {actualEffectiveRate > 0 && (
              <div className="space-y-1">
                <div className="text-xs text-green-400 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  +{formatNumber(actualEffectiveRate, 2)} BSN/hour
                </div>
                {speedBoost > 0 && (
                  <div className="text-xs text-blue-400 flex items-center">
                    <Gem className="h-3 w-3 mr-1" />
                    Speed Boost: +{speedBoost}%
                  </div>
                )}
              </div>
            )}
          </div>
          
          {showWalletButton && (
            <Button size="sm" variant="outline" className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5" />
              <span>Claim</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenBalance;
