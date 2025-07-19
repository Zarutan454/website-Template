
import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider.utils';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { X, Calendar, Wallet, MapPin, Users, ExternalLink } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { de } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Profile } from '@/hooks/useProfile';

interface UserProfileProps {
  user: Profile;
  isFollowing?: boolean;
  onToggleFollow?: () => void;
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  isFollowing = false,
  onToggleFollow,
  onClose 
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const formatJoinDate = (date: string) => {
    try {
      return `Mitglied seit ${formatDistance(new Date(date), new Date(), { 
        addSuffix: false,
        locale: de
      })}`;
    } catch (error) {
      return 'Mitglied';
    }
  };

  const navigateToProfile = () => {
    navigate(`/feed/profile/${user.username}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Profil</h2>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X size={18} />
        </Button>
      </div>
      <Separator />
      
      <div className="p-6 space-y-6">
        {/* Profile Header */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt={user.display_name || user.username} 
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <span>{(user.display_name || user.username).charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <h1 className="mt-4 text-xl font-bold">
            {user.display_name || user.username}
          </h1>
          
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            @{user.username}
          </p>
          
          <div className="flex justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant={isFollowing ? "outline" : "default"}
              onClick={onToggleFollow}
              className="rounded-full px-4"
            >
              <Users className="mr-2 h-4 w-4" />
              {isFollowing ? 'Folge ich' : 'Folgen'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={navigateToProfile}
              className="rounded-full px-4"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Zum Profil
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Profile Info */}
        <div className="space-y-4">
          {user.bio && (
            <div>
              <p className="text-sm whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
          
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={14} />
              <span>{formatJoinDate(user.created_at)}</span>
            </div>
            
            {user.wallet_address && (
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={14} />
                <span className="truncate">{user.wallet_address}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-around text-center pt-2">
            <div>
              <p className="font-semibold">{user.posts_count || 0}p</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Posts</p>
            </div>
            <div>
              <p className="font-semibold">{user.followers_count || 0}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Follower</p>
            </div>
            <div>
              <p className="font-semibold">{user.mined_tokens || 0}</p>
              <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tokens</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

