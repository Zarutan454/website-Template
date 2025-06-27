
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';

export const NftCreator = () => {
  const { isConnected } = useAccount();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>NFT erstellen</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <p className="text-gray-500">NFT-Erstellung ist in Vorbereitung...</p>
          </div>
        ) : (
          <p className="text-gray-500">Verbinde deine Wallet, um NFTs zu erstellen.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default NftCreator;
