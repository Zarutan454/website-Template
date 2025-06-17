
import { Token } from "@/types/token";
import { TokenMetricsCards } from "./TokenMetricsCards";
import { PriceChartSection } from "./PriceChartSection";
import { VolumeChartSection } from "./VolumeChartSection";
import { LiquidityMetrics } from "./LiquidityMetrics";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface AdvancedAnalyticsDashboardProps {
  token: Token;
}

export const AdvancedAnalyticsDashboard = ({ token }: AdvancedAnalyticsDashboardProps) => {
  const [timeRange, setTimeRange] = useState("24h");
  
  // Mock data for liquidity metrics
  const liquidityMetrics = {
    liquidityUSD: token.token_metrics?.liquidity_usd || 100000,
    liquidityChange24h: 2.5,
    roi24h: 1.8,
    roi7d: 5.2,
    roi30d: 12.4
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
      
      <TokenMetricsCards token={token} />
      
      <LiquidityMetrics {...liquidityMetrics} />
      
      <Tabs defaultValue="charts" className="mt-6">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="holders">Holders</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <PriceChartSection 
              token={token} 
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
            />
            <VolumeChartSection 
              token={token} 
              timeRange={timeRange}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Transaction History</h3>
            <p className="text-muted-foreground">
              Transaction history feature will be available soon.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="holders">
          <div className="rounded-lg border p-6">
            <h3 className="text-lg font-medium mb-4">Token Holders</h3>
            <p className="text-muted-foreground">
              Token holders analytics will be available soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
