
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Send, Wallet, ArrowUpDown } from 'lucide-react';
import { formatBalance, formatNumber } from '@/wallet/utils/formatters';

interface Token {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  value_usd?: number;
  icon_url?: string;
  network: string;
  price_usd?: number;
  price_change_24h?: number;
  contract_address?: string;
}

interface TokenListProps {
  tokens: Token[];
  onViewDetails?: (token: Token) => void;
  onSend?: (token: Token) => void;
  onSwap?: (token: Token) => void;
  isLoading?: boolean;
}

const TokenList: React.FC<TokenListProps> = ({ 
  tokens, 
  onViewDetails, 
  onSend, 
  onSwap,
  isLoading = false
}) => {
  const getNetworkColor = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum': return 'bg-purple-700';
      case 'bsc': return 'bg-yellow-700';
      case 'polygon': return 'bg-indigo-600';
      case 'solana': return 'bg-green-700';
      default: return 'bg-gray-700';
    }
  };
  
  const getNetworkName = (network: string) => {
    switch (network.toLowerCase()) {
      case 'bsc': return 'BNB Chain';
      default: return network.charAt(0).toUpperCase() + network.slice(1);
    }
  };
  
  const renderPriceChange = (change: number) => {
    if (change === undefined) return null;
    
    const isPositive = change >= 0;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    const indicator = isPositive ? '↑' : '↓';
    
    return (
      <span className={`text-xs ${color}`}>
        {indicator} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-dark-200 border-gray-800">
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-700 rounded"></div>
                    <div className="h-3 w-20 bg-gray-700 rounded"></div>
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 w-20 bg-gray-700 rounded ml-auto"></div>
                  <div className="h-3 w-16 bg-gray-700 rounded ml-auto"></div>
                </div>
              </div>
              <div className="p-3 bg-dark-300 flex justify-end space-x-2">
                <div className="h-8 w-8 bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-700 rounded"></div>
                <div className="h-8 w-8 bg-gray-700 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Wallet className="mx-auto h-12 w-12 mb-4 opacity-20" />
        <p>Keine Tokens gefunden.</p>
        <p className="text-sm mt-1">Token werden angezeigt, sobald sie zu deiner Wallet hinzugefügt werden</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {tokens.map((token) => (
        <Card key={token.id} className="bg-dark-200 border-gray-800 overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={token.icon_url} alt={token.name} />
                  <AvatarFallback className={getNetworkColor(token.network)}>
                    {token.symbol.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{token.name}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-2">
                    <span>{token.symbol}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-dark-300">
                      {getNetworkName(token.network)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatBalance(token.balance, token.symbol)}</div>
                <div className="text-xs text-gray-400 flex items-center justify-end gap-2">
                  {token.value_usd !== undefined && (
                    <span>${formatNumber(token.value_usd)}</span>
                  )}
                  {token.price_change_24h !== undefined && (
                    renderPriceChange(token.price_change_24h)
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-2 bg-dark-300 flex justify-end space-x-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onViewDetails?.(token)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onSend?.(token)}
              >
                <Send className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => onSwap?.(token)}
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TokenList;
