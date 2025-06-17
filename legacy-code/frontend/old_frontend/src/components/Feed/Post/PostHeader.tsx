
import React, { useState, useEffect } from 'react';
import { MoreVertical, Shield, Clock, UserCheck, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '@/utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

interface PostHeaderProps {
  post: any;
  darkMode?: boolean;
  onMenuToggle: () => void;
  menuOpen: boolean;
}

const PostHeader: React.FC<PostHeaderProps> = ({
  post,
  darkMode = true,
  onMenuToggle,
  menuOpen
}) => {
  const [imageError, setImageError] = useState(false);
  const [authorDisplayName, setAuthorDisplayName] = useState('Unbekannter Nutzer');
  const [authorUsername, setAuthorUsername] = useState('unbekannt');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isVerified, setIsVerified] = useState(false);
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
      console.log('Using post.user data');
      setAuthorDisplayName(post.user.display_name || post.user.username || 'Unbekannter Nutzer');
      setAuthorUsername(post.user.username || 'unbekannt');
      setAvatarUrl(post.user.avatar_url || '');
      setIsVerified(post.user.is_verified || false);
      setUserRole(post.user.role);
      setAuthorId(post.user.id);
    } 
    else if (post.author && typeof post.author === 'object') {
      console.log('Using post.author data');
      setAuthorDisplayName(post.author.display_name || post.author.username || 'Unbekannter Nutzer');
      setAuthorUsername(post.author.username || 'unbekannt');
      setAvatarUrl(post.author.avatar_url || '');
      setIsVerified(post.author.is_verified || false);
      setUserRole(post.author.role);
      setAuthorId(post.author.id);
    }
    else {
      console.log('Using direct post fields');
      setAuthorDisplayName(post.display_name || post.username || 'Unbekannter Nutzer');
      setAuthorUsername(post.username || 'unbekannt');
      setAvatarUrl(post.avatar_url || '');
      setIsVerified(post.is_verified || false);
      setUserRole(post.role);
      setAuthorId(post.author_id);
    }
  }, [post]);
  
  // Get author initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle avatar image loading error
  const handleImageError = () => {
    setImageError(true);
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
    <div className="flex justify-between items-start mb-3">
      <Link 
        to={profileUrl}
        className="flex items-center group"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Avatar className="h-10 w-10 mr-3 border border-transparent group-hover:border-primary/30 transition-all">
            {avatarUrl && !imageError ? (
              <AvatarImage 
                src={avatarUrl} 
                alt={authorDisplayName} 
                onError={handleImageError}
              />
            ) : (
              <AvatarFallback className="bg-gradient-to-r from-primary-400 to-secondary-500 text-white font-bold">
                {getInitials(authorDisplayName)}
              </AvatarFallback>
            )}
          </Avatar>
        </motion.div>
        <div>
          <div className="flex items-center">
            <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} group-hover:text-primary transition-colors`}>
              {authorDisplayName}
            </h3>
            {isVerified && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="ml-2 bg-blue-500/10 text-blue-500 border-blue-500/20 px-1.5 py-0">
                      <UserCheck className="h-3 w-3 mr-0.5" />
                      <span className="text-xs">Verifiziert</span>
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Verifizierter Account</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {getRoleBadge()}
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs text-gray-400 flex items-center">
                    <Clock className="h-3 w-3 mr-1 inline" />
                    {formattedDate}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{post?.created_at ? new Date(post.created_at).toLocaleString('de-DE') : 'Unbekanntes Datum'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </Link>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-300 p-1 h-8 w-8"
              onClick={onMenuToggle}
              aria-label="Post-Menü öffnen"
              aria-expanded={menuOpen}
            >
              <MoreVertical size={18} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Post-Optionen</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default PostHeader;
