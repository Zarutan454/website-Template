import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, BarChart2, DollarSign } from "lucide-react";
import { formatNumber } from "@/utils/formatters";

interface MarketOverviewProps {
  data: {
    totalVolume: number;
    marketCap: number;
    dominance: {
      btc: number;
      eth: number;
    };
  }
}

export const MarketOverview = ({ data }: MarketOverviewProps) => {
  return (
    <Card className="p-4 md:p-6 bg-white dark:bg-[#15203c]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
          <BarChart2 className="w-5 h-5 text-primary-500" />
          Marktübersicht
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-[#1a2544] rounded-lg p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Marktkapitalisierung</span>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white block">${(data.marketCap / 1e12).toFixed(2)}T</span>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+2.4%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a2544] rounded-lg p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <img 
              src="/assets/images/cryptocurrencies/bitcoin.svg" 
              className="w-5 h-5" 
              alt="BTC"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">BTC Dominanz</span>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white block">{data.dominance.btc}%</span>
            <div className="flex items-center gap-1 text-red-500">
              <TrendingDown className="w-4 h-4" />
              <span>-0.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#1a2544] rounded-lg p-4 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-5 h-5 text-primary-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">24h Volumen</span>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white block">{formatNumber(data.totalVolume)}</span>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span>+5.2%</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};