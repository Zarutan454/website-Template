interface PriceVolumeData {
  date: string;
  price: number;
  volume: number;
}

export const coinGeckoService = {
  async getTokenPriceHistory(contractAddress: string, network: string, days: number = 30): Promise<PriceVolumeData[]> {
    try {
      const platformId = getPlatformId(network);
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
  }
};

function getPlatformId(network: string): string {
  switch (network.toLowerCase()) {
    case 'ethereum':
      return 'ethereum';
    case 'bsc':
    case 'binance':
      return 'binance-smart-chain';
    case 'polygon':
      return 'polygon-pos';
    default:
      return 'ethereum';
  }
}
