
import React, { useState, useEffect } from 'react';
import { useTokenLocking } from '@/hooks/useTokenLocking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TokenLocksList from './TokenLocksList';
import LiquidityLocksList from './LiquidityLocksList';

interface ActiveLocksListProps {
  tokenId: string;
  type?: 'token' | 'liquidity' | 'all';
}

export const ActiveLocksList = ({ tokenId, type = 'all' }: ActiveLocksListProps) => {
  const [activeTab, setActiveTab] = useState<string>(type === 'token' ? 'token' : type === 'liquidity' ? 'liquidity' : 'token');
  const { fetchTokenLocks, fetchLiquidityLocks } = useTokenLocking();
  const [tokenLocks, setTokenLocks] = useState([]);
  const [liquidityLocks, setLiquidityLocks] = useState([]);
  const [isLoadingTokenLocks, setIsLoadingTokenLocks] = useState(false);
  const [isLoadingLiquidityLocks, setIsLoadingLiquidityLocks] = useState(false);

  useEffect(() => {
    const loadLocks = async () => {
      if (type === 'token' || type === 'all') {
        setIsLoadingTokenLocks(true);
        const locks = await fetchTokenLocks(tokenId);
        setTokenLocks(locks);
        setIsLoadingTokenLocks(false);
      }
      
      if (type === 'liquidity' || type === 'all') {
        setIsLoadingLiquidityLocks(true);
        const locks = await fetchLiquidityLocks(tokenId);
        setLiquidityLocks(locks);
        setIsLoadingLiquidityLocks(false);
      }
    };
    
    loadLocks();
  }, [tokenId, type, fetchTokenLocks, fetchLiquidityLocks]);

  // Wenn der Typ nicht 'all' ist, zeige nur die entsprechende Liste
  if (type !== 'all') {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {type === 'token' ? 'Token Locks' : 'Liquiditäts-Locks'}
        </h3>
        {type === 'token' ? (
          <TokenLocksList locks={tokenLocks} isLoading={isLoadingTokenLocks} />
        ) : (
          <LiquidityLocksList locks={liquidityLocks} isLoading={isLoadingLiquidityLocks} />
        )}
      </div>
    );
  }

  // Andernfalls zeige Tabs mit beiden Listen
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktive Locks</CardTitle>
        <CardDescription>
          Liste aller aktiven Locks für diesen Token
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="token">Token Locks</TabsTrigger>
            <TabsTrigger value="liquidity">Liquiditäts-Locks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="token" className="mt-0">
            <TokenLocksList locks={tokenLocks} isLoading={isLoadingTokenLocks} />
          </TabsContent>
          
          <TabsContent value="liquidity" className="mt-0">
            <LiquidityLocksList locks={liquidityLocks} isLoading={isLoadingLiquidityLocks} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ActiveLocksList;
