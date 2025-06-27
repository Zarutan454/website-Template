import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/utils/formatters";

export const MarketPriceStatistics = () => {
  const [timeframe, setTimeframe] = useState('1W');
  const [selectedCrypto, setSelectedCrypto] = useState('Bitcoin');

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market-stats'],
    queryFn: async () => {
      // Mock data for now - replace with real API call
      return {
        price: 43250.75,
        priceChange: 2.5,
        volume: 28500000000,
        marketCap: 845000000000,
        supply: 19500000
      };
    }
  });

  return (
    <Card className="bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="mb-[20px] md:mb-[25px] flex items-center justify-between border-b border-gray-200 dark:border-[#172036] pb-[15px]">
        <h5 className="mb-0 text-black dark:text-white">Market Price Statistics</h5>
        <div className="flex items-center gap-[25px]">
          <div className="hidden sm:flex items-center space-x-2">
            {['1H', '24H', '1W', '1M', '1Y'].map((time) => (
              <button
                key={time}
                onClick={() => setTimeframe(time)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  timeframe === time 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-black dark:text-white">
                {formatNumber(marketData?.price || 0)}
              </span>
              <span className={`flex items-center text-sm ${marketData?.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketData?.priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(marketData?.priceChange || 0)}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">24h Volume</span>
            <div className="text-2xl font-bold text-black dark:text-white">
              {formatNumber(marketData?.volume || 0)}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Market Cap</span>
            <div className="text-2xl font-bold text-black dark:text-white">
              {formatNumber(marketData?.marketCap || 0)}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Circulating Supply</span>
            <div className="text-2xl font-bold text-black dark:text-white">
              {marketData?.supply.toLocaleString()} BTC
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
