
import React from 'react';
import { getYoutubeEmbedUrl } from '@/utils/youtubeUtils';

interface YouTubeEmbedProps {
  videoId: string;
  className?: string;
  height?: number;
  width?: number;
  title?: string;
  allowFullScreen?: boolean;
  autoplay?: boolean;
}

/**
 * Komponente zum Einbetten von YouTube-Videos mit optimiertem Rendering
 */
const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  className = '',
  height = 315,
  width = 560,
  title = 'YouTube video player',
  allowFullScreen = true,
  autoplay = false
}) => {
  // Sichere URL für das Einbetten erstellen
  const embedUrl = getYoutubeEmbedUrl(videoId, autoplay);
  
  return (
    <div className={`${className} aspect-video`}>
      <iframe
        src={embedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={allowFullScreen}
        className="w-full h-full rounded-md"
        loading="lazy"
      />
    </div>
  );
};

export default YouTubeEmbed;
