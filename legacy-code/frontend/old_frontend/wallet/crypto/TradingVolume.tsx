import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatNumber } from "@/utils/formatters";
import LineChartComponent from "../charts/LineChartComponent";

export const TradingVolume = () => {
  const { data: volumeData } = useQuery({
    queryKey: ['trading-volume'],
    queryFn: async () => {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily'
      );
      const data = await response.json();
      return data.total_volumes.map((volume: [number, number]) => ({
        name: new Date(volume[0]).toLocaleDateString(),
        volume: volume[1]
      }));
    },
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Handelsvolumen</h3>
      {volumeData && (
        <LineChartComponent
          data={volumeData}
          lines={[{ key: 'volume', color: '#82ca9d', name: 'Volumen' }]}
          height={200}
        />
      )}
    </Card>
  );
};