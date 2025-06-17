
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ImageIcon, FileIcon, Bookmark, Heart, Grid3X3, Search, Filter, Calendar, ArrowDownUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Media } from '@/types/media';
import { useInView } from 'react-intersection-observer';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedMediaGalleryProps {
  posts: Media[];
  saved: Media[];
  liked: Media[];
  collections: Media[];
  isLoading: boolean;
  isOwnProfile: boolean;
  onMediaClick: (id: string, type: 'post' | 'saved' | 'liked' | 'collection') => void;
}

type SortOption = 'newest' | 'oldest' | 'alphabetical';
type FilterOption = 'all' | 'image' | 'video';

// Masonry layout component
const MasonryGrid: React.FC<{
  items: Media[];
  onItemClick: (id: string) => void;
  isLoading: boolean;
  emptyStateMessage: string;
  columns?: number;
}> = ({ items, onItemClick, isLoading, emptyStateMessage, columns = 3 }) => {
  const [columnItems, setColumnItems] = useState<Media[][]>([]);
  
  // Distribute items across columns for a masonry effect
  useEffect(() => {
    if (items && items.length > 0) {
      const cols = Array.from({ length: columns }, () => [] as Media[]);
      
      items.forEach((item, index) => {
        const columnIndex = index % columns;
        cols[columnIndex].push(item);
      });
      
      setColumnItems(cols);
    } else {
      setColumnItems([]);
    }
  }, [items, columns]);
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-800 rounded-md" />
        ))}
      </div>
    );
  }
  
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FileIcon className="h-12 w-12 text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Keine Medien gefunden</h3>
        <p className="text-gray-400 max-w-md">{emptyStateMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {columnItems.map((column, colIndex) => (
        <div key={`column-${colIndex}`} className="flex flex-col gap-3">
          {column.map((item, itemIndex) => (
            <LazyMediaItem 
              key={`item-${colIndex}-${itemIndex}`}
              item={item}
              onClick={() => onItemClick(item.id)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Lazy-loaded media item component
const LazyMediaItem: React.FC<{
  item: Media;
  onClick: () => void;
}> = ({ item, onClick }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-md cursor-pointer relative group"
      onClick={onClick}
    >
      {item.type === 'image' || !item.type ? (
        <>
          {inView ? (
            <img 
              src={item.url || item.media_url || ''} 
              alt={item.caption || item.title || 'Medieninhalt'}
              className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 aspect-square"></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </>
      ) : item.type === 'video' ? (
        <div className="w-full h-full relative aspect-square bg-gray-900">
          {inView && (
            <>
              <video 
                src={item.url || item.media_url || ''} 
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                poster={item.thumbnailUrl}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8 4.5v11l7-5.5-7-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-700 aspect-square">
          <FileIcon className="h-12 w-12 text-gray-400" />
        </div>
      )}
      
      {item.title && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h4 className="text-white text-sm font-medium truncate">{item.title}</h4>
          {item.createdAt && (
            <p className="text-white/70 text-xs">
              {format(new Date(item.createdAt), 'dd. MMM yyyy', { locale: de })}
            </p>
          )}
        </div>
      )}
      
      {/* Type badge */}
      <div className="absolute top-2 left-2">
        <div className="bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {item.type === 'video' ? 'Video' : 'Bild'}
        </div>
      </div>
    </motion.div>
  );
};

const EnhancedMediaGallery: React.FC<EnhancedMediaGalleryProps> = ({
  posts,
  saved,
  liked,
  collections,
  isLoading,
  isOwnProfile,
  onMediaClick
}) => {
  const [activeTab, setActiveTab] = useState('posts');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [filterType, setFilterType] = useState<FilterOption>('all');
  
  // Sortierte und gefilterte Medienliste
  const filteredMedia = useMemo(() => {
    let mediaList: Media[] = [];
    
    // Wähle die richtige Medienliste basierend auf dem aktiven Tab
    switch (activeTab) {
      case 'posts':
        mediaList = [...posts];
        break;
      case 'saved':
        mediaList = [...saved];
        break;
      case 'liked':
        mediaList = [...liked];
        break;
      case 'collections':
        mediaList = [...collections];
        break;
      default:
        mediaList = [...posts];
    }
    
    // Filtern nach Typ
    if (filterType !== 'all') {
      mediaList = mediaList.filter(item => item.type === filterType);
    }
    
    // Filtern nach Suchbegriff
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      mediaList = mediaList.filter(item => 
        (item.title?.toLowerCase().includes(query)) || 
        (item.description?.toLowerCase().includes(query))
      );
    }
    
    // Sortieren
    return mediaList.sort((a, b) => {
      if (sortOption === 'newest') {
        return new Date(b.createdAt || b.created_at || 0).getTime() - 
               new Date(a.createdAt || a.created_at || 0).getTime();
      } else if (sortOption === 'oldest') {
        return new Date(a.createdAt || a.created_at || 0).getTime() - 
               new Date(b.createdAt || b.created_at || 0).getTime();
      } else if (sortOption === 'alphabetical') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [activeTab, posts, saved, liked, collections, searchQuery, sortOption, filterType]);
  
  const getEmptyStateMessage = (tab: string) => {
    switch (tab) {
      case 'posts':
        return isOwnProfile 
          ? 'Du hast noch keine Beiträge erstellt.' 
          : 'Dieser Benutzer hat noch keine Beiträge erstellt.';
      case 'saved':
        return isOwnProfile 
          ? 'Du hast noch keine Beiträge gespeichert.' 
          : 'Dieser Benutzer hat noch keine Beiträge gespeichert.';
      case 'liked':
        return isOwnProfile 
          ? 'Du hast noch keine Beiträge geliked.' 
          : 'Dieser Benutzer hat noch keine Beiträge geliked.';
      case 'collections':
        return isOwnProfile 
          ? 'Du hast noch keine Alben erstellt.' 
          : 'Dieser Benutzer hat noch keine Alben erstellt.';
      default:
        return 'Keine Medien gefunden.';
    }
  };
  
  return (
    <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 bg-gray-800/30 rounded-none p-0">
            <TabsTrigger 
              value="posts" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-gray-700/30"
            >
              <Grid3X3 size={16} />
              <span className="sr-only md:not-sr-only md:inline-block">Beiträge</span>
            </TabsTrigger>
            <TabsTrigger 
              value="saved" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-gray-700/30"
            >
              <Bookmark size={16} />
              <span className="sr-only md:not-sr-only md:inline-block">Gespeichert</span>
            </TabsTrigger>
            <TabsTrigger 
              value="liked" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-gray-700/30"
            >
              <Heart size={16} />
              <span className="sr-only md:not-sr-only md:inline-block">Geliked</span>
            </TabsTrigger>
            <TabsTrigger 
              value="collections" 
              className="flex items-center gap-2 py-3 rounded-none data-[state=active]:bg-gray-700/30"
            >
              <ImageIcon size={16} />
              <span className="sr-only md:not-sr-only md:inline-block">Alben</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Filter- und Suchleiste */}
          <div className="p-3 bg-gray-800/20 border-b border-gray-800/30">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 bg-gray-900/30 border-gray-700"
                />
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Filter className="h-4 w-4" />
                      <span className="hidden sm:inline-block">Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType('all')}>
                      Alle Typen
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('image')}>
                      Nur Bilder
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType('video')}>
                      Nur Videos
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <ArrowDownUp className="h-4 w-4" />
                      <span className="hidden sm:inline-block">Sortieren</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortOption('newest')}>
                      Neueste zuerst
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('oldest')}>
                      Älteste zuerst
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortOption('alphabetical')}>
                      Alphabetisch
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <TabsContent value="posts" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MasonryGrid
                items={filteredMedia}
                onItemClick={(id) => onMediaClick(id, 'post')}
                isLoading={isLoading}
                emptyStateMessage={getEmptyStateMessage('posts')}
              />
            </TabsContent>
            
            <TabsContent value="saved" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MasonryGrid
                items={filteredMedia}
                onItemClick={(id) => onMediaClick(id, 'saved')}
                isLoading={isLoading}
                emptyStateMessage={getEmptyStateMessage('saved')}
              />
            </TabsContent>
            
            <TabsContent value="liked" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MasonryGrid
                items={filteredMedia}
                onItemClick={(id) => onMediaClick(id, 'liked')}
                isLoading={isLoading}
                emptyStateMessage={getEmptyStateMessage('liked')}
              />
            </TabsContent>
            
            <TabsContent value="collections" className="m-0 focus-visible:outline-none focus-visible:ring-0">
              <MasonryGrid
                items={filteredMedia}
                onItemClick={(id) => onMediaClick(id, 'collection')}
                isLoading={isLoading}
                emptyStateMessage={getEmptyStateMessage('collections')}
                columns={2}
              />
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default EnhancedMediaGallery;
