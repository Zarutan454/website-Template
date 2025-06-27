
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ArrowUp, ArrowDown } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { coinGeckoService } from "@/services/coinGeckoService";

export const TopMovers = () => {
  const { data: topMovers, isLoading } = useQuery({
    queryKey: ['top-movers'],
    queryFn: () => coinGeckoService.getTopTokens(5),
    staleTime: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Top Movers (24h)</h3>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
                <div className="w-16 h-4 bg-gray-200 rounded" />
              </div>
              <div className="w-12 h-4 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top Movers (24h)</h3>
      <div className="space-y-4">
        {topMovers?.map((coin) => (
          <div key={coin.id} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={coin.image} alt={coin.name} className="w-6 h-6" />
              <span className="font-medium">{coin.symbol.toUpperCase()}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{formatNumber(coin.current_price)}</span>
              <div className={`flex items-center gap-1 ${
                coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {coin.price_change_percentage_24h > 0 ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>{Math.abs(coin.price_change_percentage_24h).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

