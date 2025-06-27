import axios from 'axios';

interface GasPrice {
  network: string;
  fast: number;
  standard: number;
  slow: number;
}

interface TokenPrice {
  usd: number;
  usd_24h_change: number;
  last_updated_at: number;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
}

// Cache für Token-Preise
const tokenPriceCache = new Map<string, { price: TokenPrice; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 Minuten Cache-Dauer

export const apiService = {
  async getGasPrice(network: string): Promise<GasPrice | null> {
    try {
      // Für Demo-Zwecke simulieren wir Gaspreise
      // In einer echten Implementierung würden wir hier eine API abfragen oder Supabase nutzen
      
      let multiplier = 1;
      if (network === 'ethereum') {
        multiplier = 1.5;
      } else if (network === 'sepolia') {
        multiplier = 0.8;
      }
      
      return {
        network,
        fast: Math.round(25 * multiplier),
        standard: Math.round(18 * multiplier),
        slow: Math.round(12 * multiplier)
      };
      
      // Für eine echte Implementierung würden wir das über Supabase oder direkt von Etherscan abrufen
      /*
      const { data, error } = await supabase
        .from('gas_prices')
        .select('*')
        .eq('network', network)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        network: data.network,
        fast: Number(data.fast_gwei),
        standard: Number(data.standard_gwei),
        slow: Number(data.slow_gwei)
      };
      */
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return null;
    }
  },

  async getTokenPrice(contractAddress: string, network: string): Promise<TokenPrice | null> {
    try {
      const cacheKey = `${network}-${contractAddress}`;
      const cachedData = tokenPriceCache.get(cacheKey);
      const now = Date.now();

      if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
        console.log('Returning cached token price data');
        return cachedData.price;
      }

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/token_price/${network}?contract_addresses=${contractAddress}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
        {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'public, max-age=300'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch token price');
      
      const data = await response.json();
      const price = data[contractAddress.toLowerCase()];

      if (price) {
        tokenPriceCache.set(cacheKey, {
          price,
          timestamp: now
        });
      }

      return price || null;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  },

  async getTransactionHistory(address: string, chainId: number): Promise<Transaction[]> {
    try {
      const cacheKey = `transactions-${address}-${chainId}`;
      const cachedData = localStorage.getItem(cacheKey);
      const now = Date.now();

      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if ((now - timestamp) < CACHE_DURATION) {
          console.log('Returning cached transaction history');
          return data;
        }
      }

      const { data: { api_key } } = await axios.get('/api/user/api-key/').then(res => res.data);

      console.log("Fetching transactions for address:", address, "on chain ID:", chainId);
      
      const apiUrl = chainId === 1
        ? 'https://api.etherscan.io/api'
        : 'https://api-holesky.etherscan.io/api';
      
      const response = await fetch(
        `${apiUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${api_key}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch transactions from Etherscan');
      }

      const data = await response.json();
      console.log("Etherscan API response:", data);

      if (data.status === "1" && data.result) {
        const transactions = data.result.map((tx: any) => ({
          hash: tx.hash,
          from: tx.from,
          to: tx.to || "Contract Creation",
          value: tx.value,
          timestamp: parseInt(tx.timeStamp)
        }));

        localStorage.setItem(cacheKey, JSON.stringify({
          data: transactions,
          timestamp: now
        }));

        return transactions;
      }

      return [];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }
};
