
import React, { useState } from 'react';
import { Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletConnectModal from './WalletConnectModal';

interface WalletConnectPromptProps {
  message?: string;
  className?: string;
  onConnect?: () => void;
}

const WalletConnectPrompt: React.FC<WalletConnectPromptProps> = ({
  message = 'Connect your wallet to continue',
  className = '',
  onConnect
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  
  const handleSuccess = () => {
    if (onConnect) onConnect();
  };
  
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Wallet className="h-10 w-10 text-primary" />
      </div>
      
      <h3 className="text-2xl font-medium mb-4">Wallet verbinden</h3>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        {message}
      </p>
      
      <div className="flex flex-col items-center gap-4">
        <Button 
          size="lg" 
          onClick={handleOpenModal}
          className="px-8 flex items-center gap-2 transition-all hover:gap-3"
        >
          Wallet verbinden
          <ArrowRight className="h-4 w-4" />
        </Button>
        
        <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-2">
          Durch das Verbinden deiner Wallet stimmst du den Nutzungsbedingungen und Datenschutzrichtlinien zu.
        </p>
      </div>
      
      <WalletConnectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default WalletConnectPrompt;
