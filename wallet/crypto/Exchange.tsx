import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowDownUp, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { coinGeckoService } from "@/services/coinGeckoService";

export const Exchange = () => {
  const [amount, setAmount] = useState<string>("");
  const [convertedAmount, setConvertedAmount] = useState<string>("");
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const price = await coinGeckoService.getPrice('ethereum');
        setEthPrice(price);
        setError(null);
      } catch (err) {
        console.error('Error fetching ETH price:', err);
        setError('Failed to load exchange rates');
        toast({
          title: "Error loading exchange rates",
          description: "Please try again later",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [toast]);

  const handleExchange = (value: string, type: 'ETH' | 'USD') => {
    if (!ethPrice) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setAmount("");
      setConvertedAmount("");
      return;
    }

    if (type === 'ETH') {
      setAmount(value);
      setConvertedAmount((numValue * ethPrice).toFixed(2));
    } else {
      setAmount(value);
      setConvertedAmount((numValue / ethPrice).toFixed(6));
    }
  };

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">{error}</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Exchange Calculator</h2>
        <p className="text-sm text-gray-500">Convert between ETH and USD</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ETH Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => handleExchange(e.target.value, 'ETH')}
              min="0"
              step="0.000001"
            />
          </div>

          <div className="flex justify-center">
            <ArrowDownUp className="h-6 w-6 text-gray-400" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">USD Amount</label>
            <Input
              type="number"
              placeholder="0.00"
              value={convertedAmount}
              onChange={(e) => handleExchange(e.target.value, 'USD')}
              min="0"
              step="0.01"
            />
          </div>

          {ethPrice && (
            <div className="text-sm text-gray-500 text-center mt-4">
              1 ETH = ${ethPrice.toFixed(2)} USD
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
