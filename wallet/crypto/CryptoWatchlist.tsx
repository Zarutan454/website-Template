import { Card } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { coinGeckoService } from "@/services/coinGeckoService";

export const CryptoWatchlist = () => {
  const { data: watchlistData, isLoading } = useQuery({
    queryKey: ['crypto-watchlist'],
    queryFn: () => coinGeckoService.getTopTokens(3)
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-24 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {watchlistData?.map((item) => (
        <Card 
          key={item.id} 
          className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <img src={item.image} alt={item.name} className="w-8 h-8" />
              <div>
                <p className="text-sm text-muted-foreground">{item.name} ({item.symbol.toUpperCase()})</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{formatNumber(item.current_price)}</span>
                  <span className={`flex items-center ${item.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.price_change_percentage_24h > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(item.price_change_percentage_24h).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Volume 24h</span>
              <span className="font-medium">{formatNumber(item.total_volume)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Market Cap</span>
              <span className="font-medium">{formatNumber(item.market_cap)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
