
import { useState } from "react";
import { useTokenLocking } from "@/hooks/useTokenLocking";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { trackTransaction } from "@/services/transactions/transactionTracker";

interface TokenLockFormProps {
  tokenId: string;
  contractAddress: string;
  onSuccess?: () => void;
}

export function RegularTokenLockForm({ tokenId, contractAddress, onSuccess }: TokenLockFormProps) {
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("");
  const { createLock, isLoading } = useTokenLocking(contractAddress, 1);
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
      await createLock({
        amount,
        duration: Number(duration),
        beneficiary: contractAddress
      });
      
      onSuccess?.();
    } catch (error) {
      console.error("Error locking tokens:", error);
      toast({
        title: "Error",
        description: "Failed to lock tokens. Please try again.",
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
        {isLoading ? "Locking..." : "Lock Tokens"}
      </Button>
    </form>
  );
}
