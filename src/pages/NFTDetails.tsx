
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNFTs } from '@/hooks/useNFTs';
import { NFT, NFTTransaction } from '@/types/nft';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Clock, Tag, BarChart, FileText, History } from "lucide-react";
import { format } from 'date-fns';
import { toast } from 'sonner';

const NFTDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchNFTById, fetchTransactions, buyNFT, isLoading } = useNFTs();
  const [nft, setNft] = useState<NFT | null>(null);
  const [transactions, setTransactions] = useState<NFTTransaction[]>([]);
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const [nftData, txData] = await Promise.all([
          fetchNFTById(id),
          fetchTransactions(id)
        ]);
        setNft(nftData);
        setTransactions(txData);
      } catch (error) {
        console.error('Error loading NFT details:', error);
        toast.error('Failed to load NFT details');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [id, fetchNFTById, fetchTransactions]);
  
  const handlePurchase = async () => {
    if (!nft || !nft.listed) return;
    
    try {
      setIsPurchasing(true);
      await buyNFT(nft.id);
      
      // Refresh NFT data
      const updatedNFT = await fetchNFTById(nft.id);
      setNft(updatedNFT);
      
      // Refresh transactions
      const txData = await fetchTransactions(nft.id);
      setTransactions(txData);
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      toast.error('Failed to purchase NFT');
    } finally {
      setIsPurchasing(false);
    }
  };
  
  if (isLoading || !nft) {
    return <LoadingState />;
  }
  
  return (
    <div className="min-h-screen bg-dark-200 text-white">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-100 border-b border-gray-800 lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center h-16">
            <Link to="/nft/marketplace" className="mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-xl font-bold">NFT Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-0 lg:pl-64">
        <div className="container mx-auto px-4 py-6">
          <div className="hidden lg:flex items-center gap-2 mb-6">
            <Link to="/nft/marketplace" className="text-gray-400 hover:text-white flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Marketplace
            </Link>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* NFT Image */}
            <div className="lg:col-span-1">
              <div className="bg-dark-100 rounded-lg border border-gray-800 overflow-hidden">
                <img 
                  src={nft.imageUrl} 
                  alt={nft.name} 
                  className="w-full h-auto"
                />
              </div>
              
              {/* Collection Info (Mobile Only) */}
              <div className="lg:hidden mt-6">
                <Card className="bg-dark-100 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Collection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Link to={`/nft/collections/${nft.collectionId}`} className="flex items-center">
                      <div className="font-semibold text-white hover:text-primary-400 transition-colors">
                        {nft.collectionName}
                      </div>
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* NFT Details */}
            <div className="lg:col-span-2">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{nft.name}</h1>
                    <Badge className="bg-primary-400/10 text-primary-400 border-primary-400/20">
                      {nft.network}
                    </Badge>
                  </div>
                  <div className="text-gray-400 mb-4">
                    <Link to={`/nft/collections/${nft.collectionId}`} className="hidden lg:inline-flex items-center hover:text-primary-400">
                      Collection: {nft.collectionName}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                  <p className="text-gray-300 mb-6">{nft.description}</p>
                  
                  {/* Owner & Price Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <Card className="bg-dark-100 border-gray-800">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">Owner</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="font-semibold">{nft.ownerName}</div>
                      </CardContent>
                    </Card>
                    
                    {nft.listed ? (
                      <Card className="bg-dark-100 border-gray-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-400">Price</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="font-semibold text-xl">{nft.price} {nft.currency}</div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-dark-100 border-gray-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-400">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="font-semibold">Not for sale</div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Buy Button or Other Actions */}
                  {nft.listed ? (
                    <Button 
                      size="lg" 
                      className="w-full mb-6"
                      disabled={isPurchasing}
                      onClick={handlePurchase}
                    >
                      {isPurchasing ? 'Processing...' : `Buy for ${nft.price} ${nft.currency}`}
                    </Button>
                  ) : (
                    <Button size="lg" className="w-full mb-6" variant="outline" disabled>
                      Not Listed For Sale
                    </Button>
                  )}
                  
                  {/* Tabs for Details, Properties, History */}
                  <Tabs defaultValue="properties" className="w-full">
                    <TabsList className="bg-dark-100 border border-gray-800">
                      <TabsTrigger value="properties" className="gap-1">
                        <Tag className="h-4 w-4" /> Properties
                      </TabsTrigger>
                      <TabsTrigger value="details" className="gap-1">
                        <FileText className="h-4 w-4" /> Details
                      </TabsTrigger>
                      <TabsTrigger value="history" className="gap-1">
                        <History className="h-4 w-4" /> History
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Properties Tab */}
                    <TabsContent value="properties" className="mt-6">
                      {nft.attributes && nft.attributes.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {nft.attributes.map((attr, index) => (
                            <div key={index} className="bg-dark-100 border border-gray-800 rounded-lg p-3 text-center">
                              <div className="text-xs text-primary-400 uppercase font-medium mb-1">
                                {attr.trait_type}
                              </div>
                              <div className="font-semibold truncate">
                                {attr.value.toString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          No properties found for this NFT
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Details Tab */}
                    <TabsContent value="details" className="mt-6">
                      <Card className="bg-dark-100 border-gray-800">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <div className="text-gray-400">Contract Address</div>
                              <div className="text-right font-mono text-sm text-white">
                                {nft.contractAddress || 'Not available'}
                              </div>
                            </div>
                            <Separator className="bg-gray-800" />
                            <div className="flex justify-between items-center">
                              <div className="text-gray-400">Token ID</div>
                              <div className="text-right font-mono text-sm">{nft.tokenId}</div>
                            </div>
                            <Separator className="bg-gray-800" />
                            <div className="flex justify-between items-center">
                              <div className="text-gray-400">Token Standard</div>
                              <div className="text-right">ERC-721</div>
                            </div>
                            <Separator className="bg-gray-800" />
                            <div className="flex justify-between items-center">
                              <div className="text-gray-400">Blockchain</div>
                              <div className="text-right">{nft.network}</div>
                            </div>
                            <Separator className="bg-gray-800" />
                            <div className="flex justify-between items-center">
                              <div className="text-gray-400">Creator</div>
                              <div className="text-right">{nft.creatorName}</div>
                            </div>
                            <Separator className="bg-gray-800" />
                            <div className="flex justify-between items-center">
                              <div className="text-gray-400">Creation Date</div>
                              <div className="text-right">
                                {format(new Date(nft.createdAt), 'dd MMM yyyy')}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* History Tab */}
                    <TabsContent value="history" className="mt-6">
                      <Card className="bg-dark-100 border-gray-800">
                        <CardContent className="p-0">
                          {transactions.length > 0 ? (
                            <div className="divide-y divide-gray-800">
                              {transactions.map((tx) => (
                                <div key={tx.id} className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className={`
                                        ${tx.transactionType === 'mint' ? 'bg-green-400/10 text-green-400 border-green-400/20' : ''}
                                        ${tx.transactionType === 'sale' ? 'bg-primary-400/10 text-primary-400 border-primary-400/20' : ''}
                                        ${tx.transactionType === 'transfer' ? 'bg-blue-400/10 text-blue-400 border-blue-400/20' : ''}
                                      `}>
                                        {tx.transactionType}
                                      </Badge>
                                      {tx.price && tx.currency && (
                                        <div className="font-medium">
                                          {tx.price} {tx.currency}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center text-gray-400 text-sm">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {format(new Date(tx.createdAt), 'dd MMM yyyy HH:mm')}
                                    </div>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-gray-400">From: </span>
                                    <span className="font-medium">{tx.fromName}</span>
                                    <span className="text-gray-400 mx-2">To: </span>
                                    <span className="font-medium">{tx.toName}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400">
                              No transaction history found
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const LoadingState = () => {
  return (
    <div className="min-h-screen bg-dark-200 text-white pt-16 lg:pt-0 lg:pl-64">
      <div className="container mx-auto px-4 py-6">
        <div className="hidden lg:block mb-6">
          <Skeleton className="h-6 w-40" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          
          <div className="lg:col-span-2">
            <Skeleton className="h-10 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/4 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-6" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            
            <Skeleton className="h-12 w-full mb-6 rounded-lg" />
            
            <Skeleton className="h-10 w-full mb-6 rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NFTDetails;
