import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useConnect, useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
import { Loader2, AlertCircle, CheckCircle2, ArrowRight, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preferredNetwork?: number;
}

export const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preferredNetwork
}) => {
  const { connectors, connect, error } = useConnect();
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();
  
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  
  const [activeTab, setActiveTab] = useState('connect');
  const [connectingConnector, setConnectingConnector] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setConnectingConnector(null);
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isConnected && connectingConnector) {
      if (preferredNetwork && chain?.id !== preferredNetwork) {
        setActiveTab('network');
      } else {
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      }
    }
  }, [isConnected, connectingConnector, chain?.id, preferredNetwork, onClose, onSuccess]);
  
  useEffect(() => {
    if (error) {
      setConnectingConnector(null);
      toast.error(`Verbindungsfehler: ${error.message}`);
    }
  }, [error]);
  
  const handleConnect = async (connector: any) => {
    try {
      setConnectingConnector(connector.id);
      setIsConnecting(true);
      await connect({ connector });
    } catch (err) {
      toast.error(`Connection error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
      setConnectingConnector(null);
    }
  };
  
  const handleSwitchNetwork = async (chainId: number) => {
    if (switchNetwork) {
      try {
        setIsSwitchingNetwork(true);
        await switchNetwork(chainId);
        
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1000);
      } catch (err) {
        console.error('Network switching error:', err);
        toast.error(`Network switching error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsSwitchingNetwork(false);
      }
    }
  };
  
  const getConnectorIcon = (connectorId: string): string | undefined => {
    switch (connectorId) {
      case 'metaMask':
        return '/images/wallets/metamask.svg';
      case 'coinbaseWallet':
        return '/images/wallets/coinbase.svg';
      case 'walletConnect':
        return '/images/wallets/walletconnect.svg';
      default:
        return undefined;
    }
  };
  
  const getConnectorName = (connectorId: string) => {
    switch (connectorId) {
      case 'metaMask':
        return 'MetaMask';
      case 'coinbaseWallet':
        return 'Coinbase Wallet';
      case 'walletConnect':
        return 'WalletConnect';
      case 'injected':
        return 'Browser Wallet';
      default:
        return connectorId;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Wallet verbinden</DialogTitle>
          <DialogDescription>
            Verbinde deine Wallet, um auf alle Funktionen zuzugreifen
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connect" disabled={activeTab === 'network'}>
              Verbinden
            </TabsTrigger>
            <TabsTrigger value="network" disabled={!isConnected}>
              Netzwerk
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connect" className="space-y-4 py-4">
            <AnimatePresence mode="wait">
              {isConnected ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center justify-center p-4 space-y-3"
                >
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <h3 className="text-lg font-medium">Erfolgreich verbunden!</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Deine Wallet ist jetzt mit BSN verbunden.
                  </p>
                  
                  {preferredNetwork && chain?.id !== preferredNetwork && (
                    <Alert variant="warning" className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Bitte wechsle zum empfohlenen Netzwerk, um alle Funktionen nutzen zu können.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="flex gap-3 mt-4">
                    {preferredNetwork && chain?.id !== preferredNetwork ? (
                      <Button onClick={() => setActiveTab('network')} className="flex items-center gap-2">
                        Netzwerk wechseln
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button onClick={onClose}>Fortfahren</Button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {connectors.map((connector) => (
                    <motion.div
                      key={connector.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start h-14 px-4"
                        onClick={() => handleConnect(connector)}
                        disabled={!connector.ready || isConnecting || connectingConnector === connector.id}
                      >
                        <div className="flex items-center w-full">
                          {getConnectorIcon(connector.id) ? (
                            <img 
                              src={getConnectorIcon(connector.id)} 
                              alt={connector.name} 
                              className="h-6 w-6 mr-3"
                            />
                          ) : (
                            <Wallet className="h-6 w-6 mr-3" />
                          )}
                          
                          <span className="flex-1 text-left">{getConnectorName(connector.id)}</span>
                          
                          {connectingConnector === connector.id && (
                            <LoadingSpinner size="sm" className="ml-2" />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                  
                  {!connectors.length && (
                    <div className="text-center p-4">
                      <p>Keine Wallet-Verbindungen verfügbar</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          
          <TabsContent value="network" className="space-y-4 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Aktuelles Netzwerk: <span className="font-medium">{chain?.name || 'Nicht verbunden'}</span>
                  </p>
                  
                  {preferredNetwork && (
                    <Alert variant={chain?.id === preferredNetwork ? 'default' : 'warning'} className="mb-4">
                      <AlertDescription>
                        {chain?.id === preferredNetwork 
                          ? 'Du bist mit dem empfohlenen Netzwerk verbunden.' 
                          : 'Bitte wechsle zum empfohlenen Netzwerk für die beste Erfahrung.'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                <div className="space-y-2">
                  {chains.map((networkChain) => (
                    <motion.div
                      key={networkChain.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={chain?.id === networkChain.id ? 'default' : 'outline'}
                        className="w-full justify-between h-12"
                        onClick={() => handleSwitchNetwork(networkChain.id)}
                        disabled={isSwitchingNetwork || chain?.id === networkChain.id}
                      >
                        <span>{networkChain.name}</span>
                        {chain?.id === networkChain.id && (
                          <CheckCircle2 className="h-4 w-4 ml-2 text-green-500" />
                        )}
                        {isSwitchingNetwork && chain?.id !== networkChain.id && (
                          <LoadingSpinner size="sm" className="ml-2" />
                        )}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
