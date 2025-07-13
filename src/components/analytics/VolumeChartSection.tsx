
import { Token } from "@/types/token";
import { VolumeChart } from "./VolumeChart";
import { useMemo } from "react";

interface VolumeChartSectionProps {
  token: Token;
  timeRange?: string;
}

export const VolumeChartSection = ({ token, timeRange = "24h" }: VolumeChartSectionProps) => {
  // Generate sample volume data based on current volume
  const volumeData = useMemo(() => {
    const currentVolume = token.token_metrics?.volume_24h || 1000;
    const dataPoints = 20;
    
    // Different variations based on time range
    const variation = timeRange === "24h" ? 0.3 : 
                       timeRange === "7d" ? 0.5 :
                       timeRange === "30d" ? 0.7 : 0.9;
    
    // Generate data points with random variations around the current volume
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
      
      // Random volume variation within the defined range
      const randomFactor = 0.5 + Math.random() * variation * 2;
      const volume = currentVolume * randomFactor;
      
      return {
        date: date.toISOString(),
        volume
      };
    });
  }, [token.token_metrics?.volume_24h, timeRange]);

  return <VolumeChart data={volumeData} />;
};
