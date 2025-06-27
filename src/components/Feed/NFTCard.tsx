import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Share2, 
  ExternalLink, 
  Eye, 
  ShoppingCart, 
  Heart,
  MoreHorizontal
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useMining } from '@/hooks/useMining';
import { NFTAttribute } from '@/types/token';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import NFTReportDialog from '../NFT/NFTReportDialog';

interface NFTCardProps {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  collectionName: string;
  tokenId: string;
  contractAddress: string;
  network: string;
  createdAt: string;
  price: number | null;
  currency: string;
  isForSale: boolean;
  attributes?: NFTAttribute[];
  creatorId: string;
}

const NFTCard: React.FC<NFTCardProps> = ({
  id,
  name,
  description,
  imageUrl,
  collectionName,
  tokenId,
  contractAddress,
  network,
  createdAt,
  price,
  currency,
  isForSale,
  attributes = [],
  creatorId
}) => {
  const navigate = useNavigate();
  const { user: profile } = useAuth()();
  const { recordActivity, isMining } = useMining();
  const [liked, setLiked] = React.useState(false);
  
  const handleShare = async () => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um diese Aktion auszuführen");
      return;
    }
    
    const nftUrl = `${window.location.origin}/nfts/${id}`;
    
    try {
      await navigator.clipboard.writeText(nftUrl);
      toast.success("NFT-Link in die Zwischenablage kopiert!");
      
      if (isMining) {
        try {
          await recordActivity('nft_share', 5, 0.5);
          toast.success("+0.5 BSN durch NFT-Share!");
        } catch (error) {
        }
      }
    } catch (error) {
      toast.error("Fehler beim Kopieren in die Zwischenablage");
    }
  };

  const handleLike = async () => {
    if (!profile) {
      toast.error("Du musst angemeldet sein, um diese Aktion auszuführen");
      return;
    }
    
    setLiked(!liked);
    
    if (isMining && !liked) {
      try {
        await recordActivity('nft_like', 2, 0.1);
        toast.success("+0.1 BSN durch NFT-Like!");
      } catch (error) {
        console.error('Mining error:', error);
      }
    }
  };

  const viewNFTDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/nfts/${id}`);
  };

  const viewExplorer = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!contractAddress) {
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
    
    const explorerUrl = getExplorerUrl(network, contractAddress, tokenId);
    window.open(explorerUrl, '_blank');
  };

  const formattedDate = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: de }) 
    : '';

  const isOwner = profile && profile.id === creatorId;

  const getNetworkColor = (network: string) => {
    switch (network.toLowerCase()) {
      case 'ethereum':
        return 'bg-blue-500/80';
      case 'polygon':
        return 'bg-purple-500/80';
      case 'bnb':
      case 'binance':
        return 'bg-yellow-500/80';
      default:
        return 'bg-dark-200/80';
    }
  };

  const networkBadgeClass = `absolute top-2 right-2 ${getNetworkColor(network)} backdrop-blur-sm`;

  return (
    <Card className="w-full h-full flex flex-col bg-dark-200 border-gray-700 hover:border-primary/50 transition-all overflow-hidden shadow-md hover:shadow-lg">
      <div className="relative h-56 w-full overflow-hidden group cursor-pointer" onClick={viewNFTDetails}>
        <img 
          src={imageUrl || 'https://via.placeholder.com/400?text=NFT'} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=NFT+Image+Not+Found';
          }}
        />
        <Badge 
          className={networkBadgeClass}
          variant="secondary"
        >
          {network}
        </Badge>
        {isOwner && (
          <Badge 
            className="absolute top-2 left-2 bg-primary/80 backdrop-blur-sm"
            variant="secondary"
          >
            Dein NFT
          </Badge>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
          <Button variant="secondary" size="sm" onClick={viewNFTDetails} className="mr-2 backdrop-blur-sm">
            <Eye size={16} className="mr-2" /> Ansehen
          </Button>
          {isForSale && (
            <Button variant="default" size="sm" className="backdrop-blur-sm">
              <ShoppingCart size={16} className="mr-2" /> Kaufen
            </Button>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2 pt-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-white text-lg line-clamp-1">{name}</CardTitle>
            <div className="text-sm text-muted-foreground flex items-center">
              <span className="line-clamp-1">{collectionName}</span>
              <span className="mx-1">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="py-3 flex-grow">
        <div className="flex flex-col justify-between h-full">
          <div>
            {description && (
              <p className="text-sm text-gray-300 line-clamp-2 mb-3">{description}</p>
            )}
            
            {attributes && attributes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {attributes.slice(0, 3).map((attr, idx) => (
                  <Badge 
                    key={idx} 
                    variant="outline" 
                    className="text-xs bg-primary/5 hover:bg-primary/10 transition-colors border-primary/20"
                  >
                    <span className="font-medium mr-1">{attr.trait_type}:</span> 
                    <span>{attr.value.toString()}</span>
                  </Badge>
                ))}
                {attributes.length > 3 && (
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-gray-800/50 hover:bg-gray-800/80 transition-colors"
                  >
                    +{attributes.length - 3} mehr
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {price && (
            <div className="flex justify-between items-center mt-4 bg-primary/5 p-2 rounded-md border border-primary/10">
              <span className="text-sm font-medium">Preis:</span>
              <span className="font-semibold text-primary flex items-center">
                <img 
                  src={currency === 'ETH' ? '/images/eth-logo.png' : '/images/token-default.png'} 
                  alt={currency}
                  className="w-4 h-4 mr-1.5"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/token-default.png';
                  }}
                />
                {price} {currency}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 flex justify-between border-t border-gray-800 mt-auto">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLike}
            className={`h-9 w-9 rounded-full ${liked ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-gray-400 hover:text-red-400 hover:bg-red-400/10'}`}
          >
            <Heart size={18} className={liked ? 'fill-current' : ''} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleShare} 
            className="h-9 w-9 rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <Share2 size={18} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 rounded-full hover:bg-gray-700/30"
              >
                <MoreHorizontal size={18} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-dark-100 border-gray-700">
              <DropdownMenuItem asChild>
                <NFTReportDialog 
                  nftId={id} 
                  buttonLabel="NFT melden" 
                  showIcon={true}
                  variant="ghost"
                  className="w-full justify-start px-2 text-gray-300 hover:text-white"
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          {isForSale ? (
            <Button 
              variant="default" 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-white shadow-sm"
            >
              <ShoppingCart size={16} className="mr-2" /> Kaufen
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={viewExplorer}
              className="border-gray-700 hover:border-primary/50 hover:text-primary"
            >
              <ExternalLink size={16} className="mr-2" /> Explorer
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;
