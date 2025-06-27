import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Plus, Filter, TrendingUp, Image, Grid3X3, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NFTCard from '../NFTCard';
import { useProfile } from '@/hooks/useProfile';
import { useNFTs } from '@/hooks/useNFTs';
import { NFT } from '@/types/nft';
import { NFTAttribute } from '@/types/token'; // Import from token.ts
import { useAuth } from '@/context/AuthContext';

const NFTsTab: React.FC = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<NFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [filterNetwork, setFilterNetwork] = useState<string | null>(null);
  const { user: profile } = useAuth();
  const navigate = useNavigate();
  const { fetchNFTs } = useNFTs();

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
    loadNFTs();
  }, []);

  useEffect(() => {
    if (nfts.length > 0) {
      applyFiltersAndSort();
    }
  }, [nfts, sortOption, filterNetwork]);

  const loadNFTs = async () => {
    try {
      setIsLoading(true);
      
      const nftData = await fetchNFTs();
      setNfts(nftData);
      setFilteredNfts(nftData);
    } catch (err) {
      setError('NFTs konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...nfts];
    
    if (filterNetwork) {
      result = result.filter(nft => nft.network === filterNetwork);
    }
    
    switch (sortOption) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-high':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'price-low':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'collection':
        result.sort((a, b) => (a.collectionName || '').localeCompare(b.collectionName || ''));
        break;
      default:
        break;
    }
    
    setFilteredNfts(result);
  };

  const handleCreateNFT = () => {
    navigate('/create-nft');
  };

  const handleFilterClick = (network: string | null) => {
    setFilterNetwork(network === filterNetwork ? null : network);
  };

  const handleRetryClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    loadNFTs();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="w-full rounded-lg overflow-hidden">
            <Skeleton className="h-48 w-full bg-dark-300" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 bg-dark-300 mb-2" />
              <Skeleton className="h-4 w-1/2 bg-dark-300 mb-2" />
              <Skeleton className="h-8 w-1/3 bg-dark-300" />
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
          onClick={handleRetryClick}
        >
          Erneut versuchen
        </Button>
      </div>
    );
  }

  const demoNFTs = [
    {
      id: 'demo1',
      creator_id: 'demo_creator',
      name: 'Cosmic Voyager #137',
      description: 'Ein einzigartiges Kunstwerk aus der Cosmic Voyager Collection.',
      image_url: 'https://via.placeholder.com/500?text=NFT+Demo',
      collection_name: 'Cosmic Voyager',
      token_id: '137',
      contract_address: '0x1234567890abcdef1234567890abcdef12345678',
      network: 'ethereum',
      created_at: new Date().toISOString(),
      price: 0.25,
      currency: 'ETH',
      is_for_sale: true,
      metadata: {},
      attributes: [
        { trait_type: 'Background', value: 'Deep Space' },
        { trait_type: 'Ship Type', value: 'Explorer' },
        { trait_type: 'Rarity', value: 'Rare' }
      ]
    },
    {
      id: 'demo2',
      creator_id: 'demo_creator',
      name: 'Digital Dreams #42',
      description: 'Eine surreale digitale Landschaft aus der Digital Dreams Kollektion.',
      image_url: 'https://via.placeholder.com/500?text=Digital+Dreams',
      collection_name: 'Digital Dreams',
      token_id: '42',
      contract_address: '0x0987654321fedcba0987654321fedcba09876543',
      network: 'polygon',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      price: 180,
      currency: 'MATIC',
      is_for_sale: true,
      metadata: {},
      attributes: [
        { trait_type: 'Style', value: 'Cyberpunk' },
        { trait_type: 'Color Palette', value: 'Neon' },
        { trait_type: 'Rarity', value: 'Uncommon' }
      ]
    },
    {
      id: 'demo3',
      creator_id: 'demo_creator',
      name: 'CryptoKitty #19874',
      description: 'Eine niedliche virtuelle Katze aus der CryptoKitty Kollektion.',
      image_url: 'https://via.placeholder.com/500?text=CryptoKitty',
      collection_name: 'CryptoKitties',
      token_id: '19874',
      contract_address: '0xabcdef1234567890abcdef1234567890abcdef12',
      network: 'ethereum',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      price: 0.15,
      currency: 'ETH',
      is_for_sale: true,
      metadata: {},
      attributes: [
        { trait_type: 'Fur', value: 'Striped' },
        { trait_type: 'Eyes', value: 'Blue' },
        { trait_type: 'Generation', value: '5' }
      ]
    }
  ];
  
  const displayNfts = filteredNfts.length > 0 ? filteredNfts : demoNFTs.map(demo => ({
    id: demo.id,
    name: demo.name,
    description: demo.description,
    imageUrl: demo.image_url,
    collectionId: 'demo',
    collectionName: demo.collection_name,
    creatorId: demo.creator_id,
    ownerId: demo.creator_id,
    tokenId: demo.token_id,
    network: demo.network,
    contractAddress: demo.contract_address,
    attributes: demo.attributes as NFTAttribute[],
    price: demo.price,
    currency: demo.currency,
    listed: demo.is_for_sale,
    createdAt: new Date(demo.created_at)
  } as NFT));

  if (filteredNfts.length === 0 && nfts.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-dark-200/50 rounded-lg p-8 text-center">
        <Filter className="h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Keine NFTs gefunden</h3>
        <p className="text-muted-foreground">
          {filterNetwork 
            ? `Es wurden keine NFTs im ${filterNetwork} Netzwerk gefunden.`
            : 'Es wurden keine NFTs gefunden, die deinen Kriterien entsprechen.'}
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold">NFTs Entdecken</h2>
          <p className="text-muted-foreground text-sm">Erkunde einzigartige digitale Kunstwerke und Sammlerstücke</p>
        </div>
        
        {profile && (
          <Button onClick={handleCreateNFT} className="flex items-center">
            <Plus size={16} className="mr-2" />
            NFT erstellen
          </Button>
        )}
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Tabs defaultValue={sortOption} onValueChange={setSortOption} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="newest">Neueste</TabsTrigger>
            <TabsTrigger value="price-high">Preis (hoch)</TabsTrigger>
            <TabsTrigger value="price-low">Preis (niedrig)</TabsTrigger>
            <TabsTrigger value="name">Name</TabsTrigger>
            <TabsTrigger value="collection">Kollektion</TabsTrigger>
          </TabsList>
        </Tabs>
        
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
            variant={filterNetwork === 'polygon' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterClick('polygon')}
          >
            Polygon
          </Badge>
          <Badge 
            variant={filterNetwork === 'bnb' ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => handleFilterClick('bnb')}
          >
            BNB Chain
          </Badge>
        </div>
      </div>

      {nfts.length === 0 && (
        <div className="p-4 bg-blue-500/10 border border-blue-500 rounded-lg mb-4">
          <p className="text-blue-400 text-sm">
            Die NFT-Ansicht zeigt derzeit Demo-Daten. Erstelle dein erstes NFT, um echte Daten zu sehen!
          </p>
        </div>
      )}

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
        {displayNfts.map((nft, index) => (
          <motion.div
            key={nft.id}
            custom={index}
            variants={listItemVariants}
          >
            <NFTCard
              id={nft.id}
              name={nft.name}
              description={nft.description || ''}
              imageUrl={nft.imageUrl}
              collectionName={nft.collectionName || ''}
              tokenId={nft.tokenId}
              contractAddress={nft.contractAddress || ''}
              network={nft.network}
              createdAt={nft.createdAt.toISOString()}
              price={nft.price}
              currency={nft.currency || 'ETH'}
              isForSale={nft.listed}
              attributes={nft.attributes as NFTAttribute[]}
              creatorId={nft.creatorId}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default NFTsTab;
