
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Token } from "@/types/token";
import { PriceChart } from "./PriceChart";
import { useMemo } from "react";

interface PriceChartSectionProps {
  token: Token;
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

export const PriceChartSection = ({ 
  token, 
  timeRange = "24h",
  onTimeRangeChange
}: PriceChartSectionProps) => {
  // Generate sample historical data based on current price
  const priceData = useMemo(() => {
    const currentPrice = token.token_metrics?.price_usd || 0;
    const dataPoints = 20;
    
    // Different variations based on time range
    const variation = timeRange === "24h" ? 0.02 : 
                       timeRange === "7d" ? 0.05 :
                       timeRange === "30d" ? 0.1 : 0.2;
    
    // Generate data points with random variations around the current price
    return Array.from({ length: dataPoints }).map((_, index) => {
      // Create date based on timeRange
      const date = new Date();
      if (timeRange === "24h") {
        date.setHours(date.getHours() - (dataPoints - index));
      } else if (timeRange === "7d") {
        date.setDate(date.getDate() - 7 + (index / (dataPoints - 1)) * 7);
      } else if (timeRange === "30d") {
        date.setDate(date.getDate() - 30 + (index / (dataPoints - 1)) * 30);
      } else {
        date.setDate(date.getDate() - 90 + (index / (dataPoints - 1)) * 90);
      }
      
      // Random price variation within the defined range
      const randomFactor = 1 + (Math.random() * variation * 2 - variation);
      const price = currentPrice * randomFactor;
      
      return {
        date: date.toISOString(),
        price
      };
    });
  }, [token.token_metrics?.price_usd, timeRange]);

  return (
    <PriceChart 
      data={priceData} 
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
    />
  );
};
