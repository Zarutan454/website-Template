import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { coinGeckoService } from "@/services/coinGeckoService";
import { formatNumber } from "@/utils/formatters";

export const NFTVolume = () => {
  const { data: volumeData } = useQuery({
    queryKey: ['nft-volume'],
    queryFn: () => coinGeckoService.getTopTokens(7),
    refetchInterval: 30000
  });

  const data = volumeData?.map((token) => ({
    name: token.symbol.toUpperCase(),
    volume: token.total_volume
  })) || [];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Handelsvolumen</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value: number) => formatNumber(value)} />
            <Tooltip 
              formatter={(value: number) => [formatNumber(value), 'Volume']}
            />
            <Bar dataKey="volume" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};