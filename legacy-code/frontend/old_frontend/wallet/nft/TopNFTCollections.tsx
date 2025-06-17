
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";
import { TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { coinGeckoService } from "@/services/coinGeckoService";

export const TopNFTCollections = () => {
  const { data: topTokens } = useQuery({
    queryKey: ['top-nft-collections'],
    queryFn: () => coinGeckoService.getTopTokens(5),
    refetchInterval: 30000
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 rounded-lg bg-purple-100">
          <Trophy className="w-5 h-5 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold">Top Collections</h3>
      </div>
      
      <div className="space-y-3">
        {topTokens?.map((token) => (
          <div 
            key={token.id} 
            className="flex items-center justify-between p-3 hover:bg-purple-50 rounded-xl transition-all duration-200 border border-transparent hover:border-purple-100"
          >
            <div className="flex items-center gap-3">
              <img 
                src={token.image} 
                alt={token.name} 
                className="w-10 h-10 rounded-full ring-2 ring-purple-100" 
              />
              <div>
                <p className="font-medium text-gray-900">{token.name}</p>
                <p className="text-sm text-gray-500">
                  Floor: {formatNumber(token.current_price)} ETH
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">Vol: {formatNumber(token.total_volume)}</p>
              <div className={`flex items-center gap-1 text-sm ${
                token.price_change_percentage_24h >= 0 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}>
                {token.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>{Math.abs(token.price_change_percentage_24h).toFixed(2)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
