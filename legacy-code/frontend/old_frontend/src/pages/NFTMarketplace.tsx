
import React, { useEffect, useState, useCallback } from 'react';
import { useNFTs } from '@/hooks/useNFTs';
import { NFTCollection, NFT } from '@/types/nft';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, Sparkles, ArrowUpRight, Plus } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { toast } from 'sonner';

// CreateCollectionModal component for OpenSea-like collection creation
const CreateCollectionModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [itemCount, setItemCount] = useState(1);
  const [collectionName, setCollectionName] = useState('');
  const navigate = useNavigate();
  
  const handleCreateCollection = () => {
    // In a real implementation, this would create the collection
    // For now, we'll just navigate to the collection creation page
    navigate('/create-nft-collection');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-dark-100 rounded-xl p-6 w-full max-w-md border border-gray-800">
        <h2 className="text-xl font-bold mb-4">
          {step === 1 ? 'Create Collection' : 'Add Items'}
        </h2>
        
        {step === 1 ? (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Collection Name</label>
                <Input 
                  value={collectionName}
                  onChange={(e) => setCollectionName(e.target.value)}
                  placeholder="e.g. CryptoPunks"
                  className="bg-dark-300 border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Number of Items</label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setItemCount(Math.max(1, itemCount - 1))}
                  >
                    -
                  </Button>
                  <Input 
                    type="number" 
                    min="1"
                    value={itemCount}
                    onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center bg-dark-300 border-gray-700"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setItemCount(itemCount + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={() => setStep(2)}>Continue</Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {Array.from({ length: itemCount }).map((_, i) => (
                <div key={i} className="border border-gray-800 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Item #{i + 1}</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <Input placeholder={`Item ${i + 1}`} className="bg-dark-300 border-gray-700" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Image</label>
                      <div className="border border-dashed border-gray-700 rounded-lg h-32 flex items-center justify-center hover:bg-dark-300 cursor-pointer transition-colors">
                        <span className="text-gray-500">Click to upload</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleCreateCollection}>Create Collection</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Empty State component for better UX
const EmptyState = ({
  title,
  description,
  action,
  colSpan
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  colSpan?: string;
}) => (
  <Card className={`bg-dark-100 border-gray-800 p-8 text-center ${colSpan === 'full' ? 'col-span-full' : ''}`}>
    <div className="mx-auto max-w-xs">
      <h3 className="font-medium text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      {action}
    </div>
  </Card>
);

const NFTMarketplace = () => {
  const { collections, nfts, isLoading, fetchCollections, fetchNFTs } = useNFTs();
  const [featuredCollections, setFeaturedCollections] = useState<NFTCollection[]>([]);
  const [featuredNFTs, setFeaturedNFTs] = useState<NFT[]>([]);
  const [listedNFTs, setListedNFTs] = useState<NFT[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 8;

  // Debounced search functionality
  const filteredNFTs = nfts?.filter(nft => 
    nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (nft.collectionName && nft.collectionName.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const paginatedNFTs = filteredNFTs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredNFTs.length / ITEMS_PER_PAGE);

  const loadData = useCallback(async () => {
    try {
      const allCollections = await fetchCollections() || [];
      const allNFTs = await fetchNFTs() || [];
      
      // Safely set collections - ensure we have data before filtering
      if (Array.isArray(allCollections)) {
        setFeaturedCollections(
          allCollections.filter(c => c.featured).slice(0, 3)
        );
      } else {
        setFeaturedCollections([]);
      }

      // Safely set featured NFTs and listed NFTs
      if (Array.isArray(allNFTs)) {
        setFeaturedNFTs(allNFTs.slice(0, 4));
        setListedNFTs(allNFTs.filter(n => n.listed));
      } else {
        setFeaturedNFTs([]);
        setListedNFTs([]);
      }
    } catch (error) {
      toast.error("Failed to load marketplace data");
    }
  }, [fetchCollections, fetchNFTs]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-dark-200 text-white">
      {showCreateModal && (
        <CreateCollectionModal onClose={() => setShowCreateModal(false)} />
      )}

      {/* Header with search functionality */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-dark-100 border-b border-gray-800 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">NFT Marketplace</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="gap-1"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Link to="/create-nft">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> NFT
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold hidden lg:block">NFT Marketplace</h1>
              <p className="text-gray-400 hidden md:block">Discover, collect, and sell extraordinary NFTs</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search collections, NFTs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-dark-100 border-gray-800"
                />
              </div>
              
              <div className="flex gap-2">
                <Link to="/create-nft">
                  <Button variant="outline" className="gap-1">
                    <Plus className="h-4 w-4" /> NFT erstellen
                  </Button>
                </Link>
                <Link to="/create-nft-collection">
                  <Button className="gap-1">
                    <Plus className="h-4 w-4" /> Sammlung erstellen
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Hero Section */}
          <section className="mb-10 bg-gradient-to-r from-dark-300 to-dark-400 rounded-xl p-8 border border-gray-800 hidden md:block">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold mb-4">Discover, collect, and sell extraordinary NFTs</h1>
              <p className="text-gray-400 mb-6">
                Explore the best digital art and collectibles on the first decentralized 
                social NFT marketplace
              </p>
              <div className="flex gap-3">
                <Button className="gap-1">
                  <Sparkles className="h-4 w-4" /> Explore
                </Button>
                <Button variant="outline" onClick={() => setShowCreateModal(true)}>
                  Create Collection
                </Button>
              </div>
            </div>
          </section>
          
          {/* Featured Collections */}
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Featured Collections</h2>
              <Link to="/nft/collections" className="text-primary-400 flex items-center text-sm">
                View all <ArrowUpRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCollections.length > 0 ? (
                featuredCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))
              ) : (
                <EmptyState 
                  title="No featured collections yet"
                  description="Create a collection to get featured"
                  action={
                    <Link to="/create-nft-collection">
                      <Button className="gap-1">
                        <Plus className="h-4 w-4" /> Create Collection
                      </Button>
                    </Link>
                  }
                />
              )}
            </div>
          </section>
          
          {/* NFT Tabs with Pagination */}
          <section>
            <Tabs defaultValue="featured" className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
                <TabsList className="bg-dark-100 border border-gray-800">
                  <TabsTrigger value="featured">Featured</TabsTrigger>
                  <TabsTrigger value="forsale">For Sale</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                </TabsList>
                
                {filteredNFTs.length > 0 && (
                  <div className="text-sm text-gray-400">
                    Showing {Math.min(filteredNFTs.length, 1)}-{Math.min(
                      paginatedNFTs.length, 
                      filteredNFTs.length
                    )} of {filteredNFTs.length} items
                  </div>
                )}
              </div>
              
              {/* Featured NFTs */}
              <TabsContent value="featured" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {paginatedNFTs.length > 0 ? (
                    paginatedNFTs.map((nft) => (
                      <NFTCard key={nft.id} nft={nft} />
                    ))
                  ) : (
                    <EmptyState 
                      title={searchQuery ? "No NFTs match your search" : "No NFTs available"}
                      description={searchQuery ? "Try adjusting your search terms" : "Create your first NFT to get started"}
                      colSpan="full"
                      action={
                        <Link to="/create-nft">
                          <Button className="gap-1">
                            <Plus className="h-4 w-4" /> Create NFT
                          </Button>
                        </Link>
                      }
                    />
                  )}
                </div>
                
                {totalPages > 1 && (
                  <Pagination className="mt-8">
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            Previous
                          </Button>
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <Button
                            variant={currentPage === i + 1 ? "default" : "outline"}
                            onClick={() => setCurrentPage(i + 1)}
                          >
                            {i + 1}
                          </Button>
                        </PaginationItem>
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Next
                          </Button>
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </TabsContent>
              
              {/* For Sale NFTs */}
              <TabsContent value="forsale" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {listedNFTs.length > 0 ? 
                    listedNFTs.slice(0, ITEMS_PER_PAGE).map((nft) => (
                      <NFTCard key={nft.id} nft={nft} />
                    )) : 
                    <EmptyState 
                      title="No NFTs for sale"
                      description="List your NFTs for sale or check back later"
                      colSpan="full"
                      action={
                        <Link to="/create-nft">
                          <Button className="gap-1">
                            <Plus className="h-4 w-4" /> Create NFT
                          </Button>
                        </Link>
                      }
                    />
                  }
                </div>
              </TabsContent>
              
              {/* Recent NFTs */}
              <TabsContent value="recent" className="mt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {nfts && nfts.length > 0 ? 
                    nfts.slice(0, ITEMS_PER_PAGE).map((nft) => (
                      <NFTCard key={nft.id} nft={nft} />
                    )) : 
                    <EmptyState 
                      title="No NFTs available"
                      description="Be the first to create an NFT"
                      colSpan="full"
                      action={
                        <Link to="/create-nft">
                          <Button className="gap-1">
                            <Plus className="h-4 w-4" /> Create NFT
                          </Button>
                        </Link>
                      }
                    />
                  }
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
};

// Enhanced NFTCard with better UI
const NFTCard: React.FC<{ nft: NFT }> = ({ nft }) => {
  return (
    <Link to={`/nfts/${nft.id}`}>
      <Card className="bg-dark-100 border-gray-800 overflow-hidden transition-all hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 h-full flex flex-col">
        <div className="aspect-square overflow-hidden relative">
          <img 
            src={nft.imageUrl} 
            alt={nft.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {nft.listed && nft.price && (
            <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-1 rounded text-sm">
              {nft.price} {nft.currency}
            </div>
          )}
        </div>
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-base line-clamp-1">
              {nft.name}
            </CardTitle>
            {nft.listed && (
              <Badge className="bg-primary-400/10 text-primary-400 border-primary-400/20">
                <Sparkles className="h-3 w-3 mr-1" /> For Sale
              </Badge>
            )}
          </div>
          <CardDescription className="text-gray-400 text-xs">
            {nft.collectionName}
          </CardDescription>
        </CardHeader>
        
        <CardFooter className="flex justify-between pt-0 mt-auto">
          {nft.listed && nft.price ? (
            <div>
              <p className="text-xs text-gray-400">Price</p>
              <p className="font-semibold">{nft.price} {nft.currency}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-400">Owner</p>
              <p className="font-semibold text-sm">{nft.ownerName}</p>
            </div>
          )}
          <Button size="sm" variant={nft.listed ? "default" : "outline"} className="text-xs">
            {nft.listed ? 'Buy Now' : 'View'}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
};

// Enhanced CollectionCard with better UI
const CollectionCard: React.FC<{ collection: NFTCollection }> = ({ collection }) => {
  return (
    <Card className="bg-dark-100 border-gray-800 overflow-hidden h-full flex flex-col">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={collection.bannerUrl || collection.imageUrl} 
          alt={collection.name} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute -bottom-8 left-4 w-16 h-16 rounded-xl overflow-hidden border-4 border-dark-100 bg-dark-200">
          <img 
            src={collection.imageUrl} 
            alt={collection.name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
      
      <CardHeader className="pb-2 mt-8">
        <div className="flex items-center">
          <CardTitle className="text-white text-lg line-clamp-1">
            {collection.name}
          </CardTitle>
          {collection.verified && (
            <Badge variant="outline" className="ml-2 bg-primary-400/10 text-primary-400 border-primary-400/20">
              <Check className="h-3 w-3 mr-1" /> Verified
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-400">
          by {collection.creatorName || 'Unknown Creator'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-sm text-gray-300 flex-grow">
        <p className="line-clamp-2">{collection.description}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between text-sm border-t border-gray-800 mt-auto pt-3">
        <div>
          <p className="text-gray-400">Floor</p>
          <p className="font-medium">{collection.floorPrice || '—'} ETH</p>
        </div>
        <div>
          <p className="text-gray-400">Items</p>
          <p className="font-medium">{collection.totalSupply || 0}</p>
        </div>
        <Link to={`/nft/collections/${collection.id}`}>
          <Button variant="outline" className="text-xs h-9">
            View Collection
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Enhanced loading state with better skeletons
const LoadingState = () => {
  return (
    <div className="min-h-screen bg-dark-200 text-white pt-16 lg:pt-0 lg:pl-64">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Skeleton */}
        <Skeleton className="h-48 w-full mb-10 rounded-xl hidden md:block" />
        
        <h2 className="text-xl font-semibold mb-4">Featured Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-dark-100 border-gray-800 h-full">
              <Skeleton className="h-40 w-full" />
              <div className="mt-8 px-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
              </div>
              <div className="px-6 pb-6 flex justify-between">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex flex-col">
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
        
        <Skeleton className="h-10 w-60 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="bg-dark-100 border-gray-800 h-full">
              <Skeleton className="aspect-square w-full" />
              <div className="p-6">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NFTMarketplace;
