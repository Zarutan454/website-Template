
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNFTs, NFT } from '../hooks/useNFTs';
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Check, Grid3X3, GridIcon, Search, Plus } from "lucide-react";
import { toast } from 'sonner';

// Temporary NFTCollection interface for compatibility
interface NFTCollectionType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  bannerUrl?: string;
  verified: boolean;
  creatorName?: string;
  totalSupply?: number;
  floorPrice?: number;
  network: string;
}

const NFTCollection = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchNFTs, isLoading } = useNFTs();
  const [collection, setCollection] = useState<NFTCollectionType | null>(null);
  const [collectionNFTs, setCollectionNFTs] = useState<NFT[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [filterText, setFilterText] = useState('');
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        // For now, we'll create a mock collection since we don't have collection API yet
        const mockCollection: NFTCollectionType = {
          id,
          name: `Collection ${id}`,
          description: 'This is a sample collection description.',
          imageUrl: 'https://via.placeholder.com/400x400?text=Collection',
          bannerUrl: 'https://via.placeholder.com/1500x500?text=Collection+Banner',
          verified: true,
          creatorName: 'Sample Creator',
          totalSupply: 0,
          floorPrice: 0.1,
          network: 'Ethereum'
        };
        setCollection(mockCollection);
        
        const nfts = await fetchNFTs();
        // For now, we'll show all NFTs since we don't have collection filtering
        setCollectionNFTs(nfts);
      } catch (error) {
        toast.error('Error loading collection details');
      }
    };
    
    loadData();
  }, [id, fetchNFTs]);
  
  const filteredNFTs = collectionNFTs.filter(nft => 
    nft.name.toLowerCase().includes(filterText.toLowerCase())
  );
  
  if (isLoading || !collection) {
    return <LoadingState />;
  }
  
  return (
    <div className="min-h-screen bg-dark-200 text-white">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-100 border-b border-gray-800 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link to="/marketplace" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">Collection</h1>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="h-48 md:h-64 w-full overflow-hidden relative pt-16 lg:pt-0">
        <img 
          src={collection.bannerUrl || 'https://via.placeholder.com/1500x500?text=Collection+Banner'} 
          alt={collection.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-200 to-transparent"></div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-64 -mt-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="hidden lg:flex items-center gap-2 mb-6">
            <Link to="/marketplace" className="text-gray-400 hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Zurück zum Marktplatz
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
            {/* Collection Logo */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden border-4 border-dark-200">
              <img 
                src={collection.imageUrl} 
                alt={collection.name} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Collection Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-bold">{collection.name}</h1>
                {collection.verified && (
                  <Badge variant="outline" className="bg-primary-400/10 text-primary-400 border-primary-400/20">
                    <Check className="h-3 w-3 mr-1" /> Verifiziert
                  </Badge>
                )}
              </div>
              <div className="text-gray-300 mb-2">von {collection.creatorName || 'Unbekannter Ersteller'}</div>
              <p className="text-gray-400 mb-4 max-w-2xl">{collection.description}</p>
              
              {/* Collection Stats */}
              <div className="flex flex-wrap gap-6 text-gray-300">
                <div>
                  <div className="text-sm text-gray-400">Items</div>
                  <div className="font-semibold">{collection.totalSupply || collectionNFTs.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Floor Price</div>
                  <div className="font-semibold">{collection.floorPrice || '—'} ETH</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Netzwerk</div>
                  <div className="font-semibold">{collection.network}</div>
                </div>
                
                <div className="ml-auto">
                  <Link to="/create-nft">
                    <Button className="gap-1">
                      <Plus className="h-4 w-4" /> NFT zu dieser Sammlung hinzufügen
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* NFT Items */}
          <div className="mb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl font-semibold">Items</h2>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Items durchsuchen"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    className="w-full bg-dark-100 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                
                <div className="flex items-center bg-dark-100 border border-gray-800 rounded-lg overflow-hidden">
                  <button 
                    className={`p-2 ${viewMode === 'grid' ? 'bg-dark-300 text-white' : 'text-gray-400'}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <GridIcon className="h-5 w-5" />
                  </button>
                  <button 
                    className={`p-2 ${viewMode === 'large' ? 'bg-dark-300 text-white' : 'text-gray-400'}`}
                    onClick={() => setViewMode('large')}
                    aria-label="Large grid view"
                  >
                    <Grid3X3 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            {filteredNFTs.length > 0 ? (
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              }`}>
                {filteredNFTs.map((nft) => (
                  <Link 
                    key={nft.id} 
                    to={`/nfts/${nft.id}`}
                    className="bg-dark-100 rounded-lg border border-gray-800 overflow-hidden hover:border-primary-500/50 transition-all card-hover"
                  >
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={nft.image_url} 
                        alt={nft.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-white mb-1 truncate">{nft.name}</h3>
                      {nft.listed && nft.price ? (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-400">Preis</div>
                          <div className="font-semibold">{nft.price} {nft.currency}</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Nicht zum Verkauf</div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-dark-100 rounded-lg border border-gray-800 p-8 text-center">
                <p className="text-gray-400">
                  {filterText ? 'Keine NFTs gefunden' : 'Keine NFTs in dieser Sammlung'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-dark-200 text-white">
      <div className="h-48 md:h-64 w-full pt-16 lg:pt-0">
        <Skeleton className="w-full h-full" />
      </div>
      
      <div className="lg:pl-64 -mt-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-start mb-10">
            <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-xl" />
            
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-4 w-full max-w-2xl mb-2" />
              <Skeleton className="h-4 w-5/6 max-w-2xl mb-4" />
              
              <div className="flex flex-wrap gap-6">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </div>
            </div>
          </div>
          
          <div className="mb-10">
            <div className="flex justify-between mb-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-40" />
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-dark-100 rounded-lg border border-gray-800 overflow-hidden">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3">
                    <Skeleton className="h-5 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTCollection;
