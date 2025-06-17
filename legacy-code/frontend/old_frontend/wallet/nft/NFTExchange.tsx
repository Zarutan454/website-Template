import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const NFTExchange = () => {
  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Quick Trade</h3>
      <div className="space-y-4">
        <Button className="w-full" variant="outline">Buy NFT</Button>
        <Button className="w-full" variant="outline">Sell NFT</Button>
        <Button className="w-full">Connect Wallet</Button>
      </div>
    </Card>
  );
};