
import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, Bell, BellOff } from 'lucide-react';
import PostInteractionButton from './Post/PostInteractionButton';
import useLikeNotifications from '@/hooks/post/useLikeNotifications';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

interface PostCardActionsProps {
  liked: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLikeDisabled?: boolean;
  onLikeClick: () => Promise<boolean>;
  onCommentClick: () => void;
  onShareClick: () => Promise<boolean>;
  onBookmarkClick?: () => void;
  onToggleNotifications?: () => Promise<boolean>;
  darkMode?: boolean;
  hasNotifications?: boolean;
  postId?: string;
}

const PostCardActions: React.FC<PostCardActionsProps> = ({
  liked,
  likesCount,
  commentsCount,
  sharesCount,
  isLikeDisabled = false,
  onLikeClick,
  onCommentClick,
  onShareClick,
  onBookmarkClick,
  onToggleNotifications,
  darkMode = true,
  hasNotifications = false,
  postId
}) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isTogglingNotification, setIsTogglingNotification] = useState(false);
  const { profile } = useProfile();
  
  // Benutze den useLikeNotifications Hook, wenn postId verfügbar ist
  const {
    isSubscribed,
    isLoading: isSubscriptionLoading,
    toggleSubscription,
    subscribeOnLike,
    initialize
  } = useLikeNotifications(postId || '', profile?.id);
  
  // Initialisiere den Abonnement-Status
  useEffect(() => {
    if (postId && profile?.id) {
      initialize();
    }
  }, [postId, profile?.id, initialize]);
  
  // Handler für Like-Button mit integriertem Abonnement
  const handleLike = async () => {
    if (isLikeDisabled || isLiking) return;
    
    try {
      setIsLiking(true);
      const likeResult = await onLikeClick();
      
      // Wenn der Post geliked wurde und wir nicht bereits abonniert sind,
      // automatisch den Post abonnieren
      if (likeResult && profile?.id && postId) {
        await subscribeOnLike(true);
        
        // Benutzerfreundliche Meldung beim ersten Like
        if (!liked) {
          toast.success("Post geliked und Benachrichtigungen aktiviert", {
            description: "Du wirst jetzt über neue Aktivitäten informiert"
          });
        }
      }
      
      return likeResult;
    } catch (error) {
      return false;
    } finally {
      setIsLiking(false);
    }
  };
  
  // Handler für Share-Button
  const handleShare = async () => {
    if (isSharing) return;
    
    try {
      setIsSharing(true);
      return await onShareClick();
    } finally {
      setIsSharing(false);
    }
  };
  
  // Handler für Benachrichtigungen
  const handleToggleNotifications = async () => {
    if (isTogglingNotification) return;
    
    try {
      setIsTogglingNotification(true);
      if (onToggleNotifications) {
        return await onToggleNotifications();
      } else if (postId && profile?.id) {
        const result = await toggleSubscription();
        
        // Benutzerfreundliches Feedback
        if (result) {
          toast.success("Benachrichtigungen aktiviert", {
            description: "Du wirst über Aktivitäten bei diesem Post informiert"
          });
        } else {
          toast.success("Benachrichtigungen deaktiviert");
        }
        
        return result;
      }
      return false;
    } finally {
      setIsTogglingNotification(false);
    }
  };
  
  // Bestimme, ob Benachrichtigungen aktiviert sind - entweder über den Prop oder über den Hook
  const notificationsActive = postId && profile?.id ? isSubscribed : hasNotifications;
  
  return (
    <TooltipProvider>
      <div className="flex flex-wrap justify-between items-center mt-3 gap-1">
        <div className="flex space-x-1">
          {/* Like Button */}
          <PostInteractionButton
            icon={<Heart className="h-4 w-4" />}
            activeIcon={<Heart className="h-4 w-4 fill-primary" />}
            label="Like"
            count={likesCount}
            isActive={liked}
            tooltip={liked ? "Gefällt dir nicht mehr" : "Gefällt mir"}
            isLoading={isLiking}
            onClick={handleLike}
            showAnimation={true}
          />
          
          {/* Comment Button */}
          <PostInteractionButton
            icon={<MessageCircle className="h-4 w-4" />}
            label="Kommentar"
            count={commentsCount}
            tooltip="Kommentieren"
            onClick={onCommentClick}
            showAnimation={false}
          />
          
          {/* Share Button */}
          <PostInteractionButton
            icon={<Share2 className="h-4 w-4" />}
            label="Teilen"
            count={sharesCount}
            tooltip="Teilen"
            isLoading={isSharing}
            onClick={handleShare}
            showAnimation={false}
          />
        </div>
        
        {/* Rechte Seite mit Benachrichtigungen */}
        {(onToggleNotifications || (postId && profile?.id)) && (
          <PostInteractionButton
            icon={<BellOff className="h-4 w-4" />}
            activeIcon={<Bell className="h-4 w-4 fill-primary" />}
            label=""
            isActive={notificationsActive}
            tooltip={notificationsActive ? "Benachrichtigungen deaktivieren" : "Benachrichtigungen aktivieren"}
            isLoading={isTogglingNotification || isSubscriptionLoading}
            onClick={handleToggleNotifications}
            showAnimation={false}
            className="ml-auto"
          />
        )}
      </div>
    </TooltipProvider>
  );
};

export default PostCardActions;
