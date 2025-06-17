
import React from 'react';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';
import YouTubeEmbed from '../YouTubeEmbed';

interface PostContentProps {
  post: any;
  darkMode?: boolean;
}

const PostContent: React.FC<PostContentProps> = ({ post, darkMode = true }) => {
  // Extrahiere YouTube-Video-ID, falls vorhanden
  const youtubeVideoId = extractYoutubeVideoId(post.content);
  
  // Support both image_url and media_url fields
  const imageSource = post.image_url || post.media_url;
  
  return (
    <div className="w-full">
      {/* Text-Inhalt */}
      <p className={`whitespace-pre-line text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
        {post.content}
      </p>
      
      {/* YouTube-Embed, falls vorhanden */}
      {youtubeVideoId && (
        <div className="mt-3 aspect-video w-full overflow-hidden rounded-md">
          <YouTubeEmbed
            videoId={youtubeVideoId}
            className="w-full rounded-md overflow-hidden"
            height={315}
            title={`YouTube Video von ${post.author.display_name || post.author.username}`}
            allowFullScreen={true}
          />
        </div>
      )}
      
      {/* Bild anzeigen, falls vorhanden und kein YouTube-Video */}
      {!youtubeVideoId && imageSource && (
        <div className="mt-3 overflow-hidden rounded-md">
          <img
            src={imageSource}
            alt="Post content"
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      )}
      
      {/* Token-Daten anzeigen, falls vorhanden */}
      {post.token_data && (
        <div className={`mt-3 rounded-md p-3 ${darkMode ? 'bg-dark-200' : 'bg-gray-100'}`}>
          <div className="flex items-center">
            <div>
              <h4 className="font-medium">
                {post.token_data.token_name} ({post.token_data.token_symbol})
              </h4>
              <p className="text-xs text-gray-400">
                Network: {post.token_data.token_network}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* NFT-Daten anzeigen, falls vorhanden */}
      {post.nft_data && (
        <div className={`mt-3 rounded-md p-3 ${darkMode ? 'bg-dark-200' : 'bg-gray-100'}`}>
          <div className="flex items-center">
            <div>
              <h4 className="font-medium">
                {post.nft_data.nft_name}
              </h4>
              <p className="text-xs text-gray-400">
                Collection: {post.nft_data.nft_collection}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostContent;
