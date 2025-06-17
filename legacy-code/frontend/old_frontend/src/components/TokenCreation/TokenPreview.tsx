
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import NetworkIcon from './NetworkIcon';
import TokenTypeIcon from './TokenTypeIcon';
import { NETWORKS, TOKEN_TYPES } from './data/tokenData';
import { TokenTypeOption } from './types/unified';

interface TokenPreviewProps {
  name: string;
  symbol: string;
  supply: string;
  network: string;
  tokenType: string;
  showDetails?: boolean;
}

const TokenPreview: React.FC<TokenPreviewProps> = ({
  name,
  symbol,
  supply,
  network,
  tokenType,
  showDetails = true
}) => {
  const selectedNetwork = NETWORKS.find(n => n.id === network);
  const selectedTokenType = TOKEN_TYPES.find(t => t.id === tokenType);
  
  const formattedSupply = () => {
    try {
      const num = parseFloat(supply);
      return new Intl.NumberFormat('de-DE').format(num);
    } catch (e) {
      return supply;
    }
  };
  
  // Fallback-Werte, falls keine Auswahl getroffen wurde
  const networkName = selectedNetwork?.name || 'Netzwerk auswählen';
  const networkColor = selectedNetwork?.color || '#627EEA';
  const networkIsTestnet = selectedNetwork?.isTestnet || false;
  
  return (
    <Card className="bg-white dark:bg-gray-800 overflow-hidden">
      <div 
        className="h-3" 
        style={{ backgroundColor: networkColor }}
      />
      <CardContent className="pt-4">
        <div className="flex items-center mb-3">
          {selectedNetwork && (
            <NetworkIcon 
              network={selectedNetwork.id} 
              size={18} 
              className="mr-1" 
            />
          )}
          <span className="text-xs font-medium">
            {networkName}
          </span>
          {networkIsTestnet && (
            <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
              Testnet
            </Badge>
          )}
        </div>
        
        <h3 className="text-lg font-bold mb-1 truncate">
          {name || 'Token Name'}
        </h3>
        
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <span className="font-semibold">{symbol || 'SYM'}</span>
          {selectedTokenType && (
            <div className="flex items-center ml-2 text-xs">
              <TokenTypeIcon 
                tokenType={tokenType} 
                size={14} 
                className="mr-1" 
              />
              <span>{selectedTokenType.name}</span>
            </div>
          )}
        </div>
        
        {showDetails && (
          <div className="text-sm">
            <div className="flex justify-between py-1 border-t">
              <span className="text-gray-500">Supply:</span>
              <span>{formattedSupply()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenPreview;
