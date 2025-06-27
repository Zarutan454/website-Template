
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Media } from '@/types/media';
import { Info, Link2, ImageIcon, VideoIcon } from 'lucide-react';
import { CopyButton } from '@/components/ui/copy-button';

interface MediaInfoSectionProps {
  media: Media;
  className?: string;
}

const ANIMATION_DURATION = 0.4;
const ENTRANCE_DELAY = 0.2;

const MediaInfoSection = React.memo(({ 
  media,
  className 
}: MediaInfoSectionProps) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Memoized theme styles
  const themeStyles = React.useMemo(() => ({
    card: cn(
      'backdrop-blur-sm',
      isDarkMode ? 'bg-black/40 border-gray-800' : 'bg-white/40 border-gray-200',
      className
    ),
    title: isDarkMode ? 'text-white' : 'text-gray-900',
    content: isDarkMode ? 'text-gray-300' : 'text-gray-700',
    separator: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
    codeBg: isDarkMode ? 'bg-gray-800/80' : 'bg-gray-100',
    codeText: isDarkMode ? 'text-blue-400' : 'text-blue-600'
  }), [isDarkMode, className]);

  // Media type display
  const mediaTypeDisplay = React.useMemo(() => ({
    icon: media.type === 'image' ? (
      <ImageIcon className="h-4 w-4 mr-1.5" />
    ) : (
      <VideoIcon className="h-4 w-4 mr-1.5" />
    ),
    text: media.type === 'image' ? 'Bild' : 'Video',
    color: media.type === 'image' ? 'bg-green-500/10 text-green-500' : 'bg-purple-500/10 text-purple-500'
  }), [media.type]);

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: ANIMATION_DURATION, 
          delay: ENTRANCE_DELAY,
          ease: 'easeOut'
        }}
        aria-labelledby="media-info-heading"
      >
        <Card className={themeStyles.card}>
          <CardContent className="p-4 space-y-4">
            {/* Title Section */}
            {media.title && (
              <section aria-labelledby="media-title-heading">
                <div className="flex items-center gap-2 mb-1">
                  <h3 
                    id="media-title-heading"
                    className={`text-sm font-medium ${themeStyles.title}`}
                  >
                    Titel
                  </h3>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Originaltitel der Mediendatei
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className={themeStyles.content}>
                  {media.title}
                </p>
              </section>
            )}
            
            {/* Description Section */}
            {media.description && (
              <section aria-labelledby="media-description-heading">
                <h3 
                  id="media-description-heading"
                  className={`text-sm font-medium ${themeStyles.title} mb-1`}
                >
                  Beschreibung
                </h3>
                <p className={`${themeStyles.content} text-sm`}>
                  {media.description}
                </p>
              </section>
            )}
            
            {/* Type Section */}
            <section aria-labelledby="media-type-heading">
              <h3 
                id="media-type-heading"
                className={`text-sm font-medium ${themeStyles.title} mb-1`}
              >
                Dateityp
              </h3>
              <Badge 
                variant={media.type === 'image' ? 'success' : 'info'} 
                className="inline-flex items-center"
              >
                {mediaTypeDisplay.icon}
                {mediaTypeDisplay.text}
              </Badge>
            </section>
            
            <Separator className={themeStyles.separator} />
            
            {/* URL Section */}
            <section aria-labelledby="media-url-heading">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h3 
                    id="media-url-heading"
                    className={`text-sm font-medium ${themeStyles.title}`}
                  >
                    Media URL
                  </h3>
                  <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <CopyButton 
                  text={media.url} 
                  variant="ghost" 
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                />
              </div>
              <div className={`mt-1 p-2 rounded ${themeStyles.codeBg} overflow-x-auto`}>
                <code 
                  className={`text-xs ${themeStyles.codeText} break-all whitespace-pre-wrap font-mono`}
                  aria-label="Media URL"
                >
                  {media.url}
                </code>
              </div>
            </section>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
});

MediaInfoSection.displayName = 'MediaInfoSection';

export default MediaInfoSection;
