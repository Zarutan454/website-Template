import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNFTs } from '@/hooks/useNFTs';
import { NFT, NFTTransaction } from '@/types/nft';
import NFTDetailView from '@/components/NFT/NFTDetailView';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext.utils';
import { useMining } from '@/hooks/useMining';

const NFTDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchNFTById, fetchTransactions, buyNFT, likeNFT, isLoading } = useNFTs();
  const { user: profile } = useAuth();
  const { recordActivity } = useMining();
  
  const [nft, setNft] = useState<NFT | null>(null);
  const [transactions, setTransactions] = useState<NFTTransaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  
  useEffect(() => {
    const loadNFTData = async () => {
      if (!id) {
        setError('Keine NFT-ID angegeben');
        return;
      }
      
      try {
        const nftData = await fetchNFTById(id);
        setNft(nftData);
        
        // Check if user has liked this NFT
        if (profile && nftData) {
          const liked = await checkIsLiked(nftData.id, profile.id);
          setIsLiked(liked);
        }
        
        const txHistory = await fetchTransactions(id);
        setTransactions(txHistory);
      } catch (err) {
        setError('NFT konnte nicht geladen werden');
      }
    };
    
    loadNFTData();
  }, [id, fetchNFTById, fetchTransactions, profile]);
  
  const checkIsLiked = async (nftId: string, userId: string) => {
    try {
      // Implement this function in your useNFTs hook to check if the user has liked this NFT
      // For now, let's return a dummy result
      return false;
    } catch (error) {
      return false;
    }
  };
  
  const handleBuyNFT = async () => {
    if (!nft || !profile) {
      toast.error('Du musst angemeldet sein, um ein NFT zu kaufen');
      return;
    }
    
    try {
      await buyNFT(nft.id);
      
      // Mining-Aktivität aufzeichnen - use 'achievement_unlocked' as a valid type
      try {
        await recordActivity('achievement_unlocked', 30, 2);
        toast.success("+2 BSN durch NFT-Kauf!");
      } catch (error) {
      }
      
      // NFT-Daten neu laden
      const updatedNFT = await fetchNFTById(nft.id);
      setNft(updatedNFT);
      
      const updatedTransactions = await fetchTransactions(nft.id);
      setTransactions(updatedTransactions);
      
    } catch (err) {
      toast.error('Der Kauf konnte nicht abgeschlossen werden');
    }
  };
  
  const handleLikeNFT = async () => {
    if (!nft || !profile) {
      toast.error('Du musst angemeldet sein, um ein NFT zu liken');
      return;
    }
    
    try {
      const success = await likeNFT(nft.id);
      
      if (success) {
        setIsLiked(!isLiked);
        
        if (!isLiked) {
          // Only record activity if user is liking, not unliking - use like as a valid type
          try {
            await recordActivity('like', 5, 0.5);
            toast.success("+0.5 BSN durch NFT-Like!");
          } catch (error) {
          }
        }
        
        // Refresh NFT data
        const updatedNFT = await fetchNFTById(nft.id);
        setNft(updatedNFT);
      }
    } catch (err) {
      toast.error('Der Like konnte nicht gespeichert werden');
    }
  };
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-red-400 mb-4">{error}</h2>
          <p className="text-gray-400 mb-6">Es ist ein Fehler beim Laden des NFTs aufgetreten.</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
        </div>
      </div>
    );
  }
  
  if (isLoading || !nft) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Skeleton className="h-8 w-1/3" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
          
          <div className="lg:col-span-2">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-8 w-1/2 mb-6" />
            
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <NFTDetailView 
      nft={nft} 
      transactions={transactions}
      onBuy={handleBuyNFT}
    />
  );
};

export default NFTDetailPage;

