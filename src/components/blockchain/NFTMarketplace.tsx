import React, { useState } from 'react';
import { useBlockchain } from '../../hooks/useBlockchain';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Image, 
  Plus, 
  ShoppingCart, 
  Tag, 
  Users, 
  TrendingUp,
  Heart,
  Share2,
  Eye,
  Clock,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface NFT {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  creator: string;
  owner: string;
  isForSale: boolean;
  collection: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  level: number;
  experience: number;
}

interface Collection {
  id: number;
  name: string;
  description: string;
  image: string;
  creator: string;
  totalNFTs: number;
  floorPrice: string;
  totalVolume: string;
  isActive: boolean;
}

export const NFTMarketplace: React.FC = () => {
  const { nftInfo, isLoading, isConnected } = useBlockchain();
  
  const [activeTab, setActiveTab] = useState<'marketplace' | 'mint' | 'collections' | 'my-nfts'>('marketplace');
  const [mintData, setMintData] = useState({
    name: '',
    description: '',
    image: '',
    collection: '',
    price: ''
  });

  // Mock data for demonstration
  const mockNFTs: NFT[] = [
    {
      id: 1,
      name: "Cosmic Warrior #001",
      description: "A legendary warrior from the cosmic realm",
      image: "/api/placeholder/300/300",
      price: "0.5",
      creator: "0x1234...5678",
      owner: "0x8765...4321",
      isForSale: true,
      collection: "Cosmic Warriors",
      rarity: "Legendary",
      level: 10,
      experience: 1500
    },
    {
      id: 2,
      name: "Digital Art #042",
      description: "Unique digital artwork",
      image: "/api/placeholder/300/300",
      price: "0.2",
      creator: "0x5678...1234",
      owner: "0x4321...8765",
      isForSale: true,
      collection: "Digital Arts",
      rarity: "Rare",
      level: 5,
      experience: 750
    },
    {
      id: 3,
      name: "BSN Avatar #1337",
      description: "Exclusive BSN platform avatar",
      image: "/api/placeholder/300/300",
      price: "0.1",
      creator: "0x9999...8888",
      owner: "0x7777...6666",
      isForSale: false,
      collection: "BSN Avatars",
      rarity: "Epic",
      level: 8,
      experience: 1200
    }
  ];

  const mockCollections: Collection[] = [
    {
      id: 1,
      name: "Cosmic Warriors",
      description: "Legendary warriors from across the universe",
      image: "/api/placeholder/400/200",
      creator: "0x1234...5678",
      totalNFTs: 1000,
      floorPrice: "0.3",
      totalVolume: "150.5",
      isActive: true
    },
    {
      id: 2,
      name: "Digital Arts",
      description: "Unique digital artwork collection",
      image: "/api/placeholder/400/200",
      creator: "0x5678...1234",
      totalNFTs: 500,
      floorPrice: "0.15",
      totalVolume: "75.2",
      isActive: true
    },
    {
      id: 3,
      name: "BSN Avatars",
      description: "Exclusive BSN platform avatars",
      image: "/api/placeholder/400/200",
      creator: "0x9999...8888",
      totalNFTs: 10000,
      floorPrice: "0.05",
      totalVolume: "500.0",
      isActive: true
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-purple-100 text-purple-800';
      case 'Epic': return 'bg-blue-100 text-blue-800';
      case 'Rare': return 'bg-green-100 text-green-800';
      case 'Uncommon': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMintNFT = () => {
    if (!isConnected) {
      toast.error('Please connect your wallet to mint NFTs');
      return;
    }

    if (!mintData.name || !mintData.description || !mintData.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Mock minting process
    toast.success('NFT minted successfully!');
    setMintData({
      name: '',
      description: '',
      image: '',
      collection: '',
      price: ''
    });
  };

  const handleBuyNFT = (nft: NFT) => {
    if (!isConnected) {
      toast.error('Please connect your wallet to buy NFTs');
      return;
    }

    toast.success(`Successfully purchased ${nft.name} for ${nft.price} ETH!`);
  };

  const handleListNFT = (nft: NFT) => {
    if (!isConnected) {
      toast.error('Please connect your wallet to list NFTs');
      return;
    }

    toast.success(`${nft.name} listed for sale!`);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Wallet Connection Required
            </CardTitle>
            <CardDescription>
              Please connect your wallet to access the NFT marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" disabled>
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">NFT Marketplace</h1>
          <p className="text-muted-foreground">
            Discover, mint, and trade unique NFTs on BSN
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {mockNFTs.filter(nft => nft.isForSale).length} NFTs for sale
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total NFTs</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockNFTs.length}</div>
            <p className="text-xs text-muted-foreground">Available NFTs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCollections.length}</div>
            <p className="text-xs text-muted-foreground">Active Collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Floor Price</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.05 ETH</div>
            <p className="text-xs text-muted-foreground">Average Floor</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">725.7 ETH</div>
            <p className="text-xs text-muted-foreground">Total Volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
          <TabsTrigger value="mint">Mint NFT</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="my-nfts">My NFTs</TabsTrigger>
        </TabsList>

        {/* Marketplace Tab */}
        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockNFTs.filter(nft => nft.isForSale).map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-2 left-2 ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity}
                  </Badge>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{nft.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{nft.level}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{nft.description}</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Collection</span>
                    <span className="text-sm font-medium">{nft.collection}</span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">Price</span>
                    <span className="font-semibold">{nft.price} ETH</span>
                  </div>
                  <Button 
                    onClick={() => handleBuyNFT(nft)}
                    className="w-full"
                    disabled={isLoading}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Mint NFT Tab */}
        <TabsContent value="mint" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Mint New NFT
              </CardTitle>
              <CardDescription>
                Create and mint your own unique NFT
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">NFT Name</label>
                  <Input
                    placeholder="Enter NFT name"
                    value={mintData.name}
                    onChange={(e) => setMintData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Collection</label>
                  <Input
                    placeholder="Enter collection name"
                    value={mintData.collection}
                    onChange={(e) => setMintData(prev => ({ ...prev, collection: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Enter NFT description"
                  value={mintData.description}
                  onChange={(e) => setMintData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <Input
                    placeholder="Enter image URL"
                    value={mintData.image}
                    onChange={(e) => setMintData(prev => ({ ...prev, image: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (ETH)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.0"
                    value={mintData.price}
                    onChange={(e) => setMintData(prev => ({ ...prev, price: e.target.value }))}
                  />
                </div>
              </div>

              <Button 
                onClick={handleMintNFT}
                className="w-full"
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-2" />
                Mint NFT
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collections Tab */}
        <TabsContent value="collections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockCollections.map((collection) => (
              <Card key={collection.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="w-full h-32 object-cover"
                  />
                  <Badge className="absolute top-2 left-2">
                    {collection.totalNFTs} NFTs
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{collection.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{collection.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Floor Price</span>
                      <span className="font-medium">{collection.floorPrice} ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Volume</span>
                      <span className="font-medium">{collection.totalVolume} ETH</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Creator</span>
                      <span className="text-sm font-mono">{collection.creator}</span>
                    </div>
                  </div>

                  <Button className="w-full mt-4" variant="outline">
                    View Collection
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My NFTs Tab */}
        <TabsContent value="my-nfts" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockNFTs.filter(nft => nft.owner === "0x7777...6666").map((nft) => (
              <Card key={nft.id} className="overflow-hidden">
                <div className="relative">
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-2 left-2 ${getRarityColor(nft.rarity)}`}>
                    {nft.rarity}
                  </Badge>
                  {!nft.isForSale && (
                    <Badge variant="secondary" className="absolute top-2 right-2">
                      Not for Sale
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{nft.name}</h3>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm">{nft.level}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{nft.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Collection</span>
                      <span className="text-sm font-medium">{nft.collection}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Experience</span>
                      <span className="text-sm font-medium">{nft.experience} XP</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {nft.isForSale ? (
                      <Button 
                        onClick={() => handleListNFT(nft)}
                        variant="outline"
                        className="flex-1"
                        disabled={isLoading}
                      >
                        Delist
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleListNFT(nft)}
                        className="flex-1"
                        disabled={isLoading}
                      >
                        List for Sale
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 