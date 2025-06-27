
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';

export const AssetList = () => {
  const { isConnected } = useAccount();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Deine Assets</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <p className="text-gray-500">Keine Assets gefunden.</p>
          </div>
        ) : (
          <p className="text-gray-500">Verbinde deine Wallet, um deine Assets zu sehen.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AssetList;
