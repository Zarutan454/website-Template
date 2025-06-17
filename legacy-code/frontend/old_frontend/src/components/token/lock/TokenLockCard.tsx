
import { Token } from "@/types/token";
import TokenLockTabs from "../TokenLockTabs";

interface TokenLockCardProps {
  token: Token;
  onSuccess: () => void;
}

export const TokenLockCard = ({ token, onSuccess }: TokenLockCardProps) => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">
          {token.name} ({token.symbol})
        </h3>
        <p className="text-muted-foreground">
          Create locks for your token to build trust with your community
        </p>
      </div>

      <TokenLockTabs
        tokenId={token.id}
        contractAddress={token.contract_address}
        onSuccess={onSuccess}
      />
    </div>
  );
};

export default TokenLockCard;
