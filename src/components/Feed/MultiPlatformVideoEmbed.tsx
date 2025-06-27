import React from 'react';
import { extractVideoInfo, VideoEmbedInfo } from '@/utils/videoEmbedUtils';

interface MultiPlatformVideoEmbedProps {
  videoInfo: VideoEmbedInfo;
  className?: string;
  height?: number;
  width?: number;
  title?: string;
  allowFullScreen?: boolean;
  autoplay?: boolean;
}

/**
 * Multi-Platform Video Embed Komponente
 * Unterstützt YouTube, TikTok, Twitch, Instagram und Telegram
 */
const MultiPlatformVideoEmbed: React.FC<MultiPlatformVideoEmbedProps> = ({
  videoInfo,
  className = '',
  height = 315,
  width = 560,
  title,
  allowFullScreen = true,
  autoplay = false
}) => {
  const getEmbedUrl = (info: VideoEmbedInfo): string => {
    const autoplayParam = autoplay ? '?autoplay=1' : '';
    
    switch (info.platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${info.videoId}${autoplayParam}`;
      case 'tiktok':
        return `https://www.tiktok.com/embed/${info.videoId}`;
      case 'twitch':
        if (info.videoId.startsWith('live_')) {
          const username = info.videoId.replace('live_', '');
          return `https://player.twitch.tv/?channel=${username}`;
        }
        return `https://clips.twitch.tv/embed?clip=${info.videoId}`;
      case 'instagram':
        return `https://www.instagram.com/p/${info.videoId}/embed/`;
      case 'telegram':
        // Telegram hat keine offizielle Embed-API, verwende Fallback
        return info.fallbackUrl || `https://t.me/${info.videoId.split('_')[0]}/${info.videoId.split('_')[1]}`;
      default:
        return '';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return '🎥';
      case 'tiktok':
        return '🎵';
      case 'twitch':
        return '🎮';
      case 'instagram':
        return '📸';
      case 'telegram':
        return '📱';
      default:
        return '🎬';
    }
  };

  const embedUrl = getEmbedUrl(videoInfo);
  const displayTitle = title || videoInfo.title || `${videoInfo.platform} Video`;

  // Telegram Fallback - da Telegram keine offizielle Embed-API hat
  if (videoInfo.platform === 'telegram') {
    return (
      <div className={`${className} aspect-video relative`}>
        {/* Platform Badge */}
        <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
          <span>{getPlatformIcon(videoInfo.platform)}</span>
          <span className="capitalize">{videoInfo.platform}</span>
        </div>

        {/* Telegram Fallback Card */}
        <div className="w-full h-full rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Telegram Video</h3>
            <p className="text-sm mb-4 opacity-90">
              {videoInfo.title || 'Telegram-Nachricht mit Video'}
            </p>
            <a
              href={embedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              <span>📱</span>
              <span>In Telegram öffnen</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} aspect-video relative`}>
      {/* Platform Badge */}
      <div className="absolute top-2 left-2 z-10 bg-black bg-opacity-70 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
        <span>{getPlatformIcon(videoInfo.platform)}</span>
        <span className="capitalize">{videoInfo.platform}</span>
        {videoInfo.videoId.startsWith('live_') && (
          <span className="bg-red-500 px-1 rounded text-xs">LIVE</span>
        )}
      </div>

      {/* Video Embed */}
      <iframe
        src={embedUrl}
        title={displayTitle}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen={allowFullScreen}
        className="w-full h-full rounded-md"
        loading="lazy"
      />
    </div>
  );
};

export default MultiPlatformVideoEmbed; 
