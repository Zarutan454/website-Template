
import { useState } from "react";
import { useTokenLocking } from "@/hooks/useTokenLocking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { trackTransaction } from "@/services/transactions/transactionTracker";

interface LiquidityLockFormProps {
  tokenId: string;
  onSuccess?: () => void;
}

export function LiquidityLockForm({ tokenId, onSuccess }: LiquidityLockFormProps) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const { createLock, isLoading } = useTokenLocking(tokenId, 1); // Using chainId 1 for Ethereum
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !duration) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await trackTransaction({
        token_id: tokenId,
        transaction_hash: "",
        transaction_type: "liquidity_lock",
        status: "pending",
        network: "ethereum",
      });

      await createLock({
        amount,
        duration: Number(duration),
        beneficiary: tokenId // Using token address as beneficiary for liquidity locks
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error locking liquidity:", error);
      toast({
        title: "Error",
        description: "Failed to lock liquidity. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          placeholder="Enter amount to lock"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0"
          step="any"
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Lock Duration (days)</Label>
        <Input
          id="duration"
          type="number"
          placeholder="Enter lock duration in days"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min="1"
          className="w-full"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "Locking..." : "Lock Liquidity"}
      </Button>
    </form>
  );
}
