
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import TokenLockForm from './TokenLockForm';
import LPTokenLockForm from './LPTokenLockForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LockKeyhole } from 'lucide-react';
import { ActiveLocksList } from './lock/ActiveLocksList';
import { Button } from '@/components/ui/button';

interface TokenLockTabsProps {
  tokenId: string;
  contractAddress?: string;
  onSuccess?: () => void;
}

const TokenLockTabs: React.FC<TokenLockTabsProps> = ({ tokenId, contractAddress, onSuccess }) => {
  const [activeTab, setActiveTab] = useState<'lock' | 'view'>('lock');
  const [lockType, setLockType] = useState<'token' | 'liquidity'>('token');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <CardTitle>Token Locker</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === 'lock' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveTab('lock')}
            >
              <LockKeyhole className="h-4 w-4 mr-2" />
              Lock erstellen
            </Button>
            <Button 
              variant={activeTab === 'view' ? "default" : "outline"} 
              size="sm" 
              onClick={() => setActiveTab('view')}
            >
              Meine Locks
            </Button>
          </div>
        </div>
        <CardDescription>
          Lock deine Tokens und LP-Tokens, um Vertrauen bei deinen Investoren aufzubauen
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeTab === 'lock' ? (
          <Tabs defaultValue={lockType} onValueChange={(value) => setLockType(value as 'token' | 'liquidity')} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="token">Token Lock</TabsTrigger>
              <TabsTrigger value="liquidity">Liquidity Lock</TabsTrigger>
            </TabsList>
            
            <TabsContent value="token" className="mt-0">
              <TokenLockForm tokenId={tokenId} onSuccess={() => {
                onSuccess?.();
                setActiveTab('view');
              }} />
            </TabsContent>
            
            <TabsContent value="liquidity" className="mt-0">
              <LPTokenLockForm tokenId={tokenId} onSuccess={() => {
                onSuccess?.();
                setActiveTab('view');
              }} />
            </TabsContent>
          </Tabs>
        ) : (
          <ActiveLocksList tokenId={tokenId} />
        )}
      </CardContent>
    </Card>
  );
};

export default TokenLockTabs;
