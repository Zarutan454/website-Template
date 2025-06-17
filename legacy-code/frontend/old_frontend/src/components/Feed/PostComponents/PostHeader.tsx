
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { timeAgo } from '@/utils/timeAgo';
import { CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PostHeaderProps {
  author: {
    id: string;
    avatar_url?: string;
    display_name?: string;
    username: string;
    is_verified?: boolean;
  };
  created_at: string;
  darkMode?: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  author,
  created_at,
  darkMode = true
}) => {
  const navigate = useNavigate();
  const formattedTimeAgo = timeAgo(created_at);
  
  const handleUserClick = () => {
    navigate(`/profile/${author.username}`);
  };

  return (
    <div className="flex items-start">
      <Avatar className="mr-3 h-10 w-10 cursor-pointer" onClick={handleUserClick}>
        <AvatarImage src={author.avatar_url || ''} alt={author.display_name || author.username} />
        <AvatarFallback>{author.display_name?.charAt(0) || author.username.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center">
          <div 
            className="text-sm font-medium leading-none cursor-pointer hover:underline" 
            onClick={handleUserClick}
          >
            {author.display_name || author.username}
          </div>
          {author.is_verified && (
            <CheckCircle2 className="ml-1 h-4 w-4 text-blue-500" />
          )}
        </div>
        <div className="text-sm text-gray-400">
          <span>@{author.username}</span>
          <span className="mx-1">•</span>
          <span>{formattedTimeAgo}</span>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
