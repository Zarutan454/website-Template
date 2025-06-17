
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useUserRelationships } from '@/hooks/useUserRelationships';

export interface UserRelationshipButtonProps {
  // Target user ID - primary property to use
  targetUserId: string;
  // Whether the user is already being followed (initial state)
  initialIsFollowing?: boolean;
  // Callbacks
  onFollow?: () => void;
  onUnfollow?: () => void;
  // Styling options
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabels?: boolean;
  // For backward compatibility
  userId?: string;
}

const UserRelationshipButton: React.FC<UserRelationshipButtonProps> = ({
  targetUserId,
  userId, // For backward compatibility
  initialIsFollowing = false,
  onFollow,
  onUnfollow,
  size = 'default',
  showLabels = true
}) => {
  // Use targetUserId as primary, fallback to userId if provided (for backward compatibility)
  const actualUserId = targetUserId || userId || '';
  
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { followUser, unfollowUser } = useUserRelationships();

  // Update local state if initialIsFollowing prop changes
  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleRelationshipToggle = async () => {
    if (!actualUserId || isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isFollowing) {
        const success = await unfollowUser(actualUserId);
        if (success) {
          setIsFollowing(false);
          if (onUnfollow) onUnfollow();
        }
      } else {
        const success = await followUser(actualUserId);
        if (success) {
          setIsFollowing(true);
          if (onFollow) onFollow();
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      size={size}
      onClick={handleRelationshipToggle}
      disabled={isLoading}
      className={isFollowing ? "gap-1" : "gap-1"}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck size={16} />
          {showLabels && <span>Folge ich</span>}
        </>
      ) : (
        <>
          <UserPlus size={16} />
          {showLabels && <span>Folgen</span>}
        </>
      )}
    </Button>
  );
};

export default UserRelationshipButton;
