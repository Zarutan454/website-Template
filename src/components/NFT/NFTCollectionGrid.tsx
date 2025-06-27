import React, { useState } from 'react';
import NFTCollectionCard from './NFTCollectionCard';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { Grid3X3, Filter, Search, SlidersHorizontal, ArrowDownAZ } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface NFTCollection {
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

interface NFTCollectionGridProps {
  collections: NFTCollection[];
  isLoading: boolean;
  isEmpty?: boolean;
  error?: string;
  onRetry?: () => void;
  onFilter?: () => void;
}

const NFTCollectionGrid: React.FC<NFTCollectionGridProps> = ({
  collections: initialCollections,
  isLoading,
  isEmpty = false,
  error,
  onRetry,
  onFilter
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  
  const collections = React.useMemo(() => {
    let filtered = [...initialCollections];
    
    if (searchTerm) {
      filtered = filtered.filter(collection => 
        collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collection.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    switch (sortBy) {
      case 'newest':
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'name':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'items':
        return filtered.sort((a, b) => b.itemCount - a.itemCount);
      case 'owners':
        return filtered.sort((a, b) => b.ownerCount - a.ownerCount);
      case 'price':
        return filtered.sort((a, b) => (b.floorPrice || 0) - (a.floorPrice || 0));
      default:
        return filtered;
    }
  }, [initialCollections, searchTerm, sortBy]);
  const renderFilterUI = () => (
    <motion.div 
      className="mb-6 space-y-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kollektionen durchsuchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-[180px] flex items-center gap-2">
            <ArrowDownAZ className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Sortieren nach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Neueste zuerst</SelectItem>
            <SelectItem value="oldest">Älteste zuerst</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="items">Meiste Items</SelectItem>
            <SelectItem value="owners">Meiste Besitzer</SelectItem>
            <SelectItem value="price">Höchster Preis</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="sm:w-auto"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      {showFilters && (
        <motion.div 
          className="p-4 border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <h4 className="text-sm font-medium mb-2">Netzwerk</h4>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Alle Netzwerke" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Netzwerke</SelectItem>
                <SelectItem value="ethereum">Ethereum</SelectItem>
                <SelectItem value="polygon">Polygon</SelectItem>
                <SelectItem value="arbitrum">Arbitrum</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Verifiziert</h4>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="Alle Kollektionen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kollektionen</SelectItem>
                <SelectItem value="verified">Nur verifizierte</SelectItem>
                <SelectItem value="unverified">Nicht verifizierte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Sortieren nach</h4>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sortieren nach" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Neueste zuerst</SelectItem>
                <SelectItem value="oldest">Älteste zuerst</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="items">Meiste Items</SelectItem>
                <SelectItem value="owners">Meiste Besitzer</SelectItem>
                <SelectItem value="price">Höchster Preis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>
      )}
      
      {searchTerm && collections.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {collections.length} {collections.length === 1 ? 'Ergebnis' : 'Ergebnisse'} für "{searchTerm}"
        </div>
      )}
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        {renderFilterUI()}
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner size="lg" text="Kollektionen werden geladen..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {renderFilterUI()}
        <EmptyState
          title="Fehler beim Laden der Kollektionen"
          description={error}
          icon={<Grid3X3 className="h-12 w-12 text-amber-500" />}
          action={
            onRetry && (
              <Button onClick={onRetry} variant="default">
                Erneut versuchen
              </Button>
            )
          }
          className="py-12"
        />
      </div>
    );
  }

  if (isEmpty || collections.length === 0) {
    return (
      <div className="space-y-6">
        {renderFilterUI()}
        <EmptyState
          title="Keine Kollektionen gefunden"
          description={searchTerm 
            ? `Es wurden keine NFT-Kollektionen gefunden, die "${searchTerm}" enthalten.` 
            : "Es wurden keine NFT-Kollektionen gefunden, die deinen Kriterien entsprechen."}
          icon={<Grid3X3 className="h-12 w-12" />}
          action={
            onFilter && (
              <Button onClick={onFilter} variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter anpassen
              </Button>
            )
          }
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderFilterUI()}
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {collections.map((collection, index) => (
          <motion.div
            key={collection.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <NFTCollectionCard
              id={collection.id}
              name={collection.name}
              description={collection.description}
              bannerUrl={collection.bannerUrl}
              logoUrl={collection.logoUrl}
              contractAddress={collection.contractAddress}
              network={collection.network}
              createdAt={collection.createdAt}
              itemCount={collection.itemCount}
              ownerCount={collection.ownerCount}
              floorPrice={collection.floorPrice}
              floorPriceCurrency={collection.floorPriceCurrency}
              volume24h={collection.volume24h}
              verified={collection.verified}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default NFTCollectionGrid;
