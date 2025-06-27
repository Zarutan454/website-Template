import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { coinGeckoService } from "@/services/coinGeckoService";

export const NFTChart = () => {
  const [timeRange, setTimeRange] = useState('7');
  
  const { data: marketData } = useQuery({
    queryKey: ['market-data', timeRange],
    queryFn: () => coinGeckoService.getMarketData('ethereum'),
    refetchInterval: 60000 // Aktualisiere jede Minute
  });

  const chartData = marketData?.prices.map(([timestamp, price]) => ({
    date: timestamp,
    price: price
  })) || [];

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">NFT Preisverlauf</h3>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Zeitraum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">24 Stunden</SelectItem>
            <SelectItem value="7">7 Tage</SelectItem>
            <SelectItem value="30">30 Tage</SelectItem>
            <SelectItem value="90">90 Tage</SelectItem>
            <SelectItem value="365">1 Jahr</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis />
            <Tooltip 
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
              formatter={(value: number) => [`${value.toFixed(2)} ETH`, 'Preis']}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#8884d8" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
