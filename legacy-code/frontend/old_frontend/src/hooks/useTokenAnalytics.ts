
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TokenWithJSONB } from "@/types/token";

export interface TokenAnalytics {
  token_id: string;
  price_usd: number;
  volume_24h: number;
  market_cap: number;
  holder_count: number;
  liquidity_usd: number;
  priceHistory: { date: string; price: number }[];
  volumeHistory: { date: string; volume: number }[];
}

export const useTokenAnalytics = (tokenId: string) => {
  const [timeRange, setTimeRange] = useState<string>("24h");

  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ["tokenAnalytics", tokenId, timeRange],
    queryFn: async (): Promise<TokenAnalytics | null> => {
      if (!tokenId) return null;

      try {
        // Fetch basic token data
        const { data: token, error: tokenError } = await supabase
          .from("tokens")
          .select("*")
          .eq("id", tokenId)
          .single();

        if (tokenError) throw tokenError;

        // Wandle token in TokenWithJSONB Typ um
        const tokenWithMetrics = token as unknown as TokenWithJSONB;
        
        // Parsen der JSONB-Daten wenn nötig
        let metrics = typeof tokenWithMetrics.token_metrics === 'string' 
          ? JSON.parse(tokenWithMetrics.token_metrics) 
          : tokenWithMetrics.token_metrics || {};

        // Für den Fall, dass token_metrics null oder nicht vorhanden ist
        if (!metrics) {
          metrics = {
            price_usd: null,
            volume_24h: null,
            market_cap: null,
            holder_count: null,
            liquidity_usd: null
          };
        }

        const { data: historyData, error: historyError } = await supabase
          .from("token_price_history")
          .select("*")
          .eq("token_id", tokenId)
          .order("timestamp", { ascending: true });
          
        if (historyError) {
        }
        
        let filteredHistory = historyData || [];
        const now = new Date();
        let cutoffDate = new Date();
        
        if (timeRange === "24h") {
          cutoffDate.setHours(now.getHours() - 24);
        } else if (timeRange === "7d") {
          cutoffDate.setDate(now.getDate() - 7);
        } else if (timeRange === "30d") {
          cutoffDate.setDate(now.getDate() - 30);
        } else {
          cutoffDate.setDate(now.getDate() - 90);
        }
        
        filteredHistory = filteredHistory.filter(item => 
          new Date(item.timestamp) >= cutoffDate
        );
        
        let priceHistory = [];
        let volumeHistory = [];
        
        if (filteredHistory.length > 0) {
          priceHistory = filteredHistory.map(item => ({
            date: item.timestamp,
            price: item.price_usd
          }));
          
          volumeHistory = filteredHistory.map(item => ({
            date: item.timestamp,
            volume: item.volume_24h
          }));
        } else {
          priceHistory = generateHistoricalData(timeRange, metrics.price_usd || 1, 'price');
          volumeHistory = generateHistoricalData(timeRange, metrics.volume_24h || 1000, 'volume');
        }
        
        const analytics: TokenAnalytics = {
          token_id: tokenId,
          price_usd: metrics.price_usd || 0.01,
          volume_24h: metrics.volume_24h || 0,
          market_cap: metrics.market_cap || 0,
          holder_count: metrics.holder_count || 0,
          liquidity_usd: metrics.liquidity_usd || 0,
          priceHistory,
          volumeHistory
        };

        return analytics;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!tokenId,
  });

  return {
    analytics,
    isLoading,
    error,
    timeRange,
    setTimeRange,
  };
};

const generateHistoricalData = (timeRange: string, baseValue: number, type: 'price' | 'volume') => {
  const points = timeRange === "24h" ? 24 : 
                 timeRange === "7d" ? 7 : 
                 timeRange === "30d" ? 30 : 90;
  
  const volatility = type === 'price' ? 
                    (timeRange === "24h" ? 0.03 : 
                     timeRange === "7d" ? 0.07 : 
                     timeRange === "30d" ? 0.12 : 0.2) :
                    (timeRange === "24h" ? 0.2 : 
                     timeRange === "7d" ? 0.3 : 
                     timeRange === "30d" ? 0.4 : 0.5);
  
  return Array.from({ length: points }).map((_, index) => {
    const date = new Date();
    if (timeRange === "24h") {
      date.setHours(date.getHours() - (points - index));
    } else {
      date.setDate(date.getDate() - (points - index));
    }
    
    const trend = Math.sin(index / 5) * volatility;
    const randomFactor = (Math.random() - 0.5) * volatility;
    const value = baseValue * (1 + trend + randomFactor);
    
    if (type === 'price') {
      return {
        date: date.toISOString(),
        price: value > 0 ? value : baseValue * 0.1  // Ensure price is positive
      };
    } else {
      const dayFactor = Math.sin((date.getHours() / 24) * Math.PI) * 0.5 + 0.5;
      return {
        date: date.toISOString(),
        volume: value * dayFactor > 0 ? value * dayFactor : baseValue * 0.1
      };
    }
  });
};
