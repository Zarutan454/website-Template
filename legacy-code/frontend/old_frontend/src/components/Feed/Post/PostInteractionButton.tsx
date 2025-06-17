
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface PostInteractionButtonProps {
  icon: React.ReactNode;
  activeIcon?: React.ReactNode;
  label: string;
  count?: number;
  isActive?: boolean;
  isLoading?: boolean;
  onClick: () => void;
  tooltip?: string;
  showAnimation?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
}

const PostInteractionButton: React.FC<PostInteractionButtonProps> = ({
  icon,
  activeIcon,
  label,
  count,
  isActive = false,
  isLoading = false,
  onClick,
  tooltip,
  showAnimation = false,
  variant = "ghost",
  className
}) => {
  const displayIcon = isActive && activeIcon ? activeIcon : icon;
  
  // Animation variants for like action
  const heartAnimationVariants = {
    animate: {
      scale: [1, 1.5, 1],
      transition: { duration: 0.5 }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size="sm"
            onClick={onClick}
            disabled={isLoading}
            className={cn("flex items-center gap-1.5 transition-all", 
              isActive ? "text-primary font-medium" : "text-muted-foreground",
              className
            )}
          >
            <div className="relative">
              {isLoading ? (
                <Spinner size="sm" />
              ) : (
                <AnimatePresence>
                  <motion.div
                    animate={showAnimation && isActive ? "animate" : ""}
                    variants={heartAnimationVariants}
                  >
                    {displayIcon}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
            
            {label && <span className="text-sm">{label}</span>}
            {typeof count === 'number' && count > 0 && (
              <span className="text-xs">{count}</span>
            )}
          </Button>
        </TooltipTrigger>
        {tooltip && (
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export default PostInteractionButton;
