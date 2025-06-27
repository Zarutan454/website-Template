
import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { ConnectWalletButton } from '@/wallet/auth/ConnectWalletButton';
import WalletLayout from '@/wallet/WalletLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import WalletBalance from '@/components/wallet/WalletBalance';
import { TransactionHistoryView } from '@/components/wallet/TransactionHistoryView';
import WalletOverview from '@/components/wallet/WalletOverview';
import { useWallet } from '@/hooks/useWallet';
import AssetList from '@/components/wallet/AssetList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Repeat, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Wallet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { 
    balances, 
    transactions, 
    totalValueUsd, 
    sendTokens, 
    isLoading, 
    transactionsLoading 
  } = useWallet();
  
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showSendForm, setShowSendForm] = useState<boolean>(false);
  const [sendAmount, setSendAmount] = useState<string>('');
  const [sendAddress, setSendAddress] = useState<string>('');
  const [sendToken, setSendToken] = useState<string>('');

  // Haupttoken für die Übersicht
  const mainToken = balances.find(token => token.token_symbol === 'BSN') || {
    token_id: 'bsn',
    token_name: 'BSN Token',
    token_symbol: 'BSN',
    balance: 0
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendAmount || !sendAddress || !sendToken) {
      toast.error('Bitte fülle alle Felder aus');
      return;
    }
    
    const success = await sendTokens(
      sendAddress,
      sendToken,
      parseFloat(sendAmount)
    );
    
    if (success) {
      setShowSendForm(false);
      setSendAmount('');
      setSendAddress('');
      setSendToken('');
    }
  };

  const handleReceive = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Wallet-Adresse in die Zwischenablage kopiert');
    }
  };

  const handleBuy = () => {
    toast.info('Kaufen-Funktion wird in Kürze verfügbar sein');
  };

  const handleSwap = () => {
    toast.info('Tauschen-Funktion wird in Kürze verfügbar sein');
  };

  // Konvertiere die Wallet-Daten in das Format, das AssetList erwartet
  const assetList = balances.map(token => ({
    id: token.token_id,
    name: token.token_name,
    symbol: token.token_symbol,
    balance: token.balance,
    value: token.value_usd || 0,
    address: token.contract_address || '0x0000000000000000000000000000000000000000',
    network: {
      name: 'Ethereum',
      icon: '/icons/ethereum.svg',
      explorerUrl: 'https://etherscan.io'
    }
  }));

  return (
    <WalletLayout>
      {isConnected ? (
        <div className="space-y-6">
          {/* Übersicht mit Haupttoken und Aktionsbuttons */}
          <WalletOverview
            totalBalance={totalValueUsd}
            mainToken={{
              symbol: mainToken.token_symbol,
              balance: mainToken.balance,
              name: mainToken.token_name
            }}
            onSend={() => setShowSendForm(true)}
            onReceive={handleReceive}
            onSwap={handleSwap}
            onBuy={handleBuy}
          />
          
          {/* Formular zum Senden von Tokens anzeigen, wenn Button geklickt wurde */}
          {showSendForm && (
            <Card className="bg-dark-200 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Token senden</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSend} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Token auswählen</label>
                    <select 
                      className="w-full p-2 rounded-md bg-dark-300 border border-gray-700"
                      value={sendToken}
                      onChange={(e) => setSendToken(e.target.value)}
                      required
                    >
                      <option value="">Token auswählen</option>
                      {balances.map(token => (
                        <option key={token.token_id} value={token.token_id}>
                          {token.token_symbol} ({token.balance})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Empfänger-Adresse</label>
                    <input 
                      type="text"
                      className="w-full p-2 rounded-md bg-dark-300 border border-gray-700"
                      placeholder="0x..."
                      value={sendAddress}
                      onChange={(e) => setSendAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Betrag</label>
                    <input 
                      type="number"
                      className="w-full p-2 rounded-md bg-dark-300 border border-gray-700"
                      placeholder="0.00"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      min="0.000001"
                      step="0.000001"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={() => setShowSendForm(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button type="submit">
                      <ArrowUpRight className="h-4 w-4 mr-2" />
                      Senden
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Tabs für verschiedene Ansichten */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="overview">Übersicht</TabsTrigger>
              <TabsTrigger value="assets">Assets</TabsTrigger>
              <TabsTrigger value="history">Transaktionen</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Wallet Balance Komponente einbinden */}
                <WalletBalance />
                
                {/* Aktionen */}
                <Card className="bg-dark-200 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Schnellaktionen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        className="flex items-center justify-center gap-2 py-6"
                        onClick={() => setShowSendForm(true)}
                      >
                        <ArrowUpRight className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span>Senden</span>
                          <span className="text-xs text-muted-foreground">Tokens übertragen</span>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex items-center justify-center gap-2 py-6"
                        onClick={handleReceive}
                      >
                        <ArrowDownLeft className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span>Empfangen</span>
                          <span className="text-xs text-muted-foreground">Adresse kopieren</span>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline"
                        className="flex items-center justify-center gap-2 py-6"
                        onClick={handleSwap}
                      >
                        <Repeat className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span>Tauschen</span>
                          <span className="text-xs text-muted-foreground">Tokens tauschen</span>
                        </div>
                      </Button>
                      
                      <Button
                        variant="secondary" 
                        className="flex items-center justify-center gap-2 py-6"
                        onClick={handleBuy}
                      >
                        <AlertCircle className="h-5 w-5" />
                        <div className="flex flex-col items-start">
                          <span>Support</span>
                          <span className="text-xs text-muted-foreground">Hilfe erhalten</span>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="assets">
              <AssetList assets={assetList} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="history">
              <TransactionHistoryView />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Verbinde deine Wallet</h2>
            <p className="text-gray-500 max-w-md mb-6">
              Verbinde deine Wallet, um deine BSN-Token zu verwalten, 
              neue Token und NFTs zu erstellen und an Airdrops teilzunehmen.
            </p>
            <ConnectWalletButton size="lg" />
          </div>
        </div>
      )}
    </WalletLayout>
  );
};

export default Wallet;
