
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";
import { TrendingDown, TrendingUp } from "lucide-react";

interface WatchlistItem {
  name: string;
  collection: string;
  price: number;
  change: number;
  image: string;
  graphColor: string;
}

const watchlistData: WatchlistItem[] = [
  {
    name: "Bored Ape #7865",
    collection: "BAYC",
    price: 80.5,
    change: -2.21,
    image: "/src/assets/images/nfts/nft1.gif",
    graphColor: "bg-[#F7931A]/10"
  },
  {
    name: "CryptoPunk #2134",
    collection: "CryptoPunks",
    price: 120.3,
    change: 2.3,
    image: "/src/assets/images/nfts/nft2.jpg",
    graphColor: "bg-[#605DFF]/10"
  },
  {
    name: "Doodle #4325",
    collection: "Doodles",
    price: 15.75,
    change: -1.2,
    image: "/src/assets/images/nfts/nft3.gif",
    graphColor: "bg-[#AD63F6]/10"
  }
];

export const NFTWatchlist = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Watchlist</h3>
      {watchlistData.map((item) => (
        <Card key={item.name} className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${item.graphColor}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
              <div>
                <p className="text-sm text-muted-foreground">{item.collection}</p>
                <p className="font-medium">{item.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{formatNumber(item.price)} ETH</span>
                  <span className={`flex items-center ${item.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {item.change > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {Math.abs(item.change)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
