
import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { ImageIcon, PlayCircle, FolderIcon, Info } from 'lucide-react';
import { Media } from '@/types/media';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface MediaGridTabProps {
  media: Media[];
  isLoading: boolean;
  onMediaClick: (id: string) => void;
  isAlbumView?: boolean;
  onMediaItemClick?: (index: number) => void;
}

const MediaGridTab: React.FC<MediaGridTabProps> = ({ 
  media, 
  isLoading, 
  onMediaClick,
  isAlbumView = false,
  onMediaItemClick
}) => {
  // Track loading state for individual media items
  const [loadingItems, setLoadingItems] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleImageLoad = (id: string) => {
    setLoadingItems(prev => ({
      ...prev,
      [id]: false
    }));
  };

  const handleMediaItemClick = (index: number) => {
    // For albums, we'll navigate to the album detail page instead of opening lightbox
    if (isAlbumView) {
      return;
    }
    
    // Call the onMediaItemClick handler if provided
    if (onMediaItemClick) {
      onMediaItemClick(index);
    }
  };

  const handleExternalClick = (id: string) => {
    // Call the original onMediaClick handler for external navigation
    onMediaClick(id);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {Array(9).fill(0).map((_, i) => (
          <div key={i} className="aspect-square bg-dark-200/40 animate-pulse rounded-md" />
        ))}
      </div>
    );
  }

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-dark-200/40 w-16 h-16 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-white">Keine Medien</h3>
        <p className="text-gray-400 mt-2 max-w-md">
          Es wurden noch keine Medien geteilt.
        </p>
      </div>
    );
  }

  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <motion.div 
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {media.map((mediaItem, index) => {
        // Check if it's an album
        const isAlbum = isAlbumView && 'title' in mediaItem;
        
        // Create the appropriate content
        const content = (
          <motion.div
            key={mediaItem.id}
            className="aspect-square bg-dark-200/20 relative overflow-hidden rounded-md group"
            variants={item}
            whileHover={{ scale: 0.98 }}
            onClick={() => isAlbum ? null : handleMediaItemClick(index)}
          >
            {/* Loading placeholder */}
            {(loadingItems[mediaItem.id] !== false) && (
              <div className="absolute inset-0 flex items-center justify-center bg-dark-300/60 z-10">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            
            {/* Media */}
            <img 
              src={mediaItem.thumbnailUrl || mediaItem.url} 
              alt={mediaItem.title || "Media"} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onLoad={() => handleImageLoad(mediaItem.id)}
              loading="lazy"
            />
            
            {/* Overlay with gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Content container positioned at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {/* Title if exists */}
                {mediaItem.title && (
                  <p className="text-white text-sm font-medium truncate">{mediaItem.title}</p>
                )}
                
                {/* Description if exists */}
                {mediaItem.description && (
                  <p className="text-white/80 text-xs mt-1 line-clamp-2">{mediaItem.description}</p>
                )}
              </div>
            </div>
            
            {/* Type indicator badges */}
            <div className="absolute top-2 right-2 flex gap-1">
              {/* Video indicator */}
              {mediaItem.type === "video" && (
                <Badge variant="secondary" className="bg-black/50 flex items-center gap-1 backdrop-blur-sm border-black/10">
                  <PlayCircle className="h-3 w-3" />
                  <span className="text-xs">Video</span>
                </Badge>
              )}
              
              {/* Album indicator */}
              {isAlbum && (
                <Badge variant="secondary" className="bg-black/50 flex items-center gap-1 backdrop-blur-sm border-black/10">
                  <FolderIcon className="h-3 w-3" />
                  <span className="text-xs">Album</span>
                </Badge>
              )}
            </div>
          </motion.div>
        );
        
        return isAlbum ? (
          <Link 
            key={mediaItem.id} 
            to={`/album/${mediaItem.id}`}
            className="block"
          >
            {content}
          </Link>
        ) : (
          <React.Fragment key={mediaItem.id}>
            {content}
          </React.Fragment>
        );
      })}
    </motion.div>
  );
};

export default MediaGridTab;
