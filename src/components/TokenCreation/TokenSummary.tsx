import React from 'react';
import { TokenFormData, TokenType } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Check, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface TokenSummaryProps {
  formData: TokenFormData;
  tokenTypes: TokenType[];
}

export const TokenSummary: React.FC<TokenSummaryProps> = ({ formData, tokenTypes }) => {
  const getNetworkName = (id: string): string => {
    const networks: Record<string, string> = {
      'ethereum': 'Ethereum Mainnet',
      'bsc': 'BNB Smart Chain',
      'polygon': 'Polygon',
      'sepolia': 'Sepolia Testnet'
    };
    return networks[id] || id;
  };
  
  const getTokenTypeName = (id: string): string => {
    const types: Record<string, string> = {
      'standard': 'Standard Token',
      'business': 'Business Token',
      'marketing': 'Marketing Token'
    };
    return types[id] || id;
  };
  
  const getFeaturesList = () => {
    const features = [];
    if (formData.features.mintable) features.push('Mintable (neue Token können erstellt werden)');
    if (formData.features.burnable) features.push('Burnable (Token können vernichtet werden)');
    if (formData.features.pausable) features.push('Pausable (Transfers können angehalten werden)');
    if (formData.features.shareable) features.push('Social Features (Token-Integration in soziale Aktivitäten)');
    return features;
  };
  
  const calculateTotalSupply = () => {
    if (!formData.supply) return '0';
    
    // Füge Tausendertrennzeichen ein
    return Number(formData.supply).toLocaleString('de-DE');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Token-Übersicht</h2>
        <p className="text-muted-foreground">
          Überprüfe alle Einstellungen deines Tokens, bevor er auf der Blockchain erstellt wird.
        </p>
      </div>
      
      <Alert variant="warning" className="bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-amber-800 dark:text-amber-400">
          Token-Erstellung kann nicht rückgängig gemacht werden. Bitte überprüfe alle Details sorgfältig.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Token-Grundinformationen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium text-muted-foreground">Name:</span>
              <span className="text-sm font-semibold">{formData.name}</span>
              
              <span className="text-sm font-medium text-muted-foreground">Symbol:</span>
              <span className="text-sm font-semibold">{formData.symbol}</span>
              
              <span className="text-sm font-medium text-muted-foreground">Dezimalstellen:</span>
              <span className="text-sm">{formData.decimals}</span>
              
              <span className="text-sm font-medium text-muted-foreground">Anfangsbestand:</span>
              <span className="text-sm">{calculateTotalSupply()} {formData.symbol}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Blockchain-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] gap-2">
              <span className="text-sm font-medium text-muted-foreground">Netzwerk:</span>
              <span className="text-sm">{getNetworkName(formData.network)}</span>
              
              <span className="text-sm font-medium text-muted-foreground">Token-Typ:</span>
              <span className="text-sm">{getTokenTypeName(formData.tokenType)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Token-Funktionen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getFeaturesList().map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
            {getFeaturesList().length === 0 && (
              <li className="text-sm text-muted-foreground">Keine speziellen Funktionen aktiviert</li>
            )}
          </ul>
        </CardContent>
      </Card>
      
      <Separator />
      
      <div className="text-sm text-muted-foreground">
        <p>
          Nach dem Deployment erhältst du die Contract-Adresse deines Tokens. Du kannst den Token dann in 
          deiner Wallet hinzufügen und mit anderen teilen.
        </p>
      </div>
    </div>
  );
};

export default TokenSummary;
