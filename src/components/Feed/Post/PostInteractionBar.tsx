
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Flag, Bookmark, ThumbsUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';

interface PostInteractionBarProps {
  postId: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  darkMode?: boolean;
  showComments: boolean;
  isMiningEnabled?: boolean;
  onLike: () => Promise<boolean>;
  onComment: () => void;
  onShare: () => Promise<boolean>;
  onReport: () => void;
  onBookmark?: () => void;
  disabled?: boolean;
}

const PostInteractionBar: React.FC<PostInteractionBarProps> = ({
  postId,
  likes,
  comments,
  shares,
  isLiked,
  darkMode = true,
  showComments,
  isMiningEnabled = false,
  onLike,
  onComment,
  onShare,
  onReport,
  onBookmark,
  disabled = false
}) => {
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);
  const [isShareProcessing, setIsShareProcessing] = useState(false);
  
  // Animation Varianten für Buttons
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9 }
  };

  // Verbesserte Animation für den Like-Button mit Pulse-Effekt
  const likeButtonVariants = {
    liked: { 
      scale: [1, 1.3, 1], 
      transition: { 
        duration: 0.4,
        times: [0, 0.6, 1]
      } 
    },
    unliked: { scale: 1 }
  };

  // Pulse-Animation für den Heart Hintergrund
  const heartPulseVariants = {
    initial: { scale: 0, opacity: 0 },
    pulse: { 
      scale: 1.5, 
      opacity: [0, 0.4, 0],
      transition: { 
        duration: 0.6,
        ease: "easeOut" 
      }
    }
  };

  // Handler für Like-Klicks mit Mining-Belohnungen
  const handleLikeClick = async () => {
    if (isLikeProcessing || disabled) return;
    
    setIsLikeProcessing(true);
    try {
      const likeResult = await onLike();
      
      if (likeResult && isMiningEnabled) {
        toast.success("👍 +5 Punkte für deinen Like!");
      }
    } catch (error) {
      console.error("Fehler bei Like-Aktion:", error);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  // Handler für Share-Klicks
  const handleShareClick = async () => {
    if (isShareProcessing || disabled) return;
    
    setIsShareProcessing(true);
    try {
      const shareResult = await onShare();
      
      if (shareResult && isMiningEnabled) {
        toast.success("🔄 +8 Punkte für das Teilen!");
      }
    } catch (error) {
      console.error("Fehler bei Share-Aktion:", error);
    } finally {
      setIsShareProcessing(false);
    }
  };

  // Dynamische CSS-Klassen basierend auf dem Like-Status
  const likeButtonClasses = isLiked 
    ? 'text-primary fill-primary' 
    : `${darkMode ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div className={`flex justify-between items-center py-2 mt-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
      {/* Like Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`relative ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleLikeClick}
              disabled={disabled || isLikeProcessing}
            >
              <AnimatePresence>
                {isLiked && (
                  <motion.div
                    key="heart-background"
                    className="absolute inset-0 rounded-full bg-primary"
                    variants={heartPulseVariants}
                    initial="initial"
                    animate="pulse"
                    exit={{ scale: 0, opacity: 0 }}
                  />
                )}
              </AnimatePresence>
              
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover={!disabled ? "hover" : ""}
                whileTap={!disabled ? "tap" : ""}
                animate={isLiked ? "liked" : "unliked"}
                className="relative z-10 flex items-center"
              >
                <Heart
                  size={18}
                  className={`mr-2 ${likeButtonClasses} transition-colors duration-200`}
                  fill={isLiked ? "currentColor" : "none"}
                />
                <span className={`text-sm ${isLiked ? 'text-primary' : 'text-gray-400'}`}>
                  {likes > 0 ? likes : ""}
                </span>
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{isLiked ? "Gefällt dir nicht mehr" : "Gefällt mir"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Comment Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${showComments ? 'text-primary' : darkMode ? 'text-gray-400' : 'text-gray-500'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={onComment}
              disabled={disabled}
            >
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover={!disabled ? "hover" : ""}
                whileTap={!disabled ? "tap" : ""}
                className="flex items-center"
              >
                <MessageCircle
                  size={18}
                  className="mr-2"
                  fill={showComments ? "currentColor" : "none"}
                  fillOpacity={showComments ? 0.2 : 0}
                />
                <span className="text-sm">
                  {comments > 0 ? comments : ""}
                </span>
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Kommentare {showComments ? "ausblenden" : "anzeigen"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Share Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} ${disabled || isShareProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
              onClick={handleShareClick}
              disabled={disabled || isShareProcessing}
            >
              <motion.div
                variants={buttonVariants}
                initial="initial"
                whileHover={!disabled && !isShareProcessing ? "hover" : ""}
                whileTap={!disabled && !isShareProcessing ? "tap" : ""}
                className="flex items-center"
              >
                <Share2 size={18} className="mr-2" />
                <span className="text-sm">
                  {shares > 0 ? shares : ""}
                </span>
              </motion.div>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Teilen</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Report and Bookmark Buttons */}
      <div className="flex items-center">
        {/* Report Button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                onClick={onReport}
                disabled={disabled}
              >
                <motion.div
                  variants={buttonVariants}
                  initial="initial"
                  whileHover={!disabled ? "hover" : ""}
                  whileTap={!disabled ? "tap" : ""}
                >
                  <Flag size={18} />
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Beitrag melden</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Bookmark Button */}
        {onBookmark && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  onClick={onBookmark}
                  disabled={disabled}
                >
                  <motion.div
                    variants={buttonVariants}
                    initial="initial"
                    whileHover={!disabled ? "hover" : ""}
                    whileTap={!disabled ? "tap" : ""}
                  >
                    <Bookmark size={18} />
                  </motion.div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Lesezeichen setzen</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};

export default PostInteractionBar;
