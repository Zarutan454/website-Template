import { Card } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";

export const NFTPriceStatistics = () => {
  const stats = [
    { label: "24h Volume", value: "12,543.21", change: "+5.2%" },
    { label: "Floor Price", value: "82.5", change: "-2.1%" },
    { label: "Market Cap", value: "1.2B", change: "+3.4%" },
    { label: "Items", value: "10,000", change: "0%" }
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Price Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
            <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-500' : stat.change === '0%' ? 'text-gray-500' : 'text-red-500'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
};
