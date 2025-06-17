import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Grid, 
  Users,
  TrendingUp,
  Info,
  CheckCircle,
  Eye,
  Share2,
  Heart,
  Bookmark
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface NFTCollectionCardProps {
  id: string;
  name: string;
  description: string;
  bannerUrl: string;
  logoUrl: string;
  contractAddress: string;
  network: string;
  createdAt: string;
  itemCount: number;
  ownerCount: number;
  floorPrice?: number;
  floorPriceCurrency?: string;
  volume24h?: number;
  verified: boolean;
}

const NFTCollectionCard: React.FC<NFTCollectionCardProps> = ({
  id,
  name,
  description,
  bannerUrl,
  logoUrl,
  contractAddress,
  network,
  createdAt,
  itemCount,
  ownerCount,
  floorPrice,
  floorPriceCurrency = 'ETH',
  volume24h,
  verified
}) => {
  const navigate = useNavigate();
  
  const viewCollectionDetails = () => {
    navigate(`/nft-collections/${id}`);
  };

  const viewExplorer = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!contractAddress) {
      return;
    }
    
    const getExplorerUrl = (network: string, address: string) => {
      switch (network.toLowerCase()) {
        case 'ethereum':
          return `https://opensea.io/collection/${address}`;
        case 'polygon':
          return `https://opensea.io/collection/${address}`;
        case 'bnb':
        case 'binance':
          return `https://opensea.io/collection/${address}`;
        default:
          return `https://opensea.io/collection/${address}`;
      }
    };
    
    const explorerUrl = getExplorerUrl(network, contractAddress);
    window.open(explorerUrl, '_blank');
  };

  const formattedDate = createdAt 
    ? formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: de }) 
    : '';

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

  const networkBadgeClass = `absolute top-3 right-3 ${getNetworkColor(network)} backdrop-blur-sm`;

  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
  };
  
  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Lesezeichen entfernt' : 'Lesezeichen gesetzt');
  };
  
  const toggleShareOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareOptions(!showShareOptions);
  };
  
  const shareCollection = (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/nft-collections/${id}`;
    const shareText = `Schau dir diese NFT-Kollektion an: ${name}`;
    
    let shareLink = '';
    
    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'telegram':
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Link in die Zwischenablage kopiert');
        setShowShareOptions(false);
        return;
      default:
        return;
    }
    
    window.open(shareLink, '_blank');
    setShowShareOptions(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={cn(
          "w-full h-full flex flex-col bg-dark-200 border-gray-700 transition-all overflow-hidden shadow-md cursor-pointer relative",
          isHovered ? "border-primary shadow-lg scale-[1.01]" : "hover:border-primary/50 hover:shadow-lg"
        )}
        onClick={viewCollectionDetails}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Action Buttons */}
        <div className={cn(
          "absolute top-3 left-3 z-10 flex gap-2 opacity-0 transition-opacity duration-300",
          isHovered && "opacity-100"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
            onClick={toggleFavorite}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
            onClick={toggleBookmark}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-primary text-primary")} />
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white"
              onClick={toggleShareOptions}
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <AnimatePresence>
              {showShareOptions && (
                <motion.div 
                  className="absolute top-full left-0 mt-2 bg-dark-100 border border-gray-700 rounded-md shadow-lg overflow-hidden z-20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="p-1 flex flex-col">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start text-xs py-1.5 px-3 hover:bg-dark-200"
                      onClick={(e) => shareCollection('twitter', e)}
                    >
                      Twitter
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start text-xs py-1.5 px-3 hover:bg-dark-200"
                      onClick={(e) => shareCollection('telegram', e)}
                    >
                      Telegram
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="justify-start text-xs py-1.5 px-3 hover:bg-dark-200"
                      onClick={(e) => shareCollection('copy', e)}
                    >
                      Link kopieren
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Banner and Logo */}
        <div className="relative h-36 w-full overflow-hidden">
          <img 
            src={bannerUrl || 'https://via.placeholder.com/800x200?text=Collection+Banner'} 
            alt={`${name} banner`} 
            className={cn(
              "w-full h-full object-cover transition-transform duration-500",
              isHovered && "scale-110"
            )}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x200?text=Collection+Banner';
            }}
          />
          <Badge 
            className={networkBadgeClass}
            variant="secondary"
          >
            {network}
          </Badge>
          
          <div className="absolute -bottom-10 left-4">
            <div className="h-20 w-20 rounded-xl overflow-hidden border-4 border-dark-200 bg-dark-100 shadow-md">
              <img 
                src={logoUrl || 'https://via.placeholder.com/200?text=Logo'} 
                alt={`${name} logo`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Logo';
                }}
              />
            </div>
          </div>
          
          {verified && (
            <div className="absolute -bottom-10 left-20">
              <Badge className="bg-primary/90 text-white flex items-center gap-1">
                <CheckCircle className="h-3 w-3" /> Verifiziert
              </Badge>
            </div>
          )}
          
          <div className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity flex items-center justify-center",
            isHovered && "opacity-100"
          )}>
            <Button variant="ghost" className="text-white bg-black/30 backdrop-blur-sm hover:bg-black/50">
              <Eye className="h-4 w-4 mr-2" /> Details ansehen
            </Button>
          </div>
        </div>
        
        <CardHeader className="pb-2 pt-12">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-white text-lg line-clamp-1 flex items-center gap-1">
                {name}
              </CardTitle>
              <div className="text-sm text-muted-foreground">
                Erstellt {formattedDate}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-2 flex-grow">
          <div className="flex flex-col justify-between h-full">
            <div>
              {description && (
                <p className={cn(
                  "text-sm text-gray-300 line-clamp-2 mb-3 transition-all duration-300",
                  isHovered && "text-white"
                )}>{description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className={cn(
                  "flex items-center gap-2 bg-dark-100 p-2.5 rounded-md transition-all duration-300",
                  isHovered && "bg-dark-100/80 border-l-2 border-primary pl-2"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-full bg-primary/10 transition-all duration-300",
                    isHovered && "bg-primary/20"
                  )}>
                    <Grid size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Items</div>
                    <div className="text-sm font-medium">{itemCount.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className={cn(
                  "flex items-center gap-2 bg-dark-100 p-2.5 rounded-md transition-all duration-300",
                  isHovered && "bg-dark-100/80 border-l-2 border-primary pl-2"
                )}>
                  <div className={cn(
                    "p-1.5 rounded-full bg-primary/10 transition-all duration-300",
                    isHovered && "bg-primary/20"
                  )}>
                    <Users size={14} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Besitzer</div>
                    <div className="text-sm font-medium">{ownerCount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {floorPrice && (
              <div className={cn(
                "flex justify-between items-center mt-4 p-3 rounded-md border transition-all duration-300",
                isHovered 
                  ? "bg-primary/10 border-primary/30" 
                  : "bg-primary/5 border-primary/10"
              )}>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Floor:</span>
                  <span className="text-sm font-medium flex items-center">
                    <img 
                      src={floorPriceCurrency === 'ETH' ? '/images/eth-logo.png' : '/images/token-default.png'} 
                      alt={floorPriceCurrency}
                      className={cn(
                        "w-3.5 h-3.5 mr-1 transition-all duration-300",
                        isHovered && "scale-110"
                      )}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/token-default.png';
                      }}
                    />
                    {floorPrice} {floorPriceCurrency}
                  </span>
                </div>
                
                {volume24h && (
                  <div className="flex items-center gap-1">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-xs text-green-500 font-medium">{volume24h} {floorPriceCurrency}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className={cn(
          "pt-3 flex justify-between border-t border-gray-800 mt-auto transition-all duration-300",
          isHovered && "border-gray-700"
        )}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "text-xs text-muted-foreground transition-colors duration-300",
                    isHovered && "text-gray-300"
                  )}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Info size={14} className="mr-1" />
                  {contractAddress.substring(0, 6)}...{contractAddress.substring(contractAddress.length - 4)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-mono">{contractAddress}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={viewExplorer}
            className={cn(
              "border-gray-700 transition-all duration-300",
              isHovered ? "border-primary text-primary" : "hover:border-primary/50 hover:text-primary"
            )}
          >
            <ExternalLink size={16} className="mr-2" /> Explorer
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default NFTCollectionCard;
