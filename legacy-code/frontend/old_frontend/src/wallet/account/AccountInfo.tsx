
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAccount } from 'wagmi';

export const AccountInfo = () => {
  const { address, isConnected } = useAccount();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Adresse:</span>
              <span className="font-mono text-sm truncate max-w-[200px]">
                {address}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Verbinde deine Wallet, um deine Account-Informationen zu sehen.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountInfo;
