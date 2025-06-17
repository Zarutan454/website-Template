
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  MessageSquare, 
  Share2, 
  Edit2, 
  UserPlus, 
  UserMinus,
  UserCheck,
  Link as LinkIcon,
  MapPin,
  Calendar
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface FollowStats {
  followers_count: number;
  following_count: number;
}

interface EnhancedProfileHeaderProps {
  profile: {
    id: string;
    username: string;
    display_name?: string;
    avatar_url?: string;
    cover_url?: string;
    bio?: string;
    created_at?: string;
    website?: string;
    location?: string;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
  followStats: FollowStats;
  onFollowToggle: () => void;
  onEditProfile: () => void;
  onMessage: () => void;
  onShare: () => void;
  onFollowersClick: () => void;
  onFollowingClick: () => void;
}

const EnhancedProfileHeader: React.FC<EnhancedProfileHeaderProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  followStats,
  onFollowToggle,
  onEditProfile,
  onMessage,
  onShare,
  onFollowersClick,
  onFollowingClick
}) => {
  const joinDate = profile.created_at 
    ? format(parseISO(profile.created_at), 'MMMM yyyy', { locale: de })
    : '';
    
  const coverStyle = profile.cover_url
    ? { backgroundImage: `url(${profile.cover_url})` }
    : { backgroundColor: '#1e293b' };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
      {/* Cover Image */}
      <div 
        className="w-full h-48 bg-cover bg-center relative" 
        style={coverStyle}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      {/* Profile Info Section */}
      <div className="px-4 sm:px-6 pb-6 relative">
        {/* Avatar */}
        <div className="absolute -top-12 left-6 ring-4 ring-gray-900 rounded-full">
          <Avatar className="w-24 h-24 border-4 border-gray-900">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
            <AvatarFallback className="text-2xl">
              {profile.display_name?.[0] || profile.username?.[0] || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Profile Action Buttons */}
        <div className="flex justify-end mt-4 space-x-2">
          {isOwnProfile ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEditProfile}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Bearbeiten</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    <span>Teilen</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button 
                variant={isFollowing ? "outline" : "default"} 
                size="sm" 
                onClick={onFollowToggle}
                className="flex items-center gap-2"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="h-4 w-4" />
                    <span>Folgst du</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    <span>Folgen</span>
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onMessage}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Nachricht</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    <span>Teilen</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
        
        {/* User Info */}
        <div className="mt-8">
          <h1 className="text-2xl font-bold">{profile.display_name || profile.username}</h1>
          <p className="text-gray-400">@{profile.username}</p>
          
          {profile.bio && (
            <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>
          )}
          
          {/* Follower Stats */}
          <div className="flex items-center gap-4 mt-4">
            <button 
              className="hover:underline flex items-center text-sm" 
              onClick={onFollowersClick}
            >
              <span className="font-semibold">{followStats.followers_count || 0}</span>
              <span className="text-gray-400 ml-1">Follower</span>
            </button>
            <button 
              className="hover:underline flex items-center text-sm" 
              onClick={onFollowingClick}
            >
              <span className="font-semibold">{followStats.following_count || 0}</span>
              <span className="text-gray-400 ml-1">Folgt</span>
            </button>
          </div>
          
          {/* Additional Info */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-gray-400">
            {profile.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1">
                <LinkIcon className="h-4 w-4" />
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline transition-colors"
                >
                  {profile.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              </div>
            )}
            {joinDate && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Beigetreten {joinDate}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfileHeader;
