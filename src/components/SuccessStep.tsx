
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatAddress } from '@/utils/blockchain';
import { toast } from 'sonner';
import ExplorerLink from '@/components/blockchain/ExplorerLink';

interface SuccessStepProps {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  network: string;
  ownerAddress: string;
  canMint: boolean;
  canBurn: boolean;
  onReset: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  contractAddress,
  tokenName,
  tokenSymbol,
  network,
  ownerAddress,
  canMint,
  canBurn,
  onReset
}) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} in die Zwischenablage kopiert`);
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Token erfolgreich deployed!</h2>
        <p className="text-gray-600">
          Dein Token {tokenName} ({tokenSymbol}) wurde erfolgreich auf {network} erstellt.
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Token Adresse:</div>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 p-2 rounded text-sm flex-1">
                {contractAddress}
              </code>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => copyToClipboard(contractAddress, 'Token Adresse')}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Name:</div>
              <div className="font-medium">{tokenName}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Symbol:</div>
              <div className="font-medium">{tokenSymbol}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Netzwerk:</div>
              <div className="font-medium">{network}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Besitzer:</div>
              <div className="font-medium" title={ownerAddress}>
                {formatAddress(ownerAddress, 6, 4)}
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-sm text-gray-500">Funktionen:</div>
            <div className="flex gap-2">
              {canMint && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                  Mintable
                </span>
              )}
              {canBurn && (
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">
                  Burnable
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <ExplorerLink 
              network={network}
              value={contractAddress}
              type="address"
              variant="button"
              className="flex-1"
            />
            <Button onClick={onReset} className="flex-1">
              Neuen Token erstellen
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="mt-6 text-center text-sm text-gray-500">
        Was möchtest du als nächstes tun?
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => window.location.href = '/wallet'}>
          Zur Wallet gehen
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/feed'}>
          Im Feed teilen
        </Button>
      </div>
    </div>
  );
};

export default SuccessStep;
