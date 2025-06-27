import { Card } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";

export const NFTRankings = () => {
  const rankings = [
    { rank: 1, name: "Bored Ape #7865", price: "80.5", change: "+12.5%" },
    { rank: 2, name: "CryptoPunk #2134", price: "120.3", change: "-5.3%" },
    { rank: 3, name: "Doodle #4325", price: "15.75", change: "+8.7%" },
    { rank: 4, name: "Azuki #1234", price: "25.8", change: "+3.2%" },
    { rank: 5, name: "CloneX #5678", price: "18.5", change: "-2.1%" }
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Top Rankings</h3>
      <div className="space-y-4">
        {rankings.map((item) => (
          <div key={item.rank} className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="w-6 text-muted-foreground">#{item.rank}</span>
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="font-medium">{formatNumber(parseFloat(item.price))} ETH</p>
              <p className={item.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}>
                {item.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
