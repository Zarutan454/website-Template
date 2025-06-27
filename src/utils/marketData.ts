
/**
 * Utility-Funktionen für Marktdaten und Preisumrechnungen
 */

const API_BASE_URL = 'https://api.coingecko.com/api/v3';

const SYMBOL_TO_ID: Record<string, string> = {
  'ETH': 'ethereum',
  'BTC': 'bitcoin',
  'BNB': 'binancecoin',
  'MATIC': 'matic-network',
  'AVAX': 'avalanche-2',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'ADA': 'cardano',
  'BSN': 'bsn' // Annahme: BSN ist in CoinGecko als "bsn" gelistet
};

// Token-Preise abrufen
export const getTokenPrices = async (symbols: string[] = ['BSN']): Promise<Record<string, number>> => {
  try {
    const supportedSymbols = symbols.filter(symbol => SYMBOL_TO_ID[symbol]);
    
    if (supportedSymbols.length === 0) {
      return { BSN: 0.5 }; // Fallback wenn keine unterstützten Symbole
    }
    
    const ids = supportedSymbols.map(symbol => SYMBOL_TO_ID[symbol]).join(',');
    
    const response = await fetch(`${API_BASE_URL}/simple/price?ids=${ids}&vs_currencies=usd`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    const prices: Record<string, number> = {};
    
    supportedSymbols.forEach(symbol => {
      const id = SYMBOL_TO_ID[symbol];
      if (data[id] && data[id].usd) {
        prices[symbol] = data[id].usd;
      } else {
        if (symbol === 'BSN') prices[symbol] = 0.5;
        else if (symbol === 'ETH') prices[symbol] = 3250;
        else prices[symbol] = 1.0;
      }
    });
    
    if (!prices['BSN'] && symbols.includes('BSN')) {
      prices['BSN'] = 0.5;
    }
    
    return prices;
  } catch (error) {
    return { BSN: 0.5 }; // Fallback-Wert
  }
};

// Token-Wert in USD umrechnen
export const convertTokenToUSD = (amount: number, tokenPrice: number): number => {
  return amount * tokenPrice;
};

// USD in Token umrechnen
export const convertUSDToToken = (usdAmount: number, tokenPrice: number): number => {
  if (tokenPrice <= 0) return 0;
  return usdAmount / tokenPrice;
};

// Token-Preishistorie abrufen
export const getTokenPriceHistory = async (
  symbol: string = 'BSN',
  days: number = 7
): Promise<{ timestamp: number; price: number }[]> => {
  try {
    const coinId = SYMBOL_TO_ID[symbol];
    
    if (!coinId) {
      throw new Error(`Unsupported token symbol: ${symbol}`);
    }
    
    const response = await fetch(
      `${API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.prices && Array.isArray(data.prices)) {
      return data.prices.map((item: [number, number]) => ({
        timestamp: item[0],
        price: item[1]
      }));
    }
    
    throw new Error('Invalid response format from API');
  } catch (error) {
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    
    let basePrice = 0.5; // Default für BSN
    if (symbol === 'ETH') basePrice = 3250;
    else if (symbol === 'BTC') basePrice = 65000;
    else if (symbol === 'BNB') basePrice = 425;
    
    return Array.from({ length: days }).map((_, i) => {
      const trendFactor = Math.sin(i / (days / 2) * Math.PI) * 0.1;
      const randomFactor = (Math.random() - 0.5) * 0.05;
      const price = basePrice * (1 + trendFactor + randomFactor);
      
      return {
        timestamp: now - (days - i - 1) * dayInMs,
        price
      };
    });
  }
};

// Formatiere Währungswert (USD)
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Formatiere Token-Betrag
export const formatTokenAmount = (amount: number, symbol: string = 'BSN'): string => {
  return `${amount.toFixed(4)} ${symbol}`;
};

export default {
  getTokenPrices,
  convertTokenToUSD,
  convertUSDToToken,
  getTokenPriceHistory,
  formatCurrency,
  formatTokenAmount
};
