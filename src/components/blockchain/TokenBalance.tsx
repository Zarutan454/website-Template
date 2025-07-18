import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useWeb3 } from './Web3Provider';
import { toast } from 'sonner';

interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logo?: string;
}

interface TokenBalance {
  token: TokenInfo;
  balance: string;
  usdValue?: number;
  priceChange24h?: number;
}

const POPULAR_TOKENS: TokenInfo[] = [
  {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    address: '0x0000000000000000000000000000000000000000',
    logo: '🔵',
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    address: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8',
    logo: '🔵',
  },
  {
    symbol: 'USDT',
    name: 'Tether',
    decimals: 6,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    logo: '🟢',
  },
  {
    symbol: 'MATIC',
    name: 'Polygon',
    decimals: 18,
    address: '0x0000000000000000000000000000000000001010',
    logo: '🟣',
  },
];

const TokenBalance: React.FC = () => {
  const { provider, account, chainId } = useWeb3();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalValue, setTotalValue] = useState<number>(0);

  const fetchBalances = async () => {
    if (!provider || !account) return;

    setIsLoading(true);

    try {
      const newBalances: TokenBalance[] = [];

      // Fetch native token balance (ETH, MATIC, etc.)
      const nativeBalance = await provider.getBalance(account);
      const nativeToken = POPULAR_TOKENS.find(token => 
        (chainId === 1 && token.symbol === 'ETH') ||
        (chainId === 137 && token.symbol === 'MATIC')
      );

      if (nativeToken) {
        newBalances.push({
          token: nativeToken,
          balance: ethers.formatEther(nativeBalance),
          usdValue: 0, // Will be fetched from price API
          priceChange24h: 0,
        });
      }

      // Fetch ERC20 token balances
      for (const token of POPULAR_TOKENS) {
        if (token.address === '0x0000000000000000000000000000000000000000') continue;

        try {
          const contract = new ethers.Contract(
            token.address,
            ['function balanceOf(address) view returns (uint256)'],
            provider
          );

          const balance = await contract.balanceOf(account);
          const formattedBalance = ethers.formatUnits(balance, token.decimals);

          if (parseFloat(formattedBalance) > 0) {
            newBalances.push({
              token,
              balance: formattedBalance,
              usdValue: 0, // Will be fetched from price API
              priceChange24h: 0,
            });
          }
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
        }
      }

      setBalances(newBalances);

      // Fetch USD values (simplified - in real app, use price API)
      await fetchUSDValues(newBalances);

    } catch (error) {
      console.error('Error fetching balances:', error);
      toast.error('Fehler beim Laden der Token-Balances');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUSDValues = async (tokenBalances: TokenBalance[]) => {
    // In a real app, you would fetch prices from CoinGecko API or similar
    // For now, we'll use mock prices
    const mockPrices: Record<string, number> = {
      'ETH': 2500,
      'USDC': 1,
      'USDT': 1,
      'MATIC': 0.8,
    };

    const updatedBalances = tokenBalances.map(balance => ({
      ...balance,
      usdValue: parseFloat(balance.balance) * (mockPrices[balance.token.symbol] || 0),
      priceChange24h: Math.random() * 10 - 5, // Mock price change
    }));

    setBalances(updatedBalances);
    
    const total = updatedBalances.reduce((sum, balance) => sum + (balance.usdValue || 0), 0);
    setTotalValue(total);
  };

  useEffect(() => {
    if (account) {
      fetchBalances();
    }
  }, [account, chainId]);

  const formatBalance = (balance: string, decimals: number) => {
    const num = parseFloat(balance);
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const formatUSD = (value: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Balances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Verbinden Sie Ihre Wallet, um Token-Balances anzuzeigen.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Token Balances</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBalances}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-3 w-12 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : balances.length > 0 ? (
          <div className="space-y-4">
            {/* Total Value */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Gesamtwert</div>
              <div className="text-2xl font-bold">{formatUSD(totalValue)}</div>
            </div>

            {/* Token List */}
            <div className="space-y-3">
              {balances.map((balance) => (
                <div
                  key={balance.token.address}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{balance.token.logo}</div>
                    <div>
                      <div className="font-medium">{balance.token.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {balance.token.name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {formatBalance(balance.balance, balance.token.decimals)} {balance.token.symbol}
                    </div>
                    {balance.usdValue && (
                      <div className="text-sm text-muted-foreground">
                        {formatUSD(balance.usdValue)}
                      </div>
                    )}
                    {balance.priceChange24h !== undefined && (
                      <div className={`text-xs flex items-center gap-1 ${
                        balance.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {balance.priceChange24h >= 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(balance.priceChange24h).toFixed(2)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💰</div>
            <p className="text-muted-foreground">
              Keine Token in dieser Wallet gefunden.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenBalance; 