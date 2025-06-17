
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Check, ChevronRight, Shield, Rocket } from 'lucide-react';
import { TokenFormData } from '../types';
import { Badge } from '@/components/ui/badge';

interface TokenSummaryProps {
  formData: TokenFormData;
  onDeploy: (ownerAddress: string) => Promise<void>;
  onBack: () => void;
  isLoading: boolean;
  ownerAddress: string;
}

export const TokenSummary: React.FC<TokenSummaryProps> = ({
  formData,
  onDeploy,
  onBack,
  isLoading,
  ownerAddress
}) => {
  const handleDeploy = () => {
    onDeploy(ownerAddress);
  };

  // Helper zum Formatieren des Netzwerknamens
  const getNetworkName = (network: string) => {
    switch(network) {
      case 'ethereum': return 'Ethereum Mainnet';
      case 'holesky': return 'Ethereum Testnet (Holesky)';
      case 'bsc': return 'BNB Smart Chain';
      case 'polygon': return 'Polygon';
      default: return network;
    }
  };

  // Helper zum Formatieren des Tokentyps
  const getTokenTypeName = (tokenType: string) => {
    switch(tokenType) {
      case 'standard': return 'Standard Token';
      case 'marketing': return 'Marketing Token';
      case 'business': return 'Business Token';
      default: return tokenType;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Token Zusammenfassung</h2>
        <p className="text-muted-foreground">
          Überprüfe deine Einstellungen, bevor du den Token erstellst
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Allgemeine Informationen
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Token Name</p>
                  <p className="font-medium">{formData.name || 'Nicht gesetzt'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Token Symbol</p>
                  <p className="font-medium">{formData.symbol || 'Nicht gesetzt'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Token Typ</p>
                  <p className="font-medium">{getTokenTypeName(formData.tokenType)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Netzwerk</p>
                  <p className="font-medium">
                    <Badge variant="outline" className="font-normal">
                      {getNetworkName(formData.network)}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Initial Supply</p>
                  <p className="font-medium">{formData.supply} {formData.symbol}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Dezimalstellen</p>
                  <p className="font-medium">{formData.decimals}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium flex items-center mb-4">
                <Rocket className="mr-2 h-5 w-5 text-primary" />
                Funktionen
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <Check className={`h-4 w-4 mr-2 ${formData.features.mintable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={formData.features.mintable ? 'font-medium' : 'text-muted-foreground'}>
                    Mintable
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Check className={`h-4 w-4 mr-2 ${formData.features.burnable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={formData.features.burnable ? 'font-medium' : 'text-muted-foreground'}>
                    Burnable
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Check className={`h-4 w-4 mr-2 ${formData.features.pausable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={formData.features.pausable ? 'font-medium' : 'text-muted-foreground'}>
                    Pausable
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Check className={`h-4 w-4 mr-2 ${formData.features.shareable ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={formData.features.shareable ? 'font-medium' : 'text-muted-foreground'}>
                    {formData.tokenType === 'business' ? 'Social Transfer' : 'Auto-Liquidity'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium flex items-center mb-4">
                Eigentümer
              </h3>
              
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Wallet-Adresse (Token-Besitzer):</p>
                <p className="font-mono text-sm break-all">{ownerAddress}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={onBack} className="flex items-center" disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <Button 
          onClick={handleDeploy} 
          disabled={isLoading}
          className="flex items-center relative overflow-hidden"
        >
          {isLoading ? (
            <>
              <div className="animate-pulse">Token wird erstellt...</div>
              <div className="absolute bottom-0 left-0 h-1 bg-primary animate-progress"></div>
            </>
          ) : (
            <>
              Token erstellen
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
