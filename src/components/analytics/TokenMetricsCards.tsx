
import { Card } from "@/components/ui/card";
import { Token } from "@/types/token";
import { formatNumber } from "@/utils/formatters";

interface TokenMetricsCardsProps {
  token: Token;
}

export const TokenMetricsCards = ({ token }: TokenMetricsCardsProps) => {
  const metrics = token.token_metrics || {
    price_usd: null,
    volume_24h: null,
    market_cap: null,
    holder_count: null,
    liquidity_usd: null
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Price (USD)</h3>
        <p className="mt-2 text-3xl font-semibold">${formatNumber(metrics.price_usd || 0)}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">24h Volume</h3>
        <p className="mt-2 text-3xl font-semibold">${formatNumber(metrics.volume_24h || 0)}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Market Cap</h3>
        <p className="mt-2 text-3xl font-semibold">${formatNumber(metrics.market_cap || 0)}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-500">Holders</h3>
        <p className="mt-2 text-3xl font-semibold">{formatNumber(metrics.holder_count || 0)}</p>
      </Card>
    </div>
  );
};
