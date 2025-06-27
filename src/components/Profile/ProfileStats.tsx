
import React from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Image, 
  MessageSquare, 
  Heart, 
  Calendar,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProfileStatsProps {
  followers: number;
  following: number;
  posts: number;
  likes?: number;
  joinDate?: string;
  achievements?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
  onPostsClick?: () => void;
  onLikesClick?: () => void;
  onAchievementsClick?: () => void;
}

const ProfileStats: React.FC<ProfileStatsProps> = ({
  followers,
  following,
  posts,
  likes,
  joinDate,
  achievements,
  onFollowersClick,
  onFollowingClick,
  onPostsClick,
  onLikesClick,
  onAchievementsClick
}) => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  // Helper function to format numbers with k, M for thousands and millions
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString('de-DE');
  };

  // Define a type that makes onClick optional
  type StatItem = {
    icon: JSX.Element;
    value: string;
    label: string;
    tooltip: string;
    onClick?: () => void;
  };

  // Define which stats to display based on available data
  const getStatsItems = (): StatItem[] => {
    const items: StatItem[] = [
      {
        icon: <Users className="h-5 w-5 text-primary mr-1" />,
        value: formatLargeNumber(followers),
        label: isMobile ? 'Follower' : 'Follower',
        onClick: onFollowersClick,
        tooltip: 'Anzahl der Follower'
      },
      {
        icon: <Users className="h-5 w-5 text-primary mr-1" />,
        value: formatLargeNumber(following),
        label: isMobile ? 'Folgt' : 'Folgt',
        onClick: onFollowingClick,
        tooltip: 'Anzahl der gefolgten Nutzer'
      },
      {
        icon: <Image className="h-5 w-5 text-primary mr-1" />,
        value: formatLargeNumber(posts),
        label: isMobile ? 'Posts' : 'Beiträge',
        onClick: onPostsClick,
        tooltip: 'Geteilte Beiträge'
      }
    ];

    if (likes !== undefined) {
      items.push({
        icon: <Heart className="h-5 w-5 text-primary mr-1" />,
        value: formatLargeNumber(likes),
        label: isMobile ? 'Likes' : 'Gefällt mir',
        onClick: onLikesClick,
        tooltip: 'Erhaltene Likes'
      });
    } else if (achievements !== undefined) {
      items.push({
        icon: <Trophy className="h-5 w-5 text-primary mr-1" />,
        value: formatLargeNumber(achievements),
        label: isMobile ? 'Erfolge' : 'Erfolge',
        onClick: onAchievementsClick,
        tooltip: 'Erreichte Erfolge'
      });
    } else if (joinDate) {
      items.push({
        icon: <Calendar className="h-5 w-5 text-primary mr-1" />,
        value: "",
        label: `Seit ${format(new Date(joinDate), 'MMM yyyy', { locale: de })}`,
        tooltip: 'Beitrittsdatum'
      });
    }

    return items;
  };

  return (
    <TooltipProvider>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/40 transition-colors duration-300">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getStatsItems().map((item, index) => (
                <motion.div key={index} variants={itemVariants}>
                  {item.onClick ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          className="flex flex-col items-center justify-center h-auto py-3 w-full hover:bg-gray-800/50 transition-colors duration-200"
                          onClick={item.onClick}
                        >
                          <div className="flex items-center justify-center mb-1">
                            {item.icon}
                            <span className="font-bold text-lg">{item.value}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.label}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center justify-center py-3">
                          <div className="flex items-center mb-1">
                            {item.icon}
                            {item.value && <span className="font-bold text-lg">{item.value}</span>}
                          </div>
                          <span className="text-xs text-gray-400 text-center">
                            {item.label}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{item.tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  );
};

export default ProfileStats;
