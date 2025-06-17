
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

interface WalletLoginSectionProps {
  onWalletLogin: () => void;
  isLoading: boolean;
}

export const WalletLoginSection = ({ onWalletLogin, isLoading }: WalletLoginSectionProps) => {
  return (
    <div className="space-y-4">
      <Button
        onClick={onWalletLogin}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        <Wallet className="mr-2 h-4 w-4" />
        Mit Wallet verbinden
      </Button>
    </div>
  );
};
