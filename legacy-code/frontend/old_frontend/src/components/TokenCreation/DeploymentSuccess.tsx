
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Copy, Share } from 'lucide-react';
import { TokenFormData } from './types';

export interface DeploymentSuccessProps {
  formData: TokenFormData;
  deployedTokenId: string;
  onShare: () => void;
}

export const DeploymentSuccess: React.FC<DeploymentSuccessProps> = ({
  formData,
  deployedTokenId,
  onShare
}) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(deployedTokenId);
    alert('Token-Adresse in die Zwischenablage kopiert!');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Token erfolgreich erstellt!</h2>
        <p className="text-muted-foreground mb-6">
          Dein {formData.name} ({formData.symbol}) Token wurde erfolgreich auf der Blockchain deployed.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Token-Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-sm font-medium text-muted-foreground">Name:</span>
            <span className="text-sm font-semibold">{formData.name}</span>
            
            <span className="text-sm font-medium text-muted-foreground">Symbol:</span>
            <span className="text-sm font-semibold">{formData.symbol}</span>
            
            <span className="text-sm font-medium text-muted-foreground">Contract-Adresse:</span>
            <div className="flex items-center">
              <span className="text-sm font-mono truncate max-w-[200px]">{deployedTokenId}</span>
              <Button variant="ghost" size="icon" className="ml-1 h-5 w-5" onClick={handleCopyAddress}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button className="w-full" onClick={onShare}>
            <Share className="mr-2 h-4 w-4" />
            Token teilen
          </Button>
          <Button variant="outline" className="w-full" onClick={handleCopyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Adresse kopieren
          </Button>
        </CardFooter>
      </Card>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Nächste Schritte</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
          <li>Füge den Token zu deiner Wallet hinzu mit der Contract-Adresse</li>
          <li>Verifiziere den Smart Contract auf dem Blockchain-Explorer</li>
          <li>Erstelle Liquidität für deinen Token in einer DEX</li>
          <li>Teile deinen Token mit deiner Community</li>
        </ul>
      </div>
    </div>
  );
};

export default DeploymentSuccess;
