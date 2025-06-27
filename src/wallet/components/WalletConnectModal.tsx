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
import { Spinner } from '@/components/ui/spinner';
import { Wallet, AlertCircle, Check, ChevronRight, Shield, Globe, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

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
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false);
  const [connectingConnector, setConnectingConnector] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      setConnectionSuccess(false);
      setActiveTab('connect');
      setConnectingConnector(null);
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
  }, [isConnected, chain?.id, preferredNetwork, connectionSuccess, onSuccess, onClose]);

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
      setConnectionSuccess(true);
      
      if (!preferredNetwork || chain?.id === preferredNetwork) {
        if (onSuccess) onSuccess();
        setTimeout(() => onClose(), 1500);
      }
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
          if (onSuccess) onSuccess();
          onClose();
        }, 1000);
      } catch (err) {
        console.error('Network switching error:', err);
        toast.error(`Network switching error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsSwitchingNetwork(false);
      }
    }
  };
  
  const getPreferredNetworkName = () => {
    if (!preferredNetwork) return null;
    const network = chains.find(c => c.id === preferredNetwork);
    return network?.name || 'Bevorzugtes Netzwerk';
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
      <DialogContent className="sm:max-w-md bg-dark-100 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Wallet verbinden
          </DialogTitle>
          <DialogDescription className="text-gray-400">
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
                    <Spinner size="sm" />
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
                          disabled={!connector.ready || isConnecting || connectingConnector === connector.id}
                          variant="outline"
                          className="flex justify-between items-center h-14 px-4 w-full hover:bg-dark-200 hover:border-primary/50 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {getConnectorIcon(connector.id) ? (
                              <img 
                                src={getConnectorIcon(connector.id)} 
                                alt={connector.name} 
                                className="h-6 w-6"
                              />
                            ) : connector.id.toLowerCase().includes('metamask') ? (
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
                                {getConnectorName(connector.id)}
                              </p>
                              <p className="text-xs text-gray-400">
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
                          {isConnecting && connectingConnector === connector.id ? (
                            <Spinner size="sm" />
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
                {preferredNetwork && chain?.id !== preferredNetwork && (
                  <Alert variant="warning" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Bitte wechsle zum empfohlenen Netzwerk, um alle Funktionen nutzen zu können.
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-3">
                  {chains.map((networkChain) => (
                    <Button
                      key={networkChain.id}
                      variant={chain?.id === networkChain.id ? "default" : "outline"}
                      className="w-full justify-between h-14 px-4"
                      onClick={() => handleSwitchNetwork(networkChain.id)}
                      disabled={isSwitchingNetwork || chain?.id === networkChain.id}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">{networkChain.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Chain ID: {networkChain.id}
                          </p>
                        </div>
                      </div>
                      {isSwitchingNetwork && chain?.id !== networkChain.id ? (
                        <Spinner size="sm" />
                      ) : chain?.id === networkChain.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <ArrowRight className="h-5 w-5" />
                      )}
                    </Button>
                  ))}
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
          <div className="text-center sm:text-left text-xs text-gray-400">
            Durch das Verbinden deiner Wallet stimmst du den{' '}
            <a href="/terms" className="text-primary hover:underline">Nutzungsbedingungen</a>{' '}
            und{' '}
            <a href="/privacy" className="text-primary hover:underline">Datenschutzrichtlinien</a>{' '}
            zu.
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
