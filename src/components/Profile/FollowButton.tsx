import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { apiClient } from '@/lib/django-api-new';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FollowButtonProps {
  userId: number;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  initialIsFollowing = false,
  onFollowChange,
  className = "",
  variant = "default",
  size = "md"
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
  }, [initialIsFollowing]);

  const handleFollowToggle = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        await apiClient.post(`/users/${userId}/unfollow/`);
        setIsFollowing(false);
        toast.success('Benutzer nicht mehr gefolgt');
        onFollowChange?.(false);
      } else {
        // Follow
        await apiClient.post(`/users/${userId}/follow/`);
        setIsFollowing(true);
        toast.success('Benutzer erfolgreich gefolgt');
        onFollowChange?.(true);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 
                          isFollowing ? 'Fehler beim Entfolgen' : 'Fehler beim Folgen';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) {
      return isFollowing ? 'Entfolge...' : 'Folge...';
    }
    return isFollowing ? 'Entfolgen' : 'Folgen';
  };

  const getButtonIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return isFollowing ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />;
  };

  const getButtonVariant = () => {
    if (isFollowing) {
      return variant === 'default' ? 'outline' : variant;
    }
    return variant;
  };

  // Accessibility-Label
  const ariaLabel = isFollowing
    ? 'Du folgst diesem Nutzer. Klicke zum Entfolgen.'
    : 'Du folgst diesem Nutzer noch nicht. Klicke zum Folgen.';

  // Tooltip-Text
  const tooltipText = isFollowing
    ? 'Du folgst diesem Nutzer. Klicke zum Entfolgen.'
    : 'Klicke, um diesem Nutzer zu folgen.';

  // Animation-Props
  const buttonMotionProps = {
    whileTap: { scale: 0.95 },
    transition: { type: 'spring', stiffness: 300, damping: 20 },
    layout: true
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div {...buttonMotionProps} style={{ display: 'inline-block' }}>
            <Button
              onClick={handleFollowToggle}
              disabled={isLoading}
              variant={getButtonVariant()}
              size={size}
              className={`${className} ${
                isFollowing 
                  ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              aria-label={ariaLabel}
              tabIndex={0}
            >
              {getButtonIcon()}
              <span className="ml-2">{getButtonText()}</span>
              {/* Badge für neuen Follow-Status (optional, z.B. nach WebSocket-Event) */}
              {/* {showNewBadge && <span className="ml-2 bg-green-500 text-white rounded px-2 py-0.5 text-xs">Neu</span>} */}
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default FollowButton; 