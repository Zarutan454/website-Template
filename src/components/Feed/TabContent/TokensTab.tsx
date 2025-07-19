import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, Filter, TrendingUp, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import TokenCard from '../TokenCard';
import { Token, TokenMetrics, TokenSocialLinks, TokenWithJSONB } from '@/types/token';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext.utils';

const TokensTab: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [filterNetwork, setFilterNetwork] = useState<string | null>(null);
  const { user: profile } = useAuth();
  const navigate = useNavigate();

  // Animation variants for list items
  const listItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  useEffect(() => {
    if (tokens.length > 0) {
      applyFiltersAndSort();
    }
  }, [tokens, sortOption, filterNetwork]);

  const fetchTokens = async () => {
    try {
      setIsLoading(true);
      
      // Tokens aus der Datenbank laden
      // TODO: Diese Komponente muss auf Django-API migriert werden. Supabase-Logik wurde entfernt.
      // const { data, error } = await supabase
      //   .from('tokens')
      //   .select(`
      //     *,
      //     token_verification_status (*)
      //   `)
      //   .order('created_at', { ascending: false })
      //   .limit(50);
      
      // if (error) {
      //   throw error;
      // }

      // Daten transformieren, um dem Token-Interface zu entsprechen
      const formattedTokens = [
        // Example token data
        {
          id: 1,
          creator_id: 1,
          name: "Token 1",
          symbol: "TKN1",
          initial_supply: 1000000,
          contract_address: "0x1234567890123456789012345678901234567890",
          network: "ethereum",
          status: "deployed" as "draft" | "deployed" | "verified",
          created_at: "2024-04-01T12:00:00",
          updated_at: "2024-04-01T12:00:00",
          logo_url: null,
          is_verified: true,
          verification_date: "2024-04-01T12:00:00",
          verification_details: null,
          social_links: {
            website: "https://example.com",
            discord: "https://discord.com/example",
            twitter: "https://twitter.com/example",
            telegram: "https://t.me/example",
            medium: null,
            github: null
          },
          layer_2_bridge_address: null,
          layer_2_network_type: null,
          layer_2_deployment_status: "",
          token_type: "standard",
          can_mint: false,
          can_burn: false,
          marketing_wallet: null,
          charity_wallet: null,
          dev_wallet: null,
          buy_tax: null,
          sell_tax: null,
          max_transaction_limit: null,
          max_wallet_limit: null,
          decimals: 18,
          description: "Description of Token 1",
          max_supply: null,
          features: [],
          token_metrics: {
            price_usd: 1000,
            volume_24h: 100000,
            market_cap: 1000000000,
            holder_count: 1000,
            liquidity_usd: 500000,
            price_change_24h: 0.01,
            price_change_7d: 0.05
          },
          token_verification_status: [
            {
              id: 1,
              token_id: 1,
              verification_status: "verified",
              verification_date: "2024-04-01T12:00:00",
              explorer_url: "https://etherscan.io/token/0x1234567890123456789012345678901234567890",
              created_at: "2024-04-01T12:00:00",
              updated_at: "2024-04-01T12:00:00"
            }
          ]
        },
        // Add more tokens as needed
      ];

      setTokens(formattedTokens);
      setFilteredTokens(formattedTokens);
    } catch (err) {
      console.error('Fehler beim Laden der Tokens:', err);
      setError('Tokens konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...tokens];
    
    // Anwenden des Netzwerk-Filters
    if (filterNetwork) {
      result = result.filter(token => token.network === filterNetwork);
    }
    
    // Sortierung anwenden
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price-high':
        result.sort((a, b) => (b.token_metrics?.price_usd || 0) - (a.token_metrics?.price_usd || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.token_metrics?.price_usd || 0) - (b.token_metrics?.price_usd || 0));
        break;
      case 'market-cap':
        result.sort((a, b) => (b.token_metrics?.market_cap || 0) - (a.token_metrics?.market_cap || 0));
        break;
      case 'volume':
        result.sort((a, b) => (b.token_metrics?.volume_24h || 0) - (a.token_metrics?.volume_24h || 0));
        break;
      case 'trending':
        // Trending kombiniert Preis-Änderung, Marktkapitalisierung und Volumen
        result.sort((a, b) => {
          const scoreA = (a.token_metrics?.price_change_24h || 0) + 
                        (a.token_metrics?.volume_24h || 0) / 1000000;
          const scoreB = (b.token_metrics?.price_change_24h || 0) + 
                        (b.token_metrics?.volume_24h || 0) / 1000000;
          return scoreB - scoreA;
        });
        break;
      default:
        break;
    }
    
    setFilteredTokens(result);
  };

  const handleCreateToken = () => {
    navigate('/create-token');
  };

  const handleFilterClick = (network: string | null) => {
    setFilterNetwork(network === filterNetwork ? null : network);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-full p-4 bg-dark-200 rounded-lg">
            <Skeleton className="h-6 w-1/3 bg-dark-300 mb-2" />
            <Skeleton className="h-4 w-1/4 bg-dark-300 mb-4" />
            <Skeleton className="h-20 w-full bg-dark-300 mb-2" />
            <div className="flex justify-end">
              <Skeleton className="h-8 w-24 bg-dark-300" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-center">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={fetchTokens}
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">Token Entdecken</h2>
          <p className="text-muted-foreground text-sm">Finde und analysiere die neuesten Token im BSN-Ökosystem</p>
        </div>
        
        {profile && (
          <Button onClick={handleCreateToken} className="flex items-center">
            <Plus size={16} className="mr-2" />
            Token erstellen
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Sortieroptionen */}
        <Tabs defaultValue={sortOption} onValueChange={setSortOption} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full sm:w-auto">
            <TabsTrigger value="newest">Neueste</TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center">
              <TrendingUp size={14} className="mr-1" /> Trending
            </TabsTrigger>
            <TabsTrigger value="price-high" className="flex items-center">
              <ArrowUp size={14} className="mr-1" /> Preis
            </TabsTrigger>
            <TabsTrigger value="price-low" className="flex items-center">
              <ArrowDown size={14} className="mr-1" /> Preis
            </TabsTrigger>
            <TabsTrigger value="market-cap">Market Cap</TabsTrigger>
            <TabsTrigger value="volume">Volumen</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {/* Netzwerk-Filter */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={filterNetwork === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterClick(null)}
          >
            Alle
          </Badge>
          <Badge 
            variant={filterNetwork === 'ethereum' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterClick('ethereum')}
          >
            Ethereum
          </Badge>
          <Badge 
            variant={filterNetwork === 'bnb' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterClick('bnb')}
          >
            BNB Chain
          </Badge>
          <Badge 
            variant={filterNetwork === 'polygon' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterClick('polygon')}
          >
            Polygon
          </Badge>
          <Badge 
            variant={filterNetwork === 'arbitrum' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterClick('arbitrum')}
          >
            Arbitrum
          </Badge>
        </div>
      </div>

      {filteredTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-dark-200/50 rounded-lg p-8 text-center">
          <Filter className="h-12 w-12 text-gray-500 mb-4" />
          <h3 className="text-lg font-medium mb-2">Keine Token gefunden</h3>
          <p className="text-muted-foreground">
            {filterNetwork 
              ? `Es wurden keine Token im ${filterNetwork} Netzwerk gefunden.`
              : 'Es wurden keine Token gefunden, die deinen Kriterien entsprechen.'}
          </p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => {
              setFilterNetwork(null);
              setSortOption('newest');
            }}
          >
            Filter zurücksetzen
          </Button>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {filteredTokens.map((token, index) => (
            <motion.div
              key={token.id}
              custom={index}
              variants={listItemVariants}
            >
              <TokenCard token={token} isInFeed={true} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default TokensTab;

