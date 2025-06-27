
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NetworkOption } from '../types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Image } from '@/components/ui/image';
import { Info, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface NetworkSelectionProps {
  networks: NetworkOption[];
  selectedNetwork: string;
  onSelect: (networkId: string) => void;
}

const NetworkSelection: React.FC<NetworkSelectionProps> = ({ networks, selectedNetwork, onSelect }) => {
  // Filter networks into mainnet and testnet groups
  const mainnetNetworks = networks.filter(network => !network.isTestnet);
  const testnetNetworks = networks.filter(network => network.isTestnet);

  // Get security level info based on network
  const getSecurityLevel = (network: NetworkOption) => {
    if (network.id === 'ethereum') return { level: 'Hoch', icon: <Shield className="h-4 w-4 text-green-500" />, color: 'text-green-500' };
    if (network.id === 'polygon' || network.id === 'bnb') return { level: 'Mittel', icon: <CheckCircle2 className="h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
    return { level: 'Standard', icon: <Info className="h-4 w-4 text-yellow-500" />, color: 'text-yellow-500' };
  };

  // Get gas info based on network
  const getGasInfo = (network: NetworkOption) => {
    if (network.id === 'ethereum') return { cost: 'Hoch', text: '~$15-50 USD' };
    if (network.id === 'polygon') return { cost: 'Niedrig', text: '~$0.1-1 USD' };
    if (network.id === 'bnb') return { cost: 'Mittel', text: '~$1-5 USD' };
    return { cost: 'Variiert', text: 'Variabel' };
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-lg font-medium">Blockchain-Netzwerk wählen</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                <span className="mr-1">Warum ist das wichtig?</span>
                <Info className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-md p-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Die Blockchain-Auswahl beeinflusst:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Transaktionsgebühren (Gas-Kosten)</li>
                    <li>Transaktionsgeschwindigkeit</li>
                    <li>Sicherheitsniveau</li>
                    <li>Kompatibilität mit anderen Projekten</li>
                    <li>Zugänglichkeit für Ihre Nutzer</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    Für Tests empfehlen wir zunächst ein Testnet zu verwenden.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {networks.length === 0 ? (
          <div className="rounded-md bg-amber-50 dark:bg-amber-900/20 p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-3" />
              <span>Keine Netzwerke verfügbar. Bitte versuche es später erneut.</span>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Mainnets <Badge variant="outline" className="ml-2">Produktiv</Badge></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mainnetNetworks.map((network) => {
                  const isSelected = selectedNetwork === network.id;
                  const securityInfo = getSecurityLevel(network);
                  const gasInfo = getGasInfo(network);

                  return (
                    <Card 
                      key={network.id}
                      className={cn(
                        "cursor-pointer hover:border-primary/60 hover:shadow-md transition-all duration-200",
                        isSelected ? "border-2 border-primary bg-primary/5" : "border border-muted"
                      )}
                      onClick={() => onSelect(network.id)}
                    >
                      <CardContent className="p-4 flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 relative flex-shrink-0">
                            {network.icon && (
                              <Image 
                                src={network.icon} 
                                alt={network.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-lg">{network.name}</div>
                            <div className="text-sm text-muted-foreground flex items-center">
                              <span className="mr-2">{network.currency}</span>
                              {securityInfo.icon}
                              <span className={cn("text-xs ml-1", securityInfo.color)}>
                                {securityInfo.level}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gas-Kosten:</span>
                            <span className="font-medium">{gasInfo.text}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Token-Standard:</span>
                            <span className="font-medium">{network.tokenStandard || "ERC-20"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Tx-Zeit:</span>
                            <span className="font-medium">{network.transactionTime || "Variiert"}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {testnetNetworks.length > 0 && (
              <div className="space-y-4 mt-8">
                <h3 className="text-lg font-medium">Testnets <Badge variant="outline" className="ml-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 border-yellow-200 dark:border-yellow-800">Test</Badge></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {testnetNetworks.map((network) => (
                    <Card 
                      key={network.id}
                      className={cn(
                        "cursor-pointer hover:border-primary/60 hover:shadow-md transition-all duration-200",
                        selectedNetwork === network.id ? "border-2 border-primary bg-primary/5" : "border border-muted"
                      )}
                      onClick={() => onSelect(network.id)}
                    >
                      <CardContent className="p-4 flex items-center space-x-3">
                        <div className="w-10 h-10 relative flex-shrink-0">
                          {network.icon && (
                            <Image 
                              src={network.icon} 
                              alt={network.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{network.name}</div>
                          <div className="text-sm text-muted-foreground">{network.currency}</div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                          Testnet
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-4 p-4 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Testnet-Empfehlung</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Für erste Tests empfehlen wir die Verwendung eines Testnets. 
                        Testnets verwenden Tokens ohne realen Wert und sind ideal zum Experimentieren.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="mt-8">
          <Label htmlFor="network-select" className="mb-2 block">Schnellauswahl</Label>
          <Select value={selectedNetwork} onValueChange={onSelect}>
            <SelectTrigger id="network-select" className="w-full">
              <SelectValue placeholder="Netzwerk auswählen" />
            </SelectTrigger>
            <SelectContent>
              <div className="py-2">
                <p className="px-2 text-sm font-medium">Mainnets</p>
                {mainnetNetworks.map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center">
                      <span className="mr-2">{network.name}</span>
                      {!network.isTestnet && (
                        <Badge variant="outline" className="ml-auto text-xs py-0 px-1.5">
                          Live
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
              {testnetNetworks.length > 0 && (
                <div className="py-2 border-t">
                  <p className="px-2 text-sm font-medium">Testnets</p>
                  {testnetNetworks.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      <div className="flex items-center">
                        <span className="mr-2">{network.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs py-0 px-1.5 bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-500 dark:border-yellow-800">
                          Test
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default NetworkSelection;
