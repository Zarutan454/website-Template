
/**
 * Extrahiert eine YouTube-Video-ID aus einer URL oder einem Text
 * Unterstützt verschiedene YouTube-URL-Formate
 */
export function extractYoutubeVideoId(text: string): string | null {
  if (!text) return null;

  // Regex für verschiedene YouTube-URL-Formate
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

  // Text nach URLs durchsuchen
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Keine gültige YouTube-URL gefunden
  return null;
}

/**
 * Generiert eine YouTube-Embed-URL aus einer Video-ID
 */
export function getYoutubeEmbedUrl(videoId: string, autoplay: boolean = false): string {
  return `https://www.youtube.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`;
}

/**
 * Generiert eine YouTube-Thumbnail-URL aus einer Video-ID
 * quality kann 'default', 'hqdefault', 'mqdefault', 'sddefault', 'maxresdefault' sein
 */
export function getYoutubeThumbnailUrl(videoId: string, quality: 'default' | 'hqdefault' | 'mqdefault' | 'sddefault' | 'maxresdefault' = 'hqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Prüft, ob ein Text eine YouTube-URL enthält
 */
export function containsYoutubeUrl(text: string): boolean {
  return extractYoutubeVideoId(text) !== null;
}
