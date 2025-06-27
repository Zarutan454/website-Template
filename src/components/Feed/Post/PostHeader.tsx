import React, { useState, useEffect } from 'react';
import { MoreHorizontal, Verified } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '@/utils/timeAgo';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Shield, Clock, UserCheck, Award } from 'lucide-react';

interface PostHeaderProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    user?: {
      id: string;
      username: string;
      display_name?: string;
      avatar_url?: string;
      is_verified?: boolean;
      role?: string;
    };
    author?: {
      id: string;
      username: string;
      display_name?: string;
      avatar_url?: string;
      is_verified?: boolean;
      role?: string;
    };
    author_id?: string;
    display_name?: string;
    username?: string;
    avatar_url?: string;
    is_verified?: boolean;
    role?: string;
  };
  darkMode?: boolean;
  onMenuToggle: () => void;
  menuOpen: boolean;
}

export const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  darkMode = false,
  onMenuToggle,
  menuOpen
}) => {
  const navigate = useNavigate();
  const [authorDisplayName, setAuthorDisplayName] = useState<string>('');
  const [authorUsername, setAuthorUsername] = useState<string>('');
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [authorId, setAuthorId] = useState<string | undefined>(undefined);
  
  // Verwenden der verbesserten und zentralisierten Formatierungsfunktion
  const formattedDate = post?.created_at 
    ? formatTimeAgo(post.created_at) 
    : 'Unbekanntes Datum';
  
  // Extrahiere und verarbeite Benutzerdaten beim Laden/Ändern des Posts
  useEffect(() => {
    if (!post) return;

    // PRIORITÄTSFOLGE: post.user > post.author > direkte Felder
    if (post.user && typeof post.user === 'object') {
      setAuthorDisplayName(post.user.display_name || post.user.username || 'Unbekannter Nutzer');
      setAuthorUsername(post.user.username || '');
      setAuthorAvatarUrl(post.user.avatar_url || '');
      setIsVerified(post.user.is_verified || false);
      setUserRole(post.user.role);
      setAuthorId(post.user.id);
    } else if (post.author && typeof post.author === 'object') {
      setAuthorDisplayName(post.author.display_name || post.author.username || 'Unbekannter Nutzer');
      setAuthorUsername(post.author.username || '');
      setAuthorAvatarUrl(post.author.avatar_url || '');
      setIsVerified(post.author.is_verified || false);
      setUserRole(post.author.role);
      setAuthorId(post.author.id);
    } else {
      // Fallback auf direkte Felder
      setAuthorDisplayName(post.display_name || post.username || 'Unbekannter Nutzer');
      setAuthorUsername(post.username || '');
      setAuthorAvatarUrl(post.avatar_url || '');
      setIsVerified(post.is_verified || false);
      setUserRole(post.role);
      setAuthorId(post.author_id);
    }
  }, [post]);
  
  const handleAvatarClick = () => {
    if (authorUsername) {
      navigate(`/profile/${authorUsername}`);
    }
  };

  const handleNameClick = () => {
    if (authorUsername) {
      navigate(`/profile/${authorUsername}`);
    }
  };

  // Generiere Initialen für Fallback-Avatar
  const getInitials = (name: string): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Standard-Avatar-Farbe basierend auf Username
  const getAvatarColor = (username: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = username.length % colors.length;
    return colors[index];
  };

  // Konvertiere relative URLs in absolute URLs für Avatar-Bilder
  const getAvatarUrl = (url?: string): string => {
    if (!url) return '';
    
    console.log(`[PostHeader] Processing avatar URL: ${url}`);
    
    // Wenn es bereits eine absolute URL ist, verwende sie direkt
    if (url.startsWith('http://') || url.startsWith('https://')) {
      console.log(`[PostHeader] Using absolute URL: ${url}`);
      return url;
    }
    
    // Wenn es eine relative URL ist (beginnt mit /media/), mache sie absolut
    if (url.startsWith('/media/')) {
      const absoluteUrl = `http://localhost:8000${url}`;
      console.log(`[PostHeader] Converting relative to absolute: ${url} -> ${absoluteUrl}`);
      return absoluteUrl;
    }
    
    // Fallback: Verwende die URL wie sie ist
    console.log(`[PostHeader] Using URL as-is: ${url}`);
    return url;
  };

  // Dynamische Badge-Darstellung basierend auf der Benutzerrolle
  const getRoleBadge = () => {
    switch(userRole) {
      case 'admin':
        return (
          <Badge variant="outline" className="ml-1 bg-red-500/10 text-red-500 border-red-500/20 px-1.5 py-0">
            <Award className="h-3 w-3 mr-0.5" />
            <span className="text-xs">Admin</span>
          </Badge>
        );
      case 'moderator':
        return (
          <Badge variant="outline" className="ml-1 bg-green-500/10 text-green-500 border-green-500/20 px-1.5 py-0">
            <Shield className="h-3 w-3 mr-0.5" />
            <span className="text-xs">Mod</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  // Verbessere die Profil-Link-URL
  const profileUrl = `/profile/${authorUsername || authorId || ''}`;

  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAvatarClick}
        >
          <AvatarImage 
            src={getAvatarUrl(authorAvatarUrl)} 
            alt={authorDisplayName}
            className="object-cover"
          />
          <AvatarFallback 
            className={`${getAvatarColor(authorUsername)} text-white font-semibold`}
          >
            {getInitials(authorDisplayName)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex flex-col">
          <div className="flex items-center space-x-1">
            <span 
              className="font-semibold text-sm cursor-pointer hover:underline"
              onClick={handleNameClick}
            >
              {authorDisplayName}
            </span>
            {isVerified && (
              <Verified className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <span className="text-xs text-gray-500">
            @{authorUsername} • {formattedDate}
          </span>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuToggle}
        className="h-8 w-8 p-0"
      >
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PostHeader;
