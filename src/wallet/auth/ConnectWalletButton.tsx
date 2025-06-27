import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Wallet, Loader2, ExternalLink } from 'lucide-react';
import { useConnect, useAccount, useNetwork } from 'wagmi';
import { toast } from 'sonner';
import { useWalletAuth } from './useWalletAuth';
import { WalletConnectModal } from '../components/WalletConnectModal';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ConnectWalletButtonProps extends ButtonProps {
  onConnect?: () => void;
  buttonText?: string;
  showAddress?: boolean;
  showNetwork?: boolean;
  loginAfterConnect?: boolean;
  redirectPath?: string;
  preferredNetwork?: number;
  compact?: boolean;
}

export const ConnectWalletButton: React.FC<ConnectWalletButtonProps> = ({
  onConnect,
  buttonText = "Wallet verbinden",
  showAddress = false,
  showNetwork = false,
  loginAfterConnect = false,
  redirectPath = '/feed',
  preferredNetwork,
  compact = false,
  className,
  size = "default",
  variant = "default",
  ...props
}) => {
  const { connect, connectAsync, connectors, isLoading: isPending, error } = useConnect();
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  
  React.useEffect(() => {
    if (error) {
      toast.error(`Verbindungsfehler: ${error.message}`);
    }
  }, [error]);

  const { isWalletConnected, handleWalletLogin, isAuthenticating } = useWalletAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = async () => {
    try {
      // Wenn die Wallet bereits verbunden ist und wir direkt anmelden möchten
      if (isWalletConnected && loginAfterConnect) {
        await handleWalletLogin(redirectPath);
        return;
      }

      setIsModalOpen(true);
    } catch (error: any) {
      console.error('Fehler bei der Wallet-Verbindung:', error);
      toast.error(`Verbindungsfehler: ${error.message || 'Unbekannter Fehler'}`);
    }
  };
  
  const handleModalSuccess = async () => {
    toast.success('Wallet erfolgreich verbunden');
    if (onConnect) onConnect();
    
    // Wenn nach dem Verbinden direkt anmelden gewünscht ist
    if (loginAfterConnect) {
      await handleWalletLogin(redirectPath);
    }
  };

  const isLoading = isPending || isAuthenticating;
  
  // Dynamisch angepasster Button-Text basierend auf dem Status
  const displayText = isLoading 
    ? "Verbinde..." 
    : isWalletConnected && loginAfterConnect 
      ? "Mit Wallet anmelden" 
      : isConnected && !compact
      ? showAddress 
        ? `${address?.substring(0, 6)}...${address?.substring(address.length - 4)}`
        : buttonText
      : buttonText;
      
  const formattedAddress = address 
    ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
    : '';
    
  const networkDisplay = chain?.name || 'Nicht verbunden';
  const isCorrectNetwork = !preferredNetwork || (chain?.id === preferredNetwork);
  
  const tooltipContent = isConnected ? (
    <div className="space-y-2 p-1">
      <p className="font-medium">Verbundene Wallet</p>
      <div className="text-xs space-y-1">
        <p>Adresse: {address}</p>
        <p>Netzwerk: {networkDisplay}</p>
        {!isCorrectNetwork && preferredNetwork && (
          <p className="text-amber-400">Netzwerkwechsel empfohlen</p>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleConnect}
                size={size}
                variant={variant}
                className={`${className || ''} ${isConnected && !isCorrectNetwork ? 'border-amber-500/50' : ''}`}
                disabled={isLoading}
                {...props}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {!compact && "Verbinde..."}
                  </>
                ) : (
                  <>
                    {isConnected ? (
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full bg-green-500 mr-2 ${compact ? '' : 'mr-2'}`}></div>
                        {!compact && displayText}
                      </div>
                    ) : (
                      <>
                        <Wallet className={`h-4 w-4 ${compact ? '' : 'mr-2'}`} />
                        {!compact && displayText}
                      </>
                    )}
                  </>
                )}
              </Button>
            </motion.div>
          </TooltipTrigger>
          {isConnected && (
            <TooltipContent side="bottom" align="end" className="p-3">
              {tooltipContent}
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
      
      <WalletConnectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess}
        preferredNetwork={preferredNetwork}
      />
    </>
  );
};

export default ConnectWalletButton;
