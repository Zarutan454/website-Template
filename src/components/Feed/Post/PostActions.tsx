
import React, { useState } from 'react';
import { Heart, MessageSquare, Share } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useMining } from '@/hooks/useMining';
import { toast } from 'sonner';

interface PostActionsProps {
  postId: string;
  isLiked: boolean;
  showComments: boolean;
  onLike: (postId: string) => Promise<boolean>;
  onToggleComments: () => void;
  onShare: (postId: string) => Promise<boolean>;
  showMiningRewards?: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({
  postId,
  isLiked,
  showComments,
  onLike,
  onToggleComments,
  onShare,
  showMiningRewards = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { recordActivity, isMining } = useMining();
  const [optimisticLiked, setOptimisticLiked] = useState(isLiked);

  const handleLike = async () => {
    if (isProcessing) return;
    
    // Optimistic UI update for instant feedback
    setIsProcessing(true);
    setOptimisticLiked(!optimisticLiked);
    
    try {
      // Record mining activity first if possible (optimistic)
      let miningSuccess = false;
      if (!isLiked && showMiningRewards && isMining) {
        try {
          const result = await recordActivity('like');
          // Safely handle null result
          miningSuccess = result !== null && (
            typeof result === 'boolean' 
              ? result 
              : (result && typeof result === 'object' && 'success' in result ? result.success : false)
          );
          // Don't show individual toasts anymore, they're batched now
        } catch (error) {
          console.error("Fehler bei Mining-Aktivität für Like:", error);
        }
      }
      
      // Actual like/unlike action
      const success = await onLike(postId);
      
      if (!success) {
        // Revert optimistic update if the actual operation failed
        setOptimisticLiked(isLiked);
        toast.error("Fehler beim Reagieren auf den Beitrag");
      }
      
      return success;
    } catch (error) {
      console.error("Fehler bei Like-Aktion:", error);
      // Revert optimistic update
      setOptimisticLiked(isLiked);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    try {
      // Optimistic approach for better UX
      if (showMiningRewards && isMining) {
        try {
          const result = await recordActivity('share');
          // No need to handle the result here as we're not doing anything with it
          // No individual toast, it's handled in batch now
        } catch (error) {
          console.error("Fehler bei Mining-Aktivität für Teilen:", error);
        }
      }
      
      const success = await onShare(postId);
      
      if (!success) {
        toast.error("Beitrag konnte nicht geteilt werden");
      }
      
      return success;
    } catch (error) {
      console.error("Fehler beim Teilen:", error);
      return false;
    }
  };

  return (
    <div className="flex justify-between items-center w-full px-1 py-1">
      <div className="flex space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          disabled={isProcessing}
          className={optimisticLiked ? 'text-red-500' : ''}
        >
          <Heart className={`h-5 w-5 mr-1 ${optimisticLiked ? 'fill-current' : ''}`} />
          Like
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onToggleComments}
        >
          <MessageSquare className={`h-5 w-5 mr-1 ${showComments ? 'text-primary' : ''}`} />
          Kommentar
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handleShare()}
        >
          <Share className="h-5 w-5 mr-1" />
          Teilen
        </Button>
      </div>
    </div>
  );
};

export default PostActions;
