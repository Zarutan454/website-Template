
import React from 'react';
import { ArrowLeft, ExternalLink, Share2, Heart, Flag, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { NFT } from '@/types/nft';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface NFTDetailHeaderProps {
  nft: NFT;
  isOwner: boolean;
  onShare?: () => void;
  onLike?: () => void;
  onBuy?: () => void;
}

const NFTDetailHeader: React.FC<NFTDetailHeaderProps> = ({
  nft,
  isOwner,
  onShare,
  onLike,
  onBuy
}) => {
  const navigate = useNavigate();
  const [liked, setLiked] = React.useState(false);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const handleLike = () => {
    setLiked(!liked);
    if (onLike) onLike();
  };
  
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      const url = window.location.href;
      navigator.clipboard.writeText(url)
        .then(() => toast.success('Link in die Zwischenablage kopiert'))
        .catch(() => toast.error('Fehler beim Kopieren des Links'));
    }
  };
  
  const handleViewOnExplorer = () => {
    if (!nft.contractAddress) {
      toast.error("Keine Vertragsadresse verfügbar");
      return;
    }
    
    const getExplorerUrl = (network: string, address: string, tokenId: string) => {
      switch (network.toLowerCase()) {
        case 'ethereum':
          return `https://opensea.io/assets/ethereum/${address}/${tokenId}`;
        case 'polygon':
          return `https://opensea.io/assets/matic/${address}/${tokenId}`;
        case 'bnb':
        case 'binance':
          return `https://opensea.io/assets/bsc/${address}/${tokenId}`;
        default:
          return `https://opensea.io/assets/ethereum/${address}/${tokenId}`;
      }
    };
    
    const explorerUrl = getExplorerUrl(nft.network, nft.contractAddress, nft.tokenId);
    window.open(explorerUrl, '_blank');
  };
  
  const formattedDate = nft.createdAt 
    ? formatDistanceToNow(new Date(nft.createdAt), { addSuffix: true, locale: de }) 
    : '';
  
  const getNetworkColor = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return 'bg-blue-500 text-white';
      case 'polygon':
        return 'bg-purple-500 text-white';
      case 'bnb':
      case 'binance':
        return 'bg-yellow-500 text-black';
      default:
        return 'bg-gray-500 text-white';
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleGoBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold flex-1">{nft.name}</h1>
        
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            className={liked ? 'text-red-500' : ''}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleViewOnExplorer}
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mb-4">
        <Badge className={getNetworkColor(nft.network)}>
          {nft.network}
        </Badge>
        
        {nft.collectionName && (
          <span className="text-sm text-gray-400">
            Sammlung: <span className="text-gray-300">{nft.collectionName}</span>
          </span>
        )}
        
        <span className="text-sm text-gray-400">
          Erstellt: <span className="text-gray-300">{formattedDate}</span>
        </span>
        
        {isOwner && (
          <Badge variant="outline" className="bg-primary/20 text-primary border-primary">
            Dein NFT
          </Badge>
        )}
      </div>
      
      {nft.price && nft.listed && (
        <div className="mb-6 bg-dark-100 p-4 rounded-lg border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-gray-400">Aktueller Preis</span>
              <div className="text-2xl font-bold text-primary">
                {nft.price} {nft.currency}
              </div>
            </div>
            {!isOwner && (
              <Button onClick={onBuy}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Kaufen
              </Button>
            )}
            {isOwner && (
              <Button variant="outline">
                Preis ändern
              </Button>
            )}
          </div>
        </div>
      )}
      
      <Separator className="my-4" />
    </div>
  );
};

export default NFTDetailHeader;
