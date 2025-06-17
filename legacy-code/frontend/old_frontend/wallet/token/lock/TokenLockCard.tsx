
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenLockTabs } from "@/components/token/TokenLockForm";
import { Token } from "@/types/token";

interface TokenLockCardProps {
  token: Token;
  onSuccess: () => void;
}

export const TokenLockCard = ({ token, onSuccess }: TokenLockCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Locker</CardTitle>
        <CardDescription>
          Sperren Sie Ihre Token und LP Token für mehr Vertrauen und Sicherheit.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {token.name} ({token.symbol})
          </h3>
          <TokenLockTabs
            tokenId={token.id}
            contractAddress={token.contract_address}
            onSuccess={onSuccess}
          />
        </div>
      </CardContent>
    </Card>
  );
};
