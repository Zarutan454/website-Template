
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";
import { Droplets, TrendingUp, Wallet } from "lucide-react";

interface LiquidityMetricsProps {
  liquidityUSD: number;
  liquidityChange24h: number;
  roi24h: number;
  roi7d: number;
  roi30d: number;
}

export const LiquidityMetrics = ({
  liquidityUSD,
  liquidityChange24h,
  roi24h,
  roi7d,
  roi30d
}: LiquidityMetricsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Liquidität (USD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Droplets className="h-4 w-4 text-white/70" />
            <span className="text-2xl font-bold text-white">
              ${formatNumber(liquidityUSD)}
            </span>
          </div>
          <div className="mt-2 text-sm text-white/70">
            24h: {liquidityChange24h > 0 ? "+" : ""}{liquidityChange24h}%
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500 to-green-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white">
            ROI (24h/7d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <TrendingUp className="h-4 w-4 text-white/70" />
            <span className="text-2xl font-bold text-white">
              {roi24h > 0 ? "+" : ""}{roi24h}%
            </span>
          </div>
          <div className="mt-2 text-sm text-white/70">
            7d: {roi7d > 0 ? "+" : ""}{roi7d}%
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500 to-purple-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-white">
            ROI (30d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Wallet className="h-4 w-4 text-white/70" />
            <span className="text-2xl font-bold text-white">
              {roi30d > 0 ? "+" : ""}{roi30d}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
