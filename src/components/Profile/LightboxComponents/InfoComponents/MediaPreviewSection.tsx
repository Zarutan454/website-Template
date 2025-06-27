
import React from 'react';
import { Card } from '@/components/ui/card';
import { Media } from '@/types/media';
import { useTheme } from '@/components/ThemeProvider';
import { motion } from 'framer-motion';
import { ImageIcon, VideoIcon, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import ShareButton from './ShareButton';

interface MediaPreviewSectionProps {
  media: Media;
  className?: string;
  loading?: boolean;
}

const MediaPreviewSection = React.memo(({ 
  media,
  className,
  loading = false
}: MediaPreviewSectionProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Memoized theme styles
  const themeStyles = React.useMemo(() => ({
    card: cn(
      'overflow-hidden relative',
      isDarkMode ? 'bg-black/40 border-gray-800' : 'bg-white/40 border-gray-200',
      className
    ),
    titleContainer: cn(
      'absolute bottom-0 left-0 right-0 p-3 backdrop-blur-sm',
      isDarkMode ? 'bg-black/30' : 'bg-white/60'
    ),
    title: isDarkMode ? 'text-white' : 'text-gray-800',
    fallbackIcon: isDarkMode ? 'text-gray-400' : 'text-gray-500'
  }), [isDarkMode, className]);
  
  if (loading) {
    return (
      <Card className={themeStyles.card}>
        <div className="aspect-video flex items-center justify-center">
          <Skeleton className="h-full w-full" />
        </div>
      </Card>
    );
  }
  
  if (!media.url) {
    return (
      <Card className={themeStyles.card}>
        <div className="aspect-video flex flex-col items-center justify-center gap-2 p-4">
          {media.type === 'image' ? (
            <ImageIcon className={`h-12 w-12 ${themeStyles.fallbackIcon}`} />
          ) : (
            <VideoIcon className={`h-12 w-12 ${themeStyles.fallbackIcon}`} />
          )}
          <p className="text-sm text-muted-foreground text-center">
            Keine Medien verfügbar
          </p>
        </div>
      </Card>
    );
  }
  
  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        aria-labelledby={media.title ? "media-preview-heading" : undefined}
      >
        <Card className={themeStyles.card}>
          <div className="absolute top-2 right-2 z-10">
            <ShareButton url={media.url} title={media.title} />
          </div>
          
          <div 
            className="relative aspect-video flex items-center justify-center p-2"
            style={{ maxHeight: 'min(40vh, 600px)' }}
          >
            {media.type === 'image' ? (
              <img 
                src={media.url} 
                alt={media.title || "Medienbild"} 
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <video
                src={media.url}
                className="h-full w-full object-contain"
                controls
                preload="metadata"
                aria-label={media.title || "Media player"}
              />
            )}
            
            {media.title && (
              <div className={themeStyles.titleContainer}>
                <div className="flex items-center gap-2">
                  <h3 
                    id="media-preview-heading"
                    className={`text-lg font-semibold ${themeStyles.title} line-clamp-1`}
                  >
                    {media.title}
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      {media.type === 'image' ? 'Bildvorschau' : 'Videoplayer'}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
});

MediaPreviewSection.displayName = 'MediaPreviewSection';

export default MediaPreviewSection;
