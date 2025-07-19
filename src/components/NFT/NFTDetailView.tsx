import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NFT, NFTTransaction } from '@/types/nft';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, Clock, Tag, FileText, History, Heart, Flag, Share2 } from "lucide-react";
import { format } from 'date-fns';
import NFTAttributeGrid from './NFTAttributeGrid';
import NFTTransactionHistory from './NFTTransactionHistory';
import { useNFTs } from '@/hooks/useNFTs';
import { useProfile } from '@/hooks/useProfile';
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';
import NFTReportDialog from './NFTReportDialog';
import { useAuth } from '@/context/AuthContext';

interface NFTDetailViewProps {
  nft: NFT;
  transactions: NFTTransaction[];
  onBuy?: () => Promise<void>;
}

const NFTDetailView: React.FC<NFTDetailViewProps> = ({ nft, transactions, onBuy }) => {
  const navigate = useNavigate();
  const { likeNFT, isNFTLiked } = useNFTs();
  const { user: profile } = useAuth();
  const { recordActivity } = useMining();
  
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  
  React.useEffect(() => {
    const checkLikeStatus = async () => {
      if (profile && nft) {
        try {
          const liked = await isNFTLiked(nft.id);
          setIsLiked(liked);
        } catch (error) {
        }
      }
    };
    
    checkLikeStatus();
  }, [nft, profile, isNFTLiked]);
  
  const handleLikeNFT = async () => {
    if (!profile) {
      toast.error('Du musst angemeldet sein, um ein NFT zu liken');
      return;
    }
    
    try {
      setIsLikeLoading(true);
      const success = await likeNFT(nft.id);
      
      if (success) {
        setIsLiked(!isLiked);
        
        if (!isLiked) {
          // Only record activity if user is liking, not unliking
          try {
            await recordActivity('nft_like', 5, 0.5);
            toast.success("+0.5 BSN durch NFT-Like!");
          } catch (error) {
            console.error('Mining error:', error);
          }
        }
      }
    } catch (err) {
      console.error('Fehler beim Liken des NFTs:', err);
      toast.error('Der Like konnte nicht gespeichert werden');
    } finally {
      setIsLikeLoading(false);
    }
  };
  
  const handleBuy = async () => {
    if (!onBuy) return;
    
    try {
      setIsPurchasing(true);
      await onBuy();
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      toast.error('Failed to purchase NFT');
    } finally {
      setIsPurchasing(false);
    }
  };
  
  const handleShare = async () => {
    const nftUrl = `${window.location.origin}/nfts/${nft.id}`;
    
    try {
      await navigator.clipboard.writeText(nftUrl);
      toast.success("NFT-Link in die Zwischenablage kopiert!");
      
      if (profile) {
        try {
          await recordActivity('nft_share', 5, 0.5);
          toast.success("+0.5 BSN durch NFT-Share!");
        } catch (error) {
          console.error('Mining error:', error);
        }
      }
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      toast.error("Fehler beim Kopieren in die Zwischenablage");
    }
  };
  
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
              
              {/* Actions (Mobile Only) */}
              <div className="flex items-center justify-between mt-4 lg:hidden">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleLikeNFT}
                    disabled={isLikeLoading}
                    className={isLiked ? "text-red-500 border-red-500" : ""}
                  >
                    <Heart className={isLiked ? "fill-current" : ""} size={18} />
                  </Button>
                  
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 size={18} />
                  </Button>
                  
                  <NFTReportDialog nftId={nft.id} buttonSize="icon" variant="outline" buttonLabel="" />
                </div>
              </div>
            </div>
            
            {/* NFT Details */}
            <div className="lg:col-span-2">
              <div className="flex flex-col h-full">
                <div className="mb-6">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h1 className="text-2xl font-bold">{nft.name}</h1>
                    <div className="hidden lg:flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleLikeNFT}
                        disabled={isLikeLoading}
                        className={isLiked ? "text-red-500 border-red-500/50" : ""}
                      >
                        <Heart className={isLiked ? "fill-current" : ""} size={18} />
                      </Button>
                      
                      <Button variant="outline" size="icon" onClick={handleShare}>
                        <Share2 size={18} />
                      </Button>
                      
                      <NFTReportDialog nftId={nft.id} buttonSize="icon" variant="outline" buttonLabel="" />
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge className="bg-primary-400/10 text-primary-400 border-primary-400/20">
                      {nft.network}
                    </Badge>
                    <div className="text-gray-400 hidden lg:inline-flex items-center hover:text-primary-400">
                      <Link to={`/nft/collections/${nft.collectionId}`} className="flex items-center">
                        Collection: {nft.collectionName}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
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
                      onClick={handleBuy}
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
                        <NFTAttributeGrid attributes={nft.attributes} />
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
                      <NFTTransactionHistory transactions={transactions} />
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

export default NFTDetailView;
