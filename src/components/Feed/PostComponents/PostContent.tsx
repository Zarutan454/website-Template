
import React, { useEffect, useState } from 'react';
import { extractYoutubeVideoId } from '@/utils/youtubeUtils';
import YouTubeEmbed from '../YouTubeEmbed';

interface PostContentProps {
  content: string;
  image_url?: string;
  media_url?: string; // Added to support both image_url and media_url fields
}

const PostContent: React.FC<PostContentProps> = ({
  content,
  image_url,
  media_url
}) => {
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  
  // Use either image_url or media_url, with image_url taking precedence
  const imageSource = image_url || media_url;
  
  useEffect(() => {
    if (content) {
      const videoId = extractYoutubeVideoId(content);
      if (videoId) {
        setYoutubeVideoId(videoId);
      }
    }
  }, [content]);

  return (
    <>
      <p className="text-white text-sm py-2">{content}</p>
      
      {youtubeVideoId && (
        <div className="w-full mb-3">
          <YouTubeEmbed
            videoId={youtubeVideoId}
            className="w-full rounded-md overflow-hidden"
            height={315}
            title="YouTube Video"
          />
        </div>
      )}
      
      {imageSource && !youtubeVideoId && (
        <img 
          src={imageSource} 
          alt="Post Image" 
          className="w-full rounded-md aspect-video object-cover" 
        />
      )}
    </>
  );
};

export default PostContent;
