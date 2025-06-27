import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAccount, useChainId } from 'wagmi';
import { readContract } from 'wagmi/actions';
import { formatUnits, parseEther } from 'viem';
import { erc20ABI } from 'wagmi';
import { ethers } from 'ethers';
import { etherscanService } from '@/lib/etherscan';

// Typdefinitionen für Wallet-Daten
export interface TokenBalance {
  token_id: string;
  token_name: string;
  token_symbol: string;
  token_logo?: string;
  balance: number;
  value_usd?: number;
  contract_address?: string;
}

export interface Transaction {
  id: string;
  date: Date;
  type: 'send' | 'receive' | 'swap' | 'mine';
  amount: number;
  token_symbol: string;
  address: string;
  status: 'pending' | 'completed' | 'failed';
}

// BSN Token Adresse (Beispiel, muss aktualisiert werden)
const BSN_TOKEN_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

// Token-Liste für Ethereum und Sepolia
const KNOWN_TOKENS = {
  1: [
    {
      name: 'USDC',
      symbol: 'USDC',
      address: '0xA0b86a33E6441b8c4C8C8C8C8C8C8C8C8C8C8C8C',
      decimals: 6,
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    },
    {
      name: 'USDT',
      symbol: 'USDT',
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png'
    }
  ],
  11155111: [
    {
      name: 'USDC',
      symbol: 'USDC',
      address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
      decimals: 6,
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
    }
  ]
};

export const useWallet = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [isLoading, setIsLoading] = useState(true);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [totalValueUsd, setTotalValueUsd] = useState(0);

  // Tatsächliche Tokens für den aktuellen Chain abrufen
  useEffect(() => {
    const fetchBalances = async () => {
      if (!isConnected || !address) {
        setBalances([]);
        setTotalValueUsd(0);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        
        const actualBalances: TokenBalance[] = [];
        
        // ETH-Guthaben hinzufügen mit Etherscan API
        if (address) {
          try {
            // Try Etherscan API first
            const etherscanBalance = await etherscanService.getAccountBalance(address, chainId === 1 ? 'mainnet' : 'sepolia');
            const ethBalanceWei = BigInt(etherscanBalance);
            
            if (ethBalanceWei > 0n) {
              try {
                const ethPriceResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
                const ethPriceData = await ethPriceResponse.json();
                const ethPrice = ethPriceData.ethereum?.usd;
                
                if (ethPrice) {
                  const ethValueUsd = Number(formatUnits(ethBalanceWei, 18)) * ethPrice;
                  
                  actualBalances.push({
                    token_id: 'eth',
                    token_name: 'Ethereum',
                    token_symbol: 'ETH',
                    balance: parseFloat(formatUnits(ethBalanceWei, 18)),
                    value_usd: ethValueUsd
                  });
                } else {
                  // Nur ETH-Balance ohne USD-Wert hinzufügen
                  actualBalances.push({
                    token_id: 'eth',
                    token_name: 'Ethereum',
                    token_symbol: 'ETH',
                    balance: parseFloat(formatUnits(ethBalanceWei, 18)),
                    value_usd: 0
                  });
                }
              } catch (ethError) {
                console.warn('Failed to fetch ETH price:', ethError);
                // Nur ETH-Balance ohne USD-Wert hinzufügen
                actualBalances.push({
                  token_id: 'eth',
                  token_name: 'Ethereum',
                  token_symbol: 'ETH',
                  balance: parseFloat(formatUnits(ethBalanceWei, 18)),
                  value_usd: 0
                });
              }
            }
          } catch (etherscanError) {
            console.warn('Etherscan API failed for ETH balance:', etherscanError);
            // Keine Fallback-Daten hinzufügen - nur echte Daten anzeigen
          }
        }
        
        // Bekannte Token für die aktuelle Chain abrufen
        const knownTokens = KNOWN_TOKENS[chainId as keyof typeof KNOWN_TOKENS] || [];
        
        // TODO: Fetch user tokens from Django backend
        const userTokens: any[] = [];
        const userTokensError = null;
          
        if (userTokensError) {
          // Handle error silently
        } else if (userTokens && userTokens.length > 0) {
          for (const token of userTokens) {
            actualBalances.push({
              token_id: token.token_id,
              token_name: token.token_name,
              token_symbol: token.token_symbol,
              token_logo: token.token_logo,
              balance: parseFloat(token.balance),
              value_usd: token.value_usd,
              contract_address: token.contract_address
            });
          }
        } else {
          try {
            // Try Etherscan API for token balances first
            const etherscanTokenBalances = await etherscanService.getTokenBalances(address, chainId === 1 ? 'mainnet' : 'sepolia');
            
            for (const tokenBalance of etherscanTokenBalances) {
              const balance = parseFloat(tokenBalance.balance) / Math.pow(10, parseInt(tokenBalance.tokenDecimal));
              
              if (balance > 0) {
                actualBalances.push({
                  token_id: tokenBalance.tokenSymbol.toLowerCase(),
                  token_name: tokenBalance.tokenName,
                  token_symbol: tokenBalance.tokenSymbol,
                  token_logo: '', // Etherscan doesn't provide logos
                  balance: balance,
                  value_usd: 0, // We would need to fetch price from an API
                  contract_address: tokenBalance.contractAddress
                });
              }
            }
          } catch (etherscanError) {
            // Check if it's a "No transactions found" error - this is normal for new addresses
            if (etherscanError instanceof Error && etherscanError.message.includes('No transactions found')) {
              console.log('No token transactions found for address - this is normal for new addresses');
              // Don't show this as an error, just continue with empty token balances
            } else {
              console.warn('Etherscan token balances failed, falling back to contract calls:', etherscanError);
              
              // Fallback to contract calls if Etherscan fails
              for (const token of knownTokens) {
                try {
                  if (token.address) {
                    // Skip token balance checks in development mode to avoid contract errors
                    if (import.meta.env.DEV) {
                      console.log(`Skipping token balance check for ${token.symbol} in development mode`);
                      continue;
                    }
                    
                    const tokenBalance = await readContract({
                      address: token.address as `0x${string}`,
                      abi: erc20ABI,
                      functionName: 'balanceOf',
                      args: [address as `0x${string}`]
                    });
                    
                    if (tokenBalance) {
                      const balance = parseFloat(formatUnits(tokenBalance, token.decimals || 18));
                      
                      if (balance > 0) {
                        actualBalances.push({
                          token_id: token.symbol.toLowerCase(),
                          token_name: token.name,
                          token_symbol: token.symbol,
                          token_logo: token.logo,
                          balance: balance,
                          value_usd: 0, // We would need to fetch price from an API
                          contract_address: token.address
                        });
                      }
                    }
                  }
                } catch (err) {
                  // Log error but don't show toast for development
                  if (!import.meta.env.DEV) {
                    console.error(`Error fetching balance for token ${token.symbol}:`, err);
                  }
                }
              }
            }
          }
        }
        
        // Entferne die Mock-Daten Logik - zeige nur echte Daten
        console.log("Wallet balances:", actualBalances);
        setBalances(actualBalances);
        setTotalValueUsd(actualBalances.reduce((total, token) => total + (token.value_usd || 0), 0));
      } catch (error) {
        console.error('Fehler beim Abrufen der Token-Balances:', error);
        toast.error('Fehler beim Abrufen der Token-Balances');
        
        // Bei Fehlern leeres Array anzeigen - keine Mock-Daten
        setBalances([]);
        setTotalValueUsd(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [isConnected, address, chainId]);

  // Transaktionen abrufen
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!isConnected || !address) {
        setTransactions([]);
        setTransactionsLoading(false);
        return;
      }
      
      try {
        setTransactionsLoading(true);
        
        // TODO: Fetch transactions from Django backend
        const dbTransactions: any[] = [];
        const error = null;
          
        if (error) throw error;
        
        if (chainId === 1) {
          const etherscanApiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
          const etherscanUrl = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${etherscanApiKey}`;
          
          const response = await fetch(etherscanUrl);
          const data = await response.json();
          
          if (data.status === '1' && data.result) {
            const etherscanTxs = data.result.map((tx: {
              hash: string;
              timeStamp: string;
              from: string;
              to: string;
              value: string;
              txreceipt_status: string;
            }) => ({
              id: tx.hash,
              date: new Date(Number(tx.timeStamp) * 1000),
              type: tx.from.toLowerCase() === address.toLowerCase() ? 'send' : 'receive',
              amount: parseFloat(formatUnits(tx.value, 18)),
              token_symbol: 'ETH',
              address: tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from,
              status: tx.txreceipt_status === '1' ? 'completed' : 'failed',
            }));
            
            const combinedTxs = [...(dbTransactions || []), ...etherscanTxs];
            
            combinedTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            setTransactions(combinedTxs);
            setTransactionsLoading(false);
            return;
          }
        }
        
        setTransactions(dbTransactions || []);
      } catch (error) {
        console.error('Fehler beim Abrufen der Transaktionen:', error);
        toast.error('Fehler beim Abrufen der Transaktionen');
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [isConnected, address, chainId]);

  const sendTokens = async (toAddress: string, tokenId: string, amount: number) => {
    if (!isConnected || !address) {
      toast.error('Bitte verbinden Sie Ihre Wallet');
      return false;
    }

    if (!toAddress || !tokenId || !amount) {
      toast.error('Bitte fülle alle Felder aus');
      return false;
    }
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(toAddress)) {
      toast.error('Ungültige Wallet-Adresse');
      return false;
    }
    
    const amountNumber = parseFloat(amount.toString());
    if (isNaN(amountNumber) || amountNumber <= 0) {
      toast.error('Ungültiger Betrag');
      return false;
    }
    
    const token = balances.find(b => b.token_id === tokenId);
    if (!token) {
      toast.error('Token nicht gefunden');
      return false;
    }
    
    if (amountNumber > token.balance) {
      toast.error('Nicht genügend Guthaben');
      return false;
    }
    
    try {
      toast.loading('Transaktion wird vorbereitet...');
      
      // TODO: Implement real blockchain transaction
      // For now, just show that real transactions are not implemented
      toast.error('Echte Blockchain-Transaktionen sind noch nicht implementiert');
      return false;
      
    } catch (error: any) {
      console.error('Fehler beim Senden der Tokens:', error);
      
      if (error.code === 4001) {
        toast.error('Transaktion wurde vom Benutzer abgelehnt');
      } else if (error.message && error.message.includes('insufficient funds')) {
        toast.error('Nicht genügend Guthaben für Transaktionsgebühren');
      } else {
        toast.error(`Fehler beim Senden der Tokens: ${error.message || 'Unbekannter Fehler'}`);
      }
      
      return false;
    }
  };

  return {
    balances,
    transactions,
    totalValueUsd,
    sendTokens,
    isLoading,
    transactionsLoading,
    isConnected,
    address
  };
};
