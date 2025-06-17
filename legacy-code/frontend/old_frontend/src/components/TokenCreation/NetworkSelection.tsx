import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ExternalLink, Globe, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Network {
  id: string;
  name: string;
  icon: React.ReactNode;
  chainId: number;
  currency: string;
  explorer: string;
  testnet: boolean;
  // Added missing properties that were causing TypeScript errors
  status?: 'active' | 'maintenance' | 'coming soon';
  description?: string;
  avgGasPrice?: string;
  gasToken?: string; // Added gasToken property
}

export interface NetworkSelectionProps {
  selectedNetwork: string;
  onNetworkSelect: (network: string) => void;
  networks: Network[];
}

export const NetworkSelection: React.FC<NetworkSelectionProps> = ({
  selectedNetwork,
  onNetworkSelect,
  networks
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Blockchain-Netzwerk auswählen</h2>
        <p className="text-muted-foreground">
          Wähle das Blockchain-Netzwerk für deinen Token. Verschiedene Netzwerke bieten unterschiedliche Vorteile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {networks.map((network) => (
          <Card 
            key={network.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md overflow-hidden relative border-2",
              selectedNetwork === network.id 
                ? "border-primary" 
                : "border-transparent hover:border-primary/20"
            )}
            onClick={() => onNetworkSelect(network.id)}
          >
            {selectedNetwork === network.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            )}
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="p-2 rounded-lg bg-primary/10">
                  {network.icon || <Globe className="h-5 w-5 text-primary" />}
                </div>
                <Badge variant={network.testnet ? "outline" : "default"}>
                  {network.testnet ? 'Testnet' : 'Mainnet'}
                </Badge>
              </div>
              <CardTitle className="mt-2">{network.name}</CardTitle>
              {network.status && (
                <Badge variant={network.status === 'active' ? "success" : "outline"} className="mt-2">
                  {network.status}
                </Badge>
              )}
              <CardDescription>
                {network.description || `Chain ID: ${network.chainId}`}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Währung:</span>
                  <span className="font-medium">{network.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas-Preis:</span>
                  <span className="font-medium">{network.avgGasPrice || 'Variabel'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gas-Token:</span>
                  <span className="font-medium">{network.gasToken || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0 pb-4 flex justify-between">
              <div className={cn(
                "text-sm",
                selectedNetwork === network.id ? "text-primary font-medium" : "text-muted-foreground"
              )}>
                {selectedNetwork === network.id ? 'Ausgewählt' : 'Auswählen'}
              </div>
              
              <a 
                href={network.explorer}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary flex items-center"
                onClick={(e) => e.stopPropagation()}
              >
                Explorer <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default NetworkSelection;
