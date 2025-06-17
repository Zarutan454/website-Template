import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/utils/formatters";
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react";
import { Loader2 } from "lucide-react";

interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  circulating_supply: number;
  image: string;
}

export const CryptoRankings = () => {
  const { data: cryptoData, isLoading } = useQuery({
    queryKey: ['cryptoRankings'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
      );
      return response.json();
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
      <div className="mb-[20px] md:mb-[25px] sm:flex items-center justify-between">
        <h5 className="mb-0">Crypto Rankings</h5>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="font-medium text-xs text-left px-[14px] pb-[7px] whitespace-nowrap">#</th>
              <th className="font-medium text-xs text-left px-[14px] pb-[7px] whitespace-nowrap">Cryptocurrency</th>
              <th className="font-medium text-xs text-right px-[14px] pb-[7px] whitespace-nowrap">Price</th>
              <th className="font-medium text-xs text-right px-[14px] pb-[7px] whitespace-nowrap">24h %</th>
              <th className="font-medium text-xs text-right px-[14px] pb-[7px] whitespace-nowrap">Market Cap</th>
              <th className="font-medium text-xs text-right px-[14px] pb-[7px] whitespace-nowrap">Volume(24h)</th>
              <th className="font-medium text-xs text-right px-[14px] pb-[7px] whitespace-nowrap">Circulating Supply</th>
            </tr>
          </thead>
          <tbody className="text-black dark:text-white">
            {cryptoData?.map((crypto: CryptoData, index: number) => (
              <tr key={crypto.id}>
                <td className="text-left whitespace-nowrap px-[14px] first:pl-0 py-[10px] border-b border-gray-100 dark:border-[#172036]">
                  {index + 1}
                </td>
                <td className="text-left whitespace-nowrap px-[14px] py-[10px] border-b border-gray-100 dark:border-[#172036]">
                  <div className="flex items-center">
                    <div className="w-[22px]">
                      <img alt={crypto.name} src={crypto.image} className="w-5 h-5" />
                    </div>
                    <span className="block font-medium ml-[8px]">
                      {crypto.name}
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-normal ml-1">
                        ({crypto.symbol.toUpperCase()})
                      </span>
                    </span>
                  </div>
                </td>
                <td className="font-medium text-right whitespace-nowrap px-[14px] py-[10px] border-b border-gray-100 dark:border-[#172036]">
                  {formatNumber(crypto.current_price)}
                </td>
                <td className={`font-medium text-right whitespace-nowrap px-[14px] py-[10px] border-b border-gray-100 dark:border-[#172036] ${
                  crypto.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  <div className="flex items-center justify-end gap-1">
                    {crypto.price_change_percentage_24h > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(crypto.price_change_percentage_24h).toFixed(2)}%
                  </div>
                </td>
                <td className="font-medium text-right whitespace-nowrap px-[14px] py-[10px] border-b border-gray-100 dark:border-[#172036]">
                  {formatNumber(crypto.market_cap)}
                </td>
                <td className="font-medium text-right whitespace-nowrap px-[14px] py-[10px] border-b border-gray-100 dark:border-[#172036]">
                  {formatNumber(crypto.total_volume)}
                </td>
                <td className="font-medium text-right whitespace-nowrap px-[14px] last:pr-0 py-[10px] border-b border-gray-100 dark:border-[#172036]">
                  {Math.round(crypto.circulating_supply).toLocaleString()} {crypto.symbol.toUpperCase()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pt-[10px] sm:flex sm:items-center justify-between">
        <p className="mb-0 text-sm">Showing 10 of top cryptocurrencies</p>
        <div className="mt-[10px] sm:mt-0">
          <nav className="flex items-center space-x-1">
            <button className="w-[31px] h-[31px] flex items-center justify-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="w-[31px] h-[31px] flex items-center justify-center rounded-md border border-primary-500 bg-primary-500 text-white">
              1
            </button>
            <button className="w-[31px] h-[31px] flex items-center justify-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500">
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </Card>
  );
};