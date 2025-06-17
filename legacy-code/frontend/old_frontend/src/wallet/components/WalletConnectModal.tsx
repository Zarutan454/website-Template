import React, { useState, useEffect } from 'react';
import { useConnect, useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Wallet, AlertCircle, Check, ChevronRight, Shield, Globe, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preferredNetwork?: number; // Chain ID of preferred network
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preferredNetwork
}) => {
  const { connect, connectors, isLoading, error } = useConnect();
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();
  const [activeTab, setActiveTab] = useState<string>('connect');
  const [connectionSuccess, setConnectionSuccess] = useState<boolean>(false);
  
  useEffect(() => {
    if (isOpen) {
      setConnectionSuccess(false);
      setActiveTab('connect');
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isConnected && preferredNetwork && chain?.id !== preferredNetwork) {
      setActiveTab('network');
    } else if (isConnected && connectionSuccess) {
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    }
  }, [isConnected, chain?.id, preferredNetwork, connectionSuccess]);

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      setConnectionSuccess(true);
      
      if (!preferredNetwork || chain?.id === preferredNetwork) {
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1500);
      }
    } catch (err) {
    }
  };
  
  const handleSwitchNetwork = async (chainId: number) => {
    if (switchNetwork) {
      try {
        await switchNetwork(chainId);
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1500);
      } catch (err) {
      }
    }
  };
  
  const getPreferredNetworkName = () => {
    if (!preferredNetwork) return null;
    const network = chains.find(c => c.id === preferredNetwork);
    return network?.name || 'Bevorzugtes Netzwerk';
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet verbinden
          </DialogTitle>
          <DialogDescription>
            Verbinde deine Wallet, um auf alle Funktionen von BSN Network zuzugreifen.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="connect" disabled={activeTab === 'network'}>
              Verbinden
            </TabsTrigger>
            <TabsTrigger value="network" disabled={!isConnected || activeTab === 'connect'}>
              Netzwerk
            </TabsTrigger>
          </TabsList>
          
          <AnimatePresence mode="wait">
            <TabsContent value="connect" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-2"
                  >
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{error.message}</p>
                  </motion.div>
                )}
                
                {connectionSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-6 space-y-4"
                  >
                    <div className="rounded-full bg-green-100 p-3">
                      <Check className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-medium text-center">Wallet verbunden!</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      {preferredNetwork && chain?.id !== preferredNetwork 
                        ? 'Bitte wechsle zum bevorzugten Netzwerk...' 
                        : 'Du wirst weitergeleitet...'}
                    </p>
                    <LoadingSpinner size="sm" />
                  </motion.div>
                ) : (
                  <div className="grid gap-3">
                    {connectors.map((connector, index) => (
                      <motion.div
                        key={connector.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Button
                          onClick={() => handleConnect(connector)}
                          disabled={!connector.ready || isLoading}
                          variant="outline"
                          className="flex justify-between items-center h-14 px-4 w-full hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {connector.id.toLowerCase().includes('metamask') ? (
                              <img src="/images/metamask-logo.png" alt="MetaMask" className="h-6 w-6" />
                            ) : connector.id.toLowerCase().includes('coinbase') ? (
                              <img src="/images/coinbase-logo.png" alt="Coinbase" className="h-6 w-6" />
                            ) : connector.id.toLowerCase().includes('walletconnect') ? (
                              <img src="/images/walletconnect-logo.png" alt="WalletConnect" className="h-6 w-6" />
                            ) : (
                              <Wallet className="h-6 w-6 text-primary" />
                            )}
                            <div className="text-left">
                              <p className="font-medium">
                                {connector.id.charAt(0).toUpperCase() + connector.id.slice(1)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {connector.id.toLowerCase().includes('metamask') 
                                  ? 'Verbinde mit der MetaMask Browser-Erweiterung' 
                                  : connector.id.toLowerCase().includes('coinbase')
                                  ? 'Verbinde mit der Coinbase Wallet'
                                  : connector.id.toLowerCase().includes('walletconnect')
                                  ? 'Verbinde mit WalletConnect'
                                  : 'Verbinde mit deiner Wallet'}
                              </p>
                            </div>
                          </div>
                          {isLoading && connector.id === 'injected' ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Deine Wallet-Daten werden sicher übertragen und niemals gespeichert.
                  </p>
                </div>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="network" className="mt-0">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {preferredNetwork && (
                  <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Netzwerkwechsel erforderlich</p>
                      <p className="text-xs">
                        Bitte wechsle zu {getPreferredNetworkName()} für die beste Erfahrung.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Verfügbare Netzwerke</h3>
                  <div className="grid gap-2">
                    {chains.map((network, index) => (
                      <motion.div
                        key={network.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Button
                          onClick={() => handleSwitchNetwork(network.id)}
                          disabled={chain?.id === network.id}
                          variant={preferredNetwork === network.id ? "default" : "outline"}
                          className="flex justify-between items-center h-12 px-4 w-full"
                        >
                          <div className="flex items-center gap-3">
                            <Globe className="h-5 w-5 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{network.name}</p>
                              <p className="text-xs text-muted-foreground">Chain ID: {network.id}</p>
                            </div>
                          </div>
                          {chain?.id === network.id ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Ein Netzwerkwechsel erfordert eine Bestätigung in deiner Wallet.
                  </p>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
        
        <Separator className="my-2" />
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <p className="text-xs text-muted-foreground text-center sm:text-left mb-4 sm:mb-0">
            Durch das Verbinden stimmst du den <a href="/terms" className="text-primary hover:underline">Nutzungsbedingungen</a> und <a href="/privacy" className="text-primary hover:underline">Datenschutzrichtlinien</a> zu.
          </p>
          
          <Button variant="outline" size="sm" onClick={onClose} className="sm:w-auto">
            Abbrechen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
