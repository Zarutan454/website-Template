import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Gem, Users, Wallet } from 'lucide-react';
import NetworkIcon from '@/components/TokenCreation/NetworkIcon';
import TokenCard from './TokenCard';
import { formatDistanceToNow } from 'date-fns';

interface Token {
  id: string;
  name: string;
  symbol: string;
  contract_address?: string;
  network: string;
  total_supply: number;
  created_at: string;
}

const TokensTab: React.FC = () => {
  const { profile, isAuthenticated } = useProfile();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTokens() {
      if (!profile) return;
      
      try {
        setLoading(true);
        
        // TODO: Diese Komponente muss auf Django-API migriert werden. Supabase-Logik wurde entfernt.
        
        setTokens(data || []);
      } catch (err) {
        setError('Failed to load tokens');
      } finally {
        setLoading(false);
      }
    }
    
    fetchTokens();
  }, [profile]);

  const handleCreateToken = () => {
    navigate('/create-token');
  };

  const handleTokenClick = (tokenId: string) => {
    navigate(`/tokens/${tokenId}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">Sign in to view your tokens</h3>
        <p className="text-muted-foreground mb-4">
          You need to be logged in to see your tokens and create new ones
        </p>
        <Button onClick={() => navigate('/login')}>Sign In</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-xl font-semibold mb-2">You haven't created any tokens yet</h3>
        <p className="text-muted-foreground mb-6">
          Start by creating your first token on BSN
        </p>
        <Button onClick={handleCreateToken}>
          <Plus className="mr-2 h-4 w-4" />
          Create Token
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Tokens</h2>
        <Button onClick={handleCreateToken}>
          <Plus className="mr-2 h-4 w-4" />
          Create Token
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokens.map((token) => (
          <Card 
            key={token.id} 
            className="hover:border-primary/50 transition-all duration-200 cursor-pointer overflow-hidden"
            onClick={() => handleTokenClick(token.id)}
          >
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
                  <span className="font-mono">{token.total_supply.toLocaleString()}</span>
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
        ))}
      </div>
    </div>
  );
};

export default TokensTab;
