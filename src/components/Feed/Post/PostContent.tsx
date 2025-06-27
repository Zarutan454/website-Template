import React from 'react';

interface PostContentProps {
  content: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  darkMode?: boolean;
}

const PostContent: React.FC<PostContentProps> = ({ 
  content, 
  mediaUrl, 
  mediaType, 
  darkMode = true 
}) => {
  return (
    <div className="w-full px-4 pb-4">
      <p className="whitespace-pre-line text-sm mb-3">
        {content}
      </p>
      
      {mediaUrl && mediaType === 'image' && (
        <div className="mt-3 overflow-hidden rounded-md">
          <img 
            src={mediaUrl} 
            alt="Post content" 
            className="w-full h-auto object-cover" 
            loading="lazy" 
          />
        </div>
      )}
      
      {mediaUrl && mediaType === 'video' && (
        <div className="mt-3 overflow-hidden rounded-md">
          <video 
            src={mediaUrl} 
            controls 
            className="w-full h-auto object-cover" 
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default PostContent;
