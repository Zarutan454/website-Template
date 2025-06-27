/**
 * Multi-Platform Video Embed Utilities
 * Unterstützt YouTube, TikTok, Twitch, Instagram, Telegram und mehr
 */

export interface VideoEmbedInfo {
  platform: 'youtube' | 'tiktok' | 'twitch' | 'instagram' | 'telegram' | 'unknown';
  videoId: string;
  embedUrl: string;
  thumbnailUrl?: string;
  title?: string;
  fallbackUrl?: string; // Für Telegram Fallback
}

/**
 * Extrahiert Video-Informationen aus verschiedenen Plattform-URLs
 */
export function extractVideoInfo(text: string): VideoEmbedInfo | null {
  if (!text) return null;

  // YouTube
  const youtubeInfo = extractYouTubeInfo(text);
  if (youtubeInfo) return youtubeInfo;

  // TikTok
  const tiktokInfo = extractTikTokInfo(text);
  if (tiktokInfo) return tiktokInfo;

  // Twitch
  const twitchInfo = extractTwitchInfo(text);
  if (twitchInfo) return twitchInfo;

  // Instagram
  const instagramInfo = extractInstagramInfo(text);
  if (instagramInfo) return instagramInfo;

  // Telegram
  const telegramInfo = extractTelegramInfo(text);
  if (telegramInfo) return telegramInfo;

  return null;
}

/**
 * YouTube Video-Extraktion
 */
function extractYouTubeInfo(text: string): VideoEmbedInfo | null {
  const patterns = [
    // youtu.be Kurzlink
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/i,
    // Standard-URL mit v=
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&[\w=.-]*)?/i,
    // Embedded URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})(?:\?[\w=.-]*)?/i,
    // Mobile URL
    /(?:https?:\/\/)?(?:www\.)?m\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})(?:&[\w=.-]*)?/i,
    // Kurz-URL
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})(?:[\?&][\w=.-]*)?/i,
    // Video-ID aus Playlist
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch|playlist)\?(?:.*&)?list=[^&]*&(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&[\w=.-]*)?/i,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch|playlist)\?(?:.*&)?v=([a-zA-Z0-9_-]{11})(?:&[\w=.-]*)?&(?:.*&)?list=[^&]*/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        platform: 'youtube',
        videoId,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        title: 'YouTube Video'
      };
    }
  }
  return null;
}

/**
 * TikTok Video-Extraktion
 */
function extractTikTokInfo(text: string): VideoEmbedInfo | null {
  const patterns = [
    // Standard TikTok Video URL
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/i,
    // TikTok Kurzlink
    /(?:https?:\/\/)?(?:www\.)?vm\.tiktok\.com\/([a-zA-Z0-9]+)/i,
    // TikTok Live
    /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[\w.-]+\/live/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        platform: 'tiktok',
        videoId,
        embedUrl: `https://www.tiktok.com/embed/${videoId}`,
        title: 'TikTok Video'
      };
    }
  }

  // TikTok Live Stream
  const liveMatch = text.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([\w.-]+)\/live/i);
  if (liveMatch) {
    const username = liveMatch[1];
    return {
      platform: 'tiktok',
      videoId: `live_${username}`,
      embedUrl: `https://www.tiktok.com/@${username}/live`,
      title: `TikTok Live - @${username}`
    };
  }

  return null;
}

/**
 * Twitch Video-Extraktion
 */
function extractTwitchInfo(text: string): VideoEmbedInfo | null {
  const patterns = [
    // Twitch Clip
    /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/[\w.-]+\/clip\/([a-zA-Z0-9_-]+)/i,
    // Twitch Video
    /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/videos\/(\d+)/i,
    // Twitch Live Stream
    /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      
      // Twitch Clip
      if (text.includes('/clip/')) {
        return {
          platform: 'twitch',
          videoId,
          embedUrl: `https://clips.twitch.tv/embed?clip=${videoId}`,
          title: 'Twitch Clip'
        };
      }
      
      // Twitch Video
      if (text.includes('/videos/')) {
        return {
          platform: 'twitch',
          videoId,
          embedUrl: `https://player.twitch.tv/?video=v${videoId}`,
          title: 'Twitch Video'
        };
      }
      
      // Twitch Live Stream
      return {
        platform: 'twitch',
        videoId,
        embedUrl: `https://player.twitch.tv/?channel=${videoId}`,
        title: `Twitch Live - ${videoId}`
      };
    }
  }

  return null;
}

/**
 * Instagram Video-Extraktion
 */
function extractInstagramInfo(text: string): VideoEmbedInfo | null {
  const patterns = [
    // Instagram Post/Reel
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/i,
    // Instagram TV
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/tv\/([a-zA-Z0-9_-]+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const videoId = match[1];
      return {
        platform: 'instagram',
        videoId,
        embedUrl: `https://www.instagram.com/p/${videoId}/embed/`,
        title: 'Instagram Post'
      };
    }
  }

  return null;
}

/**
 * Telegram Video-Extraktion
 */
function extractTelegramInfo(text: string): VideoEmbedInfo | null {
  const patterns = [
    // Öffentlicher Kanal: t.me/username/123
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)\/(\d+)/i,
    // Öffentlicher Kanal mit doppeltem Format: t.me/username/123/456
    /(?:https?:\/\/)?(?:www\.)?t\.me\/([a-zA-Z0-9_]+)\/(\d+)\/(\d+)/i,
    // Privater Kanal: t.me/c/1234567890/123
    /(?:https?:\/\/)?(?:www\.)?t\.me\/c\/(\d+)\/(\d+)/i,
    // Web-Version: web.telegram.org/k/#-1234567890
    /(?:https?:\/\/)?(?:www\.)?web\.telegram\.org\/k\/#-(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      let videoId: string;
      let fallbackUrl: string;
      let title: string;

      if (match[1] === 'c') {
        // Privater Kanal
        videoId = `${match[1]}_${match[2]}`;
        fallbackUrl = `https://t.me/c/${match[1]}/${match[2]}`;
        title = `Telegram Private Channel - Message ${match[2]}`;
      } else if (text.includes('web.telegram.org')) {
        // Web-Version
        videoId = `web_${match[1]}`;
        fallbackUrl = `https://web.telegram.org/k/#-${match[1]}`;
        title = `Telegram Web Message - ${match[1]}`;
      } else if (match.length === 4) {
        // Öffentlicher Kanal mit doppeltem Format: t.me/username/123/456
        const username = match[1];
        const messageId = match[2];
        const subId = match[3];
        videoId = `${username}_${messageId}_${subId}`;
        fallbackUrl = `https://t.me/${username}/${messageId}/${subId}`;
        title = `Telegram Channel @${username} - Message ${messageId}/${subId}`;
      } else {
        // Öffentlicher Kanal Standard: t.me/username/123
        videoId = `${match[1]}_${match[2]}`;
        fallbackUrl = `https://t.me/${match[1]}/${match[2]}`;
        title = `Telegram Channel @${match[1]} - Message ${match[2]}`;
      }

      return {
        platform: 'telegram',
        videoId,
        embedUrl: fallbackUrl,
        fallbackUrl,
        title
      };
    }
  }

  return null;
}

/**
 * Generiert eine Embed-URL für eine bestimmte Plattform
 */
export function getEmbedUrl(platform: string, videoId: string, autoplay: boolean = false): string {
  const autoplayParam = autoplay ? '?autoplay=1' : '';
  
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${videoId}${autoplayParam}`;
    case 'tiktok':
      return `https://www.tiktok.com/embed/${videoId}`;
    case 'twitch':
      if (videoId.startsWith('live_')) {
        const username = videoId.replace('live_', '');
        return `https://player.twitch.tv/?channel=${username}`;
      }
      return `https://clips.twitch.tv/embed?clip=${videoId}`;
    case 'instagram':
      return `https://www.instagram.com/p/${videoId}/embed/`;
    case 'telegram':
      // Telegram hat keine offizielle Embed-API, verwende Fallback
      return `https://t.me/${videoId.split('_')[0]}/${videoId.split('_')[1]}`;
    default:
      return '';
  }
}

/**
 * Generiert eine Thumbnail-URL für eine bestimmte Plattform
 */
export function getThumbnailUrl(platform: string, videoId: string): string {
  switch (platform) {
    case 'youtube':
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    case 'tiktok':
      return `https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/${videoId}`;
    case 'twitch':
      return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${videoId}-320x180.jpg`;
    case 'telegram':
      // Telegram hat keine öffentlichen Thumbnails
      return '';
    default:
      return '';
  }
}

/**
 * Prüft, ob ein Text eine Video-URL enthält
 */
export function containsVideoUrl(text: string): boolean {
  return extractVideoInfo(text) !== null;
}

/**
 * Prüft, ob ein Text eine Live-Stream-URL enthält
 */
export function containsLiveStreamUrl(text: string): boolean {
  const videoInfo = extractVideoInfo(text);
  if (!videoInfo) return false;
  
  return (
    (videoInfo.platform === 'tiktok' && videoInfo.videoId.startsWith('live_')) ||
    (videoInfo.platform === 'twitch' && !videoInfo.videoId.includes('clip') && !videoInfo.videoId.includes('video'))
  );
}
