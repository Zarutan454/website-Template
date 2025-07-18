
import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ActivityType, MINING_LIMITS } from '@/hooks/mining/types';
import { 
  MessageSquare,
  ThumbsUp,
  Share2,
  Send,
  Users,
  Image
} from 'lucide-react';

interface ActivityButtonsProps {
  handleInteraction: (type: ActivityType) => Promise<boolean>;
  isActivityLimitReached: (type: ActivityType) => boolean;
  MINING_LIMITS: Record<ActivityType, import('@/hooks/mining/types').ActivityLimit>;
}

const ActivityButtons: React.FC<ActivityButtonsProps> = ({
  handleInteraction,
  isActivityLimitReached,
  MINING_LIMITS
}) => {
  // Define the activities with their corresponding icons and info
  const activities = [
    {
      type: 'post' as ActivityType,
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Post',
      speedBoost: MINING_LIMITS.post ? MINING_LIMITS.post.speedBoost : 5,
      description: MINING_LIMITS.post ? MINING_LIMITS.post.description : 'Create a new post'
    },
    {
      type: 'comment' as ActivityType,
      icon: <MessageSquare className="h-5 w-5" />,
      label: 'Comment',
      speedBoost: MINING_LIMITS.comment ? MINING_LIMITS.comment.speedBoost : 3,
      description: MINING_LIMITS.comment ? MINING_LIMITS.comment.description : 'Comment on a post'
    },
    {
      type: 'like' as ActivityType,
      icon: <ThumbsUp className="h-5 w-5" />,
      label: 'Like',
      speedBoost: MINING_LIMITS.like ? MINING_LIMITS.like.speedBoost : 2,
      description: MINING_LIMITS.like ? MINING_LIMITS.like.description : 'Like a post'
    },
    {
      type: 'share' as ActivityType,
      icon: <Share2 className="h-5 w-5" />,
      label: 'Share',
      speedBoost: MINING_LIMITS.share ? MINING_LIMITS.share.speedBoost : 4,
      description: MINING_LIMITS.share ? MINING_LIMITS.share.description : 'Share a post'
    },
    {
      type: 'invite' as ActivityType,
      icon: <Users className="h-5 w-5" />,
      label: 'Invite',
      speedBoost: MINING_LIMITS.invite ? MINING_LIMITS.invite.speedBoost : 10,
      description: MINING_LIMITS.invite ? MINING_LIMITS.invite.description : 'Invite a friend'
    },
    {
      type: 'nft_like' as ActivityType,
      icon: <Image className="h-5 w-5" />,
      label: 'NFT Like',
      speedBoost: MINING_LIMITS.nft_like ? MINING_LIMITS.nft_like.speedBoost : 5,
      description: MINING_LIMITS.nft_like ? MINING_LIMITS.nft_like.description : 'Like an NFT'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-400">Mine with Activities</h3>
      <div className="grid grid-cols-3 gap-3">
        <TooltipProvider>
          {activities.map((activity) => {
            const isDisabled = isActivityLimitReached(activity.type);
            
            return (
              <Tooltip key={activity.type + activity.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`h-20 flex flex-col items-center justify-center transition-all ${
                      isDisabled 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'hover:border-primary hover:bg-primary/10'
                    }`}
                    onClick={() => handleInteraction(activity.type)}
                    disabled={isDisabled}
                  >
                    <div className="mb-1">{activity.icon}</div>
                    <span className="text-xs">{activity.label}</span>
                    <span className="text-[10px] text-primary-300 mt-1">+{activity.speedBoost}% Speed</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm">{activity.description}</p>
                  {isDisabled && (
                    <p className="text-xs text-amber-400 mt-1">Daily limit reached</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>
      <div className="flex justify-end">
        <Button
          variant="default"
          size="sm"
          className="text-xs px-3 py-1 h-8"
          onClick={() => handleInteraction('login' as ActivityType)}
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Send Heartbeat
        </Button>
      </div>
    </div>
  );
};

export default ActivityButtons;
