import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NFTCollectionGrid from '@/components/NFT/NFTCollectionGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Search, Filter, Grid3X3, SlidersHorizontal } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useMining } from '@/hooks/useMining';

const mockCollections = [
  {
    id: '1',
    name: 'Crypto Punks',
    description: 'CryptoPunks launched as a fixed set of 10,000 items in mid-2017 and became one of the inspirations for the ERC-721 standard.',
    bannerUrl: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=1920',
    logoUrl: 'https://i.seadn.io/gae/BdxvLseXcfl57BiuQcQYdJ64v-aI8din7WPk0Pgo3qQFhAUH-B6i-dCqqc_mCkRIzULmwzwecnohLhrcH8A9mpWIZqA7ygc52Sr81hE?auto=format&dpr=1&w=256',
    contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb',
    network: 'ethereum',
    createdAt: '2021-03-11T09:08:34.123Z',
    itemCount: 10000,
    ownerCount: 3500,
    floorPrice: 68.5,
    floorPriceCurrency: 'ETH',
    volume24h: 12.4,
    verified: true
  },
  {
    id: '2',
    name: 'Bored Ape Yacht Club',
    description: 'The Bored Ape Yacht Club is a collection of 10,000 unique Bored Ape NFTs— unique digital collectibles living on the Ethereum blockchain.',
    bannerUrl: 'https://i.seadn.io/gae/i5dYZRkVCUK97bfprQ3WXyrT9BnLSZtVKGJlKQ919uaUB0sxbngVCioaiyu9r6snqfi2aaTyIvv6DHm4m2R3y7hMajbsv14pSZK8mhs?auto=format&dpr=1&w=1920',
    logoUrl: 'https://i.seadn.io/gae/Ju9CkWtV-1Okvf45wo8UctR-M9He2PjILP0oOvxE89AyiPPGtrR3gysu1Zgy0hjd2xKIgjJJtWIc0ybj4Vd7wv8t3pxDGHoJBzDB?auto=format&dpr=1&w=256',
    contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    network: 'ethereum',
    createdAt: '2021-04-22T14:43:07.123Z',
    itemCount: 10000,
    ownerCount: 6400,
    floorPrice: 32.88,
    floorPriceCurrency: 'ETH',
    volume24h: 8.2,
    verified: true
  },
  {
    id: '3',
    name: 'Azuki',
    description: 'Azuki starts with a collection of 10,000 avatars that give you membership access to The Garden: a corner of the internet where artists, builders, and web3 enthusiasts meet to create a decentralized future.',
    bannerUrl: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=1920',
    logoUrl: 'https://i.seadn.io/gae/H8jOCJuQokNqGBpkBN5wk1oZwO7LM8bNnrHCaekV2nKjnCqw6UB5oaH8XyNeBDj6bA_n1mjejzhFQUP3O1NfjFLHr3FOaeHcTOOT?auto=format&dpr=1&w=256',
    contractAddress: '0xed5af388653567af2f388e6224dc7c4b3241c544',
    network: 'ethereum',
    createdAt: '2022-01-12T18:16:42.123Z',
    itemCount: 10000,
    ownerCount: 5200,
    floorPrice: 14.2,
    floorPriceCurrency: 'ETH',
    volume24h: 3.8,
    verified: true
  },
  {
    id: '4',
    name: 'Doodles',
    description: 'A community-driven collectibles project featuring art by Burnt Toast. Doodles come in a joyful range of colors, traits and sizes with a collection size of 10,000.',
    bannerUrl: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?auto=format&dpr=1&w=1920',
    logoUrl: 'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?auto=format&dpr=1&w=256',
    contractAddress: '0x8a90cab2b38dba80c64b7734e58ee1db38b8992e',
    network: 'ethereum',
    createdAt: '2021-10-17T11:32:18.123Z',
    itemCount: 10000,
    ownerCount: 4800,
    floorPrice: 8.75,
    floorPriceCurrency: 'ETH',
    volume24h: 2.1,
    verified: true
  },
  {
    id: '5',
    name: 'Cool Cats',
    description: 'Cool Cats are a collection of 9,999 randomly generated and stylistically curated NFTs that exist on the Ethereum Blockchain.',
    bannerUrl: 'https://i.seadn.io/gae/LIov33kogXOK4XZd2ESj29sqm_Hww5JSdO7AFn5wjt8xgnJJ0UpNV9yITqxra3s_LMEW1AnnrgOVB_hDpjJRA1uF4skI5Sdi_9rULi8?auto=format&dpr=1&w=1920',
    logoUrl: 'https://i.seadn.io/gae/LIov33kogXOK4XZd2ESj29sqm_Hww5JSdO7AFn5wjt8xgnJJ0UpNV9yITqxra3s_LMEW1AnnrgOVB_hDpjJRA1uF4skI5Sdi_9rULi8?auto=format&dpr=1&w=256',
    contractAddress: '0x1a92f7381b9f03921564a437210bb9396471050c',
    network: 'ethereum',
    createdAt: '2021-07-08T22:05:36.123Z',
    itemCount: 9999,
    ownerCount: 3700,
    floorPrice: 2.9,
    floorPriceCurrency: 'ETH',
    volume24h: 0.8,
    verified: true
  },
  {
    id: '6',
    name: 'Pudgy Penguins',
    description: 'Pudgy Penguins is a collection of 8,888 NFTs, waddling through Web3. Embodying empathy & compassion, Pudgy Penguins are a beacon of positivity in the NFT Space.',
    bannerUrl: 'https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqIDgOa?auto=format&dpr=1&w=1920',
    logoUrl: 'https://i.seadn.io/gae/yNi-XdGxsgQCPpqSio4o31ygAV6wURdIdInWRcFIl46UjUQ1eV7BEndGe8L661OoG-clRi7EgInLX4LPu9Jfw4fq0bnVYHqIDgOa?auto=format&dpr=1&w=256',
    contractAddress: '0xbd3531da5cf5857e7cfaa92426877b022e612cf8',
    network: 'ethereum',
    createdAt: '2021-07-22T16:14:22.123Z',
    itemCount: 8888,
    ownerCount: 4200,
    floorPrice: 6.42,
    floorPriceCurrency: 'ETH',
    volume24h: 1.5,
    verified: true
  }
];

const NFTCollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState(mockCollections);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkFilter, setNetworkFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState<string | undefined>(undefined);
  
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { recordActivity, isMining } = useMining();
  
  useEffect(() => {
    const loadCollections = async () => {
      setIsLoading(true);
      setError(undefined);
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (profile && isMining) {
          try {
            await recordActivity('nft_like', 3, 0.2);
          } catch (err) {
            console.error('Error recording mining activity:', err);
          }
        }
        
        setCollections(mockCollections);
      } catch (err) {
        console.error('Error loading collections:', err);
        setError('Fehler beim Laden der Kollektionen. Bitte versuche es später erneut.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCollections();
  }, [profile, isMining, recordActivity]);
  
  const filteredCollections = collections
    .filter(collection => {
      if (networkFilter !== 'all' && collection.network !== networkFilter) {
        return false;
      }
      
      if (searchTerm && !collection.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'floor_high':
          return (b.floorPrice || 0) - (a.floorPrice || 0);
        case 'floor_low':
          return (a.floorPrice || 0) - (b.floorPrice || 0);
        case 'volume':
          return (b.volume24h || 0) - (a.volume24h || 0);
        default:
          return 0;
      }
    });
  
  const handleRetry = () => {
    setCollections([]);
    setIsLoading(true);
    
    setTimeout(() => {
      setCollections(mockCollections);
      setIsLoading(false);
    }, 1500);
  };
  
  const handleFilterOpen = () => {
  };
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card className="border-primary/20 shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Grid3X3 className="h-6 w-6 text-primary" />
            NFT Kollektionen
          </CardTitle>
          <CardDescription>
            Entdecke die beliebtesten NFT-Kollektionen auf verschiedenen Blockchains
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Kollektionen durchsuchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Netzwerk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Netzwerke</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="polygon">Polygon</SelectItem>
                  <SelectItem value="binance">Binance</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sortieren nach" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Neueste zuerst</SelectItem>
                  <SelectItem value="oldest">Älteste zuerst</SelectItem>
                  <SelectItem value="floor_high">Höchster Floor Price</SelectItem>
                  <SelectItem value="floor_low">Niedrigster Floor Price</SelectItem>
                  <SelectItem value="volume">Höchstes Volumen</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={handleFilterOpen}>
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
          
          <NFTCollectionGrid
            collections={filteredCollections}
            isLoading={isLoading}
            isEmpty={filteredCollections.length === 0}
            error={error}
            onRetry={handleRetry}
            onFilter={handleFilterOpen}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default NFTCollectionsPage;
