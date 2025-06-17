
import { TokenMetricsCards } from "@/components/analytics/TokenMetricsCards";
import { PriceChart } from "@/components/analytics/PriceChart";
import { VolumeChart } from "@/components/analytics/VolumeChart";
import { useTokenAnalytics } from "@/hooks/useTokenAnalytics";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Token } from "@/types/token";

interface TokenAnalyticsDashboardProps {
  tokenId: string;
}

export const TokenAnalyticsDashboard = ({ tokenId }: TokenAnalyticsDashboardProps) => {
  const { 
    analytics, 
    isLoading, 
    error,
    timeRange,
    setTimeRange 
  } = useTokenAnalytics(tokenId);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-[200px] w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          Failed to load analytics data
        </p>
      </Card>
    );
  }

  const chartData = analytics?.priceHistory?.map(point => ({
    date: point.date,
    price: point.price,
    volume: analytics.volumeHistory.find(v => v.date === point.date)?.volume || 0
  })) || [];

  // Convert TokenAnalytics to Token type for TokenMetricsCards
  const tokenData: Token = {
    id: analytics?.token_id || '',
    creator_id: '',
    name: '',
    symbol: '',
    initial_supply: 0,
    contract_address: '',
    network: '',
    status: '',
    created_at: '',
    updated_at: '',
    token_type: '',
    can_mint: false,
    can_burn: false,
    decimals: 18,
    token_metrics: {
      price_usd: analytics?.price_usd || null,
      volume_24h: analytics?.volume_24h || null,
      market_cap: analytics?.market_cap || null,
      holder_count: analytics?.holder_count || null,
      liquidity_usd: analytics?.liquidity_usd || null,
    },
    token_verification_status: [],
    is_verified: false,
    logo_url: null,
    verification_date: null,
    verification_details: null,
    social_links: {
      discord: null,
      twitter: null,
      telegram: null
    },
    layer_2_bridge_address: null,
    layer_2_network_type: null,
    layer_2_deployment_status: '',
    marketing_wallet: null,
    charity_wallet: null,
    dev_wallet: null,
    buy_tax: null,
    sell_tax: null,
    max_transaction_limit: null,
    max_wallet_limit: null,
    description: null,
    max_supply: null
  };

  return (
    <div className="grid gap-4">
      <TokenMetricsCards token={tokenData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PriceChart 
          data={chartData}
          isLoading={isLoading}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          error={error ? String(error) : null}
        />
        <VolumeChart 
          data={chartData}
          isLoading={isLoading}
          error={error ? String(error) : null}
        />
      </div>
    </div>
  );
};
