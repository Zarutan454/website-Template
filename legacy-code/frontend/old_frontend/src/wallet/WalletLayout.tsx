
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, CreditCard, Plus, Image, Gift } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface WalletLayoutProps {
  children: React.ReactNode;
}

const WalletLayout: React.FC<WalletLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleTabChange = (value: string) => {
    navigate(`/wallet${value === 'overview' ? '' : `/${value}`}`);
  };

  const getCurrentTab = (): string => {
    if (currentPath === '/wallet') return 'overview';
    if (currentPath.includes('/wallet/tokens')) return 'tokens';
    if (currentPath.includes('/wallet/create-token')) return 'create-token';
    if (currentPath.includes('/wallet/create-nft')) return 'create-nft';
    if (currentPath.includes('/wallet/airdrops')) return 'airdrops';
    return 'overview';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">BSN Wallet</h1>
      
      <Tabs defaultValue={getCurrentTab()} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            <span className="hidden md:inline">Übersicht</span>
          </TabsTrigger>
          <TabsTrigger value="tokens" className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span className="hidden md:inline">Tokens</span>
          </TabsTrigger>
          <TabsTrigger value="create-token" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Token erstellen</span>
          </TabsTrigger>
          <TabsTrigger value="create-nft" className="flex items-center gap-1">
            <Image className="h-4 w-4" />
            <span className="hidden md:inline">NFT erstellen</span>
          </TabsTrigger>
          <TabsTrigger value="airdrops" className="flex items-center gap-1">
            <Gift className="h-4 w-4" />
            <span className="hidden md:inline">Airdrops</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={getCurrentTab()} className="mt-0">
          {children}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletLayout;
