
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit, Camera, UserPlus, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from "@/components/ui/skeleton";
import { Profile } from '@/types/profile';

interface ProfileHeaderSectionProps {
  profile: Profile | null;
  isOwnProfile: boolean;
  isFollowing: boolean;
  isLoading: boolean;
  followStats: {
    followers_count: number;
    following_count: number;
  };
  postsCount: number;
  minedTokens: number;
  onEditClick: () => void;
  onFollow: () => void;
  onUnfollow: () => void;
  onCoverUpload: () => void;
  onShowFollowers: (type: 'followers' | 'following') => void;
}

const ProfileHeaderSection: React.FC<ProfileHeaderSectionProps> = ({
  profile,
  isOwnProfile,
  isFollowing,
  isLoading,
  followStats,
  postsCount,
  minedTokens,
  onEditClick,
  onFollow,
  onUnfollow,
  onCoverUpload,
  onShowFollowers
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (isLoading) {
    return (
      <div className="relative mb-8 pt-6">
        <div className="flex flex-col items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <Skeleton className="h-6 w-48 mt-4" />
          <Skeleton className="h-4 w-32 mt-2" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="relative mb-8 z-20 pt-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {isOwnProfile && (
        <motion.button
          variants={itemVariants}
          className="absolute right-0 top-0 bg-dark-100/80 p-2 rounded-full hover:bg-dark-200 transition-colors"
          onClick={onCoverUpload}
          title="Cover-Bild ändern"
        >
          <Camera size={18} />
        </motion.button>
      )}

      <motion.div 
        className="flex flex-col items-center"
        variants={itemVariants}
      >
        <Avatar className="h-24 w-24 border-4 border-background">
          {profile?.avatar_url ? (
            <AvatarImage src={profile.avatar_url} alt={profile.display_name || profile.username} />
          ) : (
            <AvatarFallback className="bg-primary-700 text-white text-2xl">
              {(profile?.display_name || profile?.username || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>

        <h1 className="text-2xl font-bold mt-4">
          {profile?.display_name || profile?.username}
        </h1>
        
        <p className="text-gray-400">@{profile?.username}</p>
        
        <div className="flex gap-4 mt-4">
          {isOwnProfile ? (
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={onEditClick}
            >
              <Edit size={16} />
              Profil bearbeiten
            </Button>
          ) : (
            <Button 
              variant={isFollowing ? "outline" : "default"}
              className="gap-1"
              onClick={isFollowing ? onUnfollow : onFollow}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={16} />
                  Folge ich
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Folgen
                </>
              )}
            </Button>
          )}
        </div>
        
        <div className="flex gap-6 mt-6">
          <button 
            className="text-center hover:opacity-80 transition-opacity"
            onClick={() => onShowFollowers('followers')}
          >
            <div className="text-xl font-bold">{followStats.followers_count}</div>
            <div className="text-sm text-gray-400">Follower</div>
          </button>
          
          <button 
            className="text-center hover:opacity-80 transition-opacity"
            onClick={() => onShowFollowers('following')}
          >
            <div className="text-xl font-bold">{followStats.following_count}</div>
            <div className="text-sm text-gray-400">Folgt</div>
          </button>
          
          <div className="text-center">
            <div className="text-xl font-bold">{postsCount}</div>
            <div className="text-sm text-gray-400">Beiträge</div>
          </div>
          
          <div className="text-center">
            <div className="text-xl font-bold">{minedTokens}</div>
            <div className="text-sm text-gray-400">Tokens</div>
          </div>
        </div>
        
        {profile?.bio && (
          <motion.div 
            variants={itemVariants}
            className="mt-6 text-center max-w-lg mx-auto text-gray-300"
          >
            {profile.bio}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default ProfileHeaderSection;
