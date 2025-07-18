
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  id?: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  [key: string]: unknown;
}
interface ConversationHeaderProps {
  isMobile: boolean;
  handleBackToList: () => void;
  partnerProfile: UserProfile;
  isFollowingUser: boolean;
  handleToggleFollow: () => void;
  setShowUserProfile: (show: boolean) => void;
  showUserProfile: boolean;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  isMobile,
  handleBackToList,
  partnerProfile,
  isFollowingUser,
  handleToggleFollow,
  setShowUserProfile,
  showUserProfile
}) => {
  if (!partnerProfile) {
    return (
      <div className="p-4 flex justify-between items-center">
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBackToList}
            className="mr-2"
          >
            <ArrowLeft size={18} />
          </Button>
        )}
        <div className="flex-1 flex items-center">
          <Avatar className="w-10 h-10 mr-3">
            <AvatarFallback className="bg-primary-500/10">?</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-medium">Unbekannt</h2>
          </div>
        </div>
      </div>
    );
  }
  
  const partnerName = partnerProfile.display_name || partnerProfile.username || 'Unbekannt';
  const partnerInitial = partnerName.charAt(0).toUpperCase();
  
  return (
    <div className="p-4 flex justify-between items-center">
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBackToList}
          className="mr-2"
        >
          <ArrowLeft size={18} />
        </Button>
      )}
      <div 
        className="flex items-center flex-1 cursor-pointer"
        onClick={() => setShowUserProfile(!showUserProfile)}
      >
        <Avatar className="w-10 h-10 mr-3">
          {partnerProfile.avatar_url ? (
            <AvatarImage src={partnerProfile.avatar_url} alt={partnerName} />
          ) : (
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              {partnerInitial}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <h2 className="font-medium">{partnerName}</h2>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <span>{isFollowingUser ? 'Du folgst' : 'Folgen'}</span>
          </div>
        </div>
        <Button
          variant={isFollowingUser ? "outline" : "default"}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleFollow();
          }}
          className="ml-2"
        >
          {isFollowingUser ? (
            <span className="flex items-center gap-1">
              <Users size={14} />
              Folge ich
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Users size={14} />
              Folgen
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
