
// CoinGecko API Service für Marktdaten
interface MarketData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface PriceVolumeData {
  date: string;
  price: number;
  volume: number;
}

export const coinGeckoService = {
  // Holt Marktdaten für eine bestimmte Kryptowährung
  async getMarketData(coinId: string, days: number = 7, vsCurrency: string = 'usd'): Promise<MarketData> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${vsCurrency}&days=${days}`
      );

      if (!response.ok) {
        console.error('CoinGecko API Error:', response.statusText);
        return { prices: [], market_caps: [], total_volumes: [] };
      }

      const data = await response.json();
      return data as MarketData;
    } catch (error) {
      console.error('Error fetching market data:', error);
      return { prices: [], market_caps: [], total_volumes: [] };
    }
  },

  // Holt Token-Preishistorie für einen bestimmten Token-Contract
  async getTokenPriceHistory(contractAddress: string, network: string, days: number = 30): Promise<PriceVolumeData[]> {
    try {
      const platformId = this.getPlatformId(network);
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${platformId}/contract/${contractAddress}/market_chart?vs_currency=usd&days=${days}`
      );

      if (!response.ok) {
        console.error('CoinGecko API Error:', response.statusText);
        return [];
      }

      const data = await response.json();
      
      // Transform the data to include both price and volume
      return data.prices.map((priceData: [number, number], index: number) => ({
        date: new Date(priceData[0]).toISOString().split('T')[0],
        price: priceData[1],
        volume: data.total_volumes[index]?.[1] || 0
      }));
    } catch (error) {
      console.error('Error fetching price history:', error);
      return [];
    }
  },

  // Konvertiert Netzwerknamen zum CoinGecko-Plattform-ID
  getPlatformId(network: string): string {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return 'ethereum';
      case 'bsc':
      case 'binance':
        return 'binance-smart-chain';
      case 'polygon':
        return 'polygon-pos';
      case 'arbitrum':
        return 'arbitrum-one';
      case 'avalanche':
        return 'avalanche';
      case 'solana':
        return 'solana';
      default:
        return 'ethereum';
    }
  }
};
