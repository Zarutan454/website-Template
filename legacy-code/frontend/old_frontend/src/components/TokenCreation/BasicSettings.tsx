
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react'; // Changed from InfoCircle to Info which is available in lucide-react
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface BasicSettingsProps {
  name: string;
  symbol: string;
  decimals: string;
  supply: string;
  onNameChange: (name: string) => void;
  onSymbolChange: (symbol: string) => void;
  onDecimalsChange: (decimals: string) => void;
  onSupplyChange: (supply: string) => void;
}

export const BasicSettings: React.FC<BasicSettingsProps> = ({
  name,
  symbol,
  decimals,
  supply,
  onNameChange,
  onSymbolChange,
  onDecimalsChange,
  onSupplyChange
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Basis-Einstellungen</h2>
        <p className="text-muted-foreground">
          Konfiguriere die grundlegenden Parameter für deinen Token.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="token-name" className="font-medium">Token-Name</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full">
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Der vollständige Name deines Tokens (z.B. "Ethereum")</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="token-name"
              placeholder="z.B. Mein Super Token"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="token-symbol" className="font-medium">Token-Symbol</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full">
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Das Ticker-Symbol deines Tokens (z.B. "ETH")</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="token-symbol"
              placeholder="z.B. MST"
              value={symbol}
              onChange={(e) => onSymbolChange(e.target.value)}
              className="uppercase"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="token-decimals" className="font-medium">Dezimalstellen</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full">
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Die Anzahl der Nachkommastellen für deinen Token (Standard: 18)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="token-decimals"
              type="number"
              placeholder="18"
              value={decimals}
              onChange={(e) => onDecimalsChange(e.target.value)}
              min="0"
              max="18"
            />
            <p className="text-xs text-muted-foreground">
              Normalerweise 18 für die meisten Tokens. Niedrigere Werte können für spezielle Anwendungsfälle verwendet werden.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="token-supply" className="font-medium">Gesamtversorgung</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 ml-1 rounded-full">
                      <Info className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs max-w-xs">Die Gesamtmenge an Token, die jemals existieren werden</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="token-supply"
              type="number"
              placeholder="100000000"
              value={supply}
              onChange={(e) => onSupplyChange(e.target.value)}
              min="1"
            />
            <p className="text-xs text-muted-foreground">
              Lege die Gesamtzahl der Token fest, die im Umlauf sein werden. Dies kann nicht geändert werden, wenn der Token mintable ist.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicSettings;
