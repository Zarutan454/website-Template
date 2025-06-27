
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { InfoIcon } from 'lucide-react';
import { useTokenCreation } from '../context/TokenCreationContext';
import { NETWORKS, TOKEN_TYPES } from '../data/tokenData';
import NetworkIcon from '../NetworkIcon';
import TokenTypeIcon from '../TokenTypeIcon';

const ReviewStep: React.FC = () => {
  const { form } = useTokenCreation();
  
  if (!form) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Formular-Kontext nicht verfügbar
        </AlertDescription>
      </Alert>
    );
  }
  
  const values = form.getValues();
  const selectedNetwork = NETWORKS.find(n => n.id === values.network);
  const selectedTokenType = TOKEN_TYPES.find(t => t.id === values.tokenType);
  
  if (!selectedNetwork || !selectedTokenType) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Bitte wähle ein Netzwerk und einen Token-Typ
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Token-Übersicht</CardTitle>
          <CardDescription>
            Überprüfe deine Token-Konfiguration vor dem Deployment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Allgemeine Informationen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Name:</span>
                  <span>{values.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Symbol:</span>
                  <span>{values.symbol}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Decimals:</span>
                  <span>{values.decimals}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Initialer Supply:</span>
                  <span>{values.supply} {values.symbol}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Netzwerk:</span>
                  <div className="flex items-center">
                    <NetworkIcon network={selectedNetwork.id} size={16} />
                    <span className="ml-1">{selectedNetwork.name}</span>
                    {selectedNetwork.isTestnet && (
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800">Testnet</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Token-Typ:</span>
                  <div className="flex items-center">
                    <TokenTypeIcon tokenType={selectedTokenType} size={16} />
                    <span className="ml-1">{selectedTokenType.name}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Netzwerk-Währung:</span>
                  <span>{selectedNetwork.currency}</span>
                </div>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">Token-Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {values.features.mintable && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Mintable</Badge>
              )}
              {values.features.burnable && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Burnable</Badge>
              )}
              {values.features.pausable && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Pausable</Badge>
              )}
              {values.features.shareable && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Shareable</Badge>
              )}
            </div>
          </div>
          
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Bitte überprüfe alle Informationen sorgfältig, da einige Parameter nach dem Deployment nicht mehr geändert werden können.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;
