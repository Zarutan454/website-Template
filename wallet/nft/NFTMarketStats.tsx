
import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Activity, Users, DollarSign, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { coinGeckoService } from "@/services/coinGeckoService";
import { formatNumber } from "@/utils/formatters";

export const NFTMarketStats = () => {
  const { data: topTokens } = useQuery({
    queryKey: ['top-tokens'],
    queryFn: () => coinGeckoService.getTopTokens(4),
    refetchInterval: 30000
  });

  const stats = [
    {
      title: "24h Volumen",
      value: topTokens?.[0]?.total_volume ? formatNumber(topTokens[0].total_volume) : "Loading...",
      change: "+12.5%",
      isPositive: true,
      icon: Activity
    },
    {
      title: "Floor Price",
      value: topTokens?.[0]?.current_price ? `${formatNumber(topTokens[0].current_price)} ETH` : "Loading...",
      change: "-2.3%",
      isPositive: false,
      icon: DollarSign
    },
    {
      title: "Unique Holders",
      value: "12.5K",
      change: "+5.2%",
      isPositive: true,
      icon: Users
    },
    {
      title: "Total Sales",
      value: "458",
      change: "+8.1%",
      isPositive: true,
      icon: Wallet
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4 bg-white hover:bg-gray-50 transition-colors duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              <div className={`flex items-center mt-1 ${
                stat.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.isPositive ? (
                  <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                  <ArrowDown className="w-4 h-4 mr-1" />
                )}
                <span>{stat.change}</span>
              </div>
            </div>
            <div className="bg-[#E4E6E9] p-3 rounded-lg">
              <stat.icon className="w-6 h-6 text-[#050505]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
