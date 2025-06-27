
import React from 'react';
import { Helmet } from 'react-helmet';
import { TokenCreationProvider } from '@/components/TokenCreation/context/TokenCreationContext';
import TokenCreationPage from '@/components/TokenCreation/TokenCreationPage';
import { Card, CardContent } from '@/components/ui/card';
import { useAccount } from 'wagmi';
import WalletConnectPrompt from '@/components/wallet/WalletConnectPrompt';

const CreateToken: React.FC = () => {
  const { isConnected } = useAccount();
  
  // If wallet not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Token erstellen</h1>
        
        <Card>
          <CardContent className="p-6">
            <WalletConnectPrompt 
              message="Bitte verbinde deine Wallet, um einen Token zu erstellen." 
            />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>Token erstellen | BSN</title>
      </Helmet>
      
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <h1 className="text-2xl font-bold mb-6">Token erstellen</h1>
        
        <Card>
          <CardContent className="p-0">
            <TokenCreationProvider>
              <TokenCreationPage />
            </TokenCreationProvider>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CreateToken;
