import React from 'react';
import { useConnect } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Wallet, AlertCircle } from 'lucide-react';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { connect, connectors, isLoading, error } = useConnect();

  const handleConnect = async (connector: any) => {
    try {
      await connect({ connector });
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Fehler beim Verbinden der Wallet:', err);
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

        <div className="grid gap-4 py-4">
          {error && (
            <div className="p-3 rounded-md bg-red-900/20 border border-red-800 text-red-200 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error.message}</p>
            </div>
          )}

          <div className="grid gap-3">
            {connectors.map((connector) => (
              <Button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={!connector.ready || isLoading}
                variant="outline"
                className="flex justify-between items-center h-14 px-4 hover:bg-dark-200 hover:border-primary/50 transition-all"
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
                {isLoading && connector.id === 'injected' && (
                  <LoadingSpinner size="sm" />
                )}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-2 text-center text-xs text-gray-400">
          Durch das Verbinden deiner Wallet stimmst du den <a href="/terms" className="text-primary hover:underline">Nutzungsbedingungen</a> und <a href="/privacy" className="text-primary hover:underline">Datenschutzrichtlinien</a> zu.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WalletConnectModal;
