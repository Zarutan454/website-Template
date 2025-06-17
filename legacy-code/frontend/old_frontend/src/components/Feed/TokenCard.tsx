
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Gem, Users, Wallet } from 'lucide-react';
import NetworkIcon from '@/components/TokenCreation/NetworkIcon';
import { Token } from '@/types/token';

interface TokenCardProps {
  token: Token;
  onClick?: () => void;
  isInFeed?: boolean;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, onClick, isInFeed = false }) => {
  return (
    <Card className="hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <NetworkIcon network={token.network} size={20} />
            <CardTitle className="text-lg">{token.symbol}</CardTitle>
          </div>
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {token.network}
          </CardTitle>
        </div>
        <CardDescription className="text-base font-medium">
          {token.name}
        </CardDescription>
        <CardDescription className="text-xs">
          {token.contract_address ? (
            <span className="font-mono text-xs truncate block max-w-[200px]">
              {token.contract_address.substring(0, 6)}...{token.contract_address.substring(token.contract_address.length - 4)}
            </span>
          ) : (
            "Contract address not available"
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="py-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground text-xs">Supply</span>
            <span className="font-mono">{Number(token.total_supply).toLocaleString()}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-muted-foreground text-xs">Created</span>
            <span>{token.created_at ? formatDistanceToNow(new Date(token.created_at), { addSuffix: true }) : "N/A"}</span>
          </div>
        </div>
      </CardContent>

      <Separator />
      <CardFooter className="pt-3 pb-3 flex justify-between text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" />
          <span>{token.contract_address ? "Deployed" : "Pending"}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <a href={`https://${token.network === 'ethereum' ? '' : token.network + '.'}etherscan.io/token/${token.contract_address}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TokenCard;
