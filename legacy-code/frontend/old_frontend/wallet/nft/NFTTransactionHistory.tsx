import { Card } from "@/components/ui/card";
import { formatNumber } from "@/utils/formatters";

export const NFTTransactionHistory = () => {
  const transactions = [
    {
      id: 1,
      nft: "Bored Ape #7865",
      collection: "BAYC",
      price: 80.5,
      from: "0x1234...5678",
      to: "0x8765...4321",
      time: "2 hours ago"
    },
    {
      id: 2,
      nft: "CryptoPunk #2134",
      collection: "CryptoPunks",
      price: 120.3,
      from: "0x2345...6789",
      to: "0x9876...5432",
      time: "3 hours ago"
    },
    {
      id: 3,
      nft: "Doodle #4325",
      collection: "Doodles",
      price: 15.75,
      from: "0x3456...7890",
      to: "0x0987...6543",
      time: "5 hours ago"
    }
  ];

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted-foreground">
              <th className="pb-2">NFT</th>
              <th className="pb-2">Price</th>
              <th className="pb-2 hidden md:table-cell">From</th>
              <th className="pb-2 hidden md:table-cell">To</th>
              <th className="pb-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t">
                <td className="py-3">
                  <div>
                    <p className="font-medium">{tx.nft}</p>
                    <p className="text-sm text-muted-foreground">{tx.collection}</p>
                  </div>
                </td>
                <td className="py-3">{formatNumber(tx.price)} ETH</td>
                <td className="py-3 hidden md:table-cell">{tx.from}</td>
                <td className="py-3 hidden md:table-cell">{tx.to}</td>
                <td className="py-3">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};