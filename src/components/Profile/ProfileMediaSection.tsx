import React, { useState, useCallback, useMemo } from 'react';
import { useProfileMedia } from '@/hooks/useProfileMedia';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Image as ImageIcon, 
  Video, 
  Plus, 
  Grid3X3, 
  List, 
  Filter, 
  Download,
  Share2,
  Heart,
  MessageCircle,
  Play,
  Calendar,
  Eye,
  Upload,
  Folder,
  Search
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MediaLightbox from './MediaLightbox';
import { Media } from '@/types/media';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface ProfileMediaSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

interface MediaStats {
  totalMedia: number;
  totalImages: number;
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
}

const ProfileMediaSection: React.FC<ProfileMediaSectionProps> = ({ userId, isOwnProfile }) => {
  const { media, isLoading, refreshMedia } = useProfileMedia(userId, 'media', isOwnProfile);
  
  // State Management
  const [selectedMediaIndex, setSelectedMediaIndex] = useState<number>(-1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'images' | 'videos'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState<string>('all');

  // Filtered and sorted media
  const filteredMedia = useMemo(() => {
    if (!media) return [];
    
    let filtered = media;
    
    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => {
        if (filterType === 'images') return item.type === 'image';
        if (filterType === 'videos') return item.type === 'video';
        return true;
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt || b.created_at || '').getTime() - 
                 new Date(a.createdAt || a.created_at || '').getTime();
        case 'oldest':
          return new Date(a.createdAt || a.created_at || '').getTime() - 
                 new Date(b.createdAt || b.created_at || '').getTime();
        case 'popular':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [media, filterType, searchTerm, sortBy]);

  // Media statistics
  const mediaStats = useMemo<MediaStats>(() => {
    if (!media) return { totalMedia: 0, totalImages: 0, totalVideos: 0, totalViews: 0, totalLikes: 0 };
    
    return {
      totalMedia: media.length,
      totalImages: media.filter(item => item.type === 'image').length,
      totalVideos: media.filter(item => item.type === 'video').length,
      totalViews: media.reduce((sum, item) => sum + (item.views || 0), 0),
      totalLikes: media.reduce((sum, item) => sum + (item.likes || 0), 0)
    };
  }, [media]);

  // Event handlers
  const openLightbox = useCallback((index: number) => {
    setSelectedMediaIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const navigateMedia = useCallback((index: number) => {
    setSelectedMediaIndex(index);
  }, []);

  const handleUpload = useCallback(() => {
    toast.info('Upload-Funktionalität wird implementiert...');
  }, []);

  const handleShare = useCallback((mediaItem: any) => {
    if (navigator.share) {
      navigator.share({
        title: mediaItem.title || 'Medien',
        url: mediaItem.url || mediaItem.media_url
      });
    } else {
      navigator.clipboard.writeText(mediaItem.url || mediaItem.media_url);
      toast.success('Link kopiert!');
    }
  }, []);

  const handleDownload = useCallback((mediaItem: any) => {
    const link = document.createElement('a');
    link.href = mediaItem.url || mediaItem.media_url;
    link.download = mediaItem.title || 'download';
    link.click();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!media || media.length === 0) {
    return (
      <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800/60 flex items-center justify-center mb-6">
            <ImageIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Keine Medien</h3>
          <p className="text-gray-400 mb-6 max-w-md">
            {isOwnProfile
              ? 'Du hast noch keine Medien geteilt. Teile deine ersten Fotos und Videos!'
              : 'Dieser Benutzer hat noch keine Medien geteilt.'}
          </p>
          {isOwnProfile && (
            <Button onClick={handleUpload} className="bg-primary hover:bg-primary/90">
              <Upload className="mr-2 h-4 w-4" />
              Medien hochladen
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Convert media for lightbox
  const mediaForLightbox: Media[] = filteredMedia.map(item => ({
    id: item.id,
    url: item.url || item.media_url || '',
    type: item.type || 'image',
    title: item.title,
    description: item.description,
    createdAt: item.createdAt || item.created_at,
    authorId: item.authorId
  }));

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">Medien</h2>
          <div className="flex gap-4 text-sm text-gray-400">
            <span>{mediaStats.totalMedia} Medien</span>
            <span>{mediaStats.totalImages} Bilder</span>
            <span>{mediaStats.totalVideos} Videos</span>
            {mediaStats.totalViews > 0 && <span>{mediaStats.totalViews} Aufrufe</span>}
          </div>
        </div>
        {isOwnProfile && (
          <Button onClick={handleUpload} className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Hochladen
          </Button>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Medien durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="images">Bilder</SelectItem>
              <SelectItem value="videos">Videos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Neueste</SelectItem>
              <SelectItem value="oldest">Älteste</SelectItem>
              <SelectItem value="popular">Beliebt</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border border-gray-700 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Media Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map((item, index) => (
            <div
              key={item.id}
              className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => openLightbox(index)}
            >
              <img
                src={item.url || item.media_url}
                alt={item.title || `Medien ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />
              
              {/* Media Type Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type === 'video' ? (
                    <><Video className="w-3 h-3 mr-1" /> Video</>
                  ) : (
                    <><ImageIcon className="w-3 h-3 mr-1" /> Bild</>
                  )}
                </Badge>
              </div>

              {/* Play button for videos */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="flex gap-2 text-white text-xs">
                  {item.likes > 0 && (
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {item.likes}
                    </span>
                  )}
                  {item.views > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {item.views}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(item);
                    }}
                  >
                    <Share2 className="w-3 h-3" />
                  </Button>
                  {isOwnProfile && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-white hover:bg-white/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMedia.map((item, index) => (
            <Card
              key={item.id}
              className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/50 transition-colors cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.url || item.media_url}
                      alt={item.title || `Medien ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium truncate">
                          {item.title || `Medien ${index + 1}`}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {item.description || 'Keine Beschreibung'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDistanceToNow(new Date(item.createdAt || item.created_at || ''), { 
                              addSuffix: true, 
                              locale: de 
                            })}
                          </span>
                          {item.likes > 0 && (
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {item.likes}
                            </span>
                          )}
                          {item.views > 0 && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.views}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(item);
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                        {isOwnProfile && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(item);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && selectedMediaIndex >= 0 && (
        <MediaLightbox
          media={mediaForLightbox}
          currentIndex={selectedMediaIndex}
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          onNavigate={navigateMedia}
        />
      )}
    </div>
  );
};

export default ProfileMediaSection; 