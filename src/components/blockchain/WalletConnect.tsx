import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import { useWeb3 } from './Web3Provider';
import { toast } from 'sonner';

const SUPPORTED_NETWORKS = {
  1: { name: 'Ethereum', icon: '🔵' },
  137: { name: 'Polygon', icon: '🟣' },
  56: { name: 'BSC', icon: '🟡' },
  42161: { name: 'Arbitrum', icon: '🔵' },
  10: { name: 'Optimism', icon: '🔴' },
};

const WalletConnect: React.FC = () => {
  const { 
    isConnected, 
    isConnecting, 
    account, 
    chainId, 
    connect, 
    disconnect, 
    switchNetwork 
  } = useWeb3();
  
  const [showNetworkSelector, setShowNetworkSelector] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleNetworkChange = async (newChainId: string) => {
    try {
      await switchNetwork(parseInt(newChainId));
      setShowNetworkSelector(false);
    } catch (error) {
      console.error('Network switch error:', error);
    }
  };

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        toast.success('Adresse kopiert!');
      } catch (error) {
        toast.error('Fehler beim Kopieren');
      }
    }
  };

  const openExplorer = () => {
    if (account && chainId) {
      const explorerUrl = getExplorerUrl(chainId, account);
      window.open(explorerUrl, '_blank');
    }
  };

  const getExplorerUrl = (chainId: number, address: string) => {
    const explorers = {
      1: `https://etherscan.io/address/${address}`,
      137: `https://polygonscan.com/address/${address}`,
      56: `https://bscscan.com/address/${address}`,
      42161: `https://arbiscan.io/address/${address}`,
      10: `https://optimistic.etherscan.io/address/${address}`,
    };
    return explorers[chainId as keyof typeof explorers] || explorers[1];
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet verbinden
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Verbinden Sie Ihre Wallet, um auf Blockchain-Features zuzugreifen.
            </p>
            
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verbinde...
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4 mr-2" />
                  MetaMask verbinden
                </>
              )}
            </Button>
            
            <div className="text-xs text-muted-foreground text-center">
              Unterstützte Wallets: MetaMask, WalletConnect
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet
          </span>
          <Badge variant="secondary" className="text-xs">
            Verbunden
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Netzwerk</span>
            <Select
              value={chainId?.toString()}
              onValueChange={handleNetworkChange}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SUPPORTED_NETWORKS).map(([id, network]) => (
                  <SelectItem key={id} value={id}>
                    <span className="flex items-center gap-2">
                      <span>{network.icon}</span>
                      {network.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Address */}
          <div className="space-y-2">
            <span className="text-sm font-medium">Adresse</span>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code className="text-sm flex-1">{formatAddress(account!)}</code>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyAddress}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openExplorer}
                  className="h-6 w-6 p-0"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              Token senden
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              NFT anzeigen
            </Button>
          </div>

          {/* Disconnect */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDisconnect}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Trennen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletConnect; 