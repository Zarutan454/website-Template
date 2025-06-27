
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import { UserAchievement } from '@/hooks/mining/achievements/types';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface ProfileCardAchievementsProps {
  achievements: UserAchievement[];
  isLoading?: boolean;
  maxToShow?: number;
  onViewAll?: () => void;
}

const ProfileCardAchievements: React.FC<ProfileCardAchievementsProps> = ({
  achievements,
  isLoading = false,
  maxToShow = 3,
  onViewAll
}) => {
  if (isLoading) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">Errungenschaften</h4>
        </div>
        <div className="flex flex-wrap gap-2 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-8 rounded-full bg-gray-800/60"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter completed achievements
  const completedAchievements = achievements.filter(achievement => achievement.completed);

  if (completedAchievements.length === 0) {
    return (
      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">Errungenschaften</h4>
        </div>
        <p className="text-xs text-gray-400">Noch keine Errungenschaften freigeschaltet</p>
      </div>
    );
  }

  // Show only the first few achievements
  const displayedAchievements = completedAchievements.slice(0, maxToShow);

  // Animation variants for badges
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">Errungenschaften</h4>
        </div>
        <Badge variant="outline" className="text-xs">
          {completedAchievements.length}
        </Badge>
      </div>
      
      <motion.div 
        className="flex flex-wrap gap-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {displayedAchievements.map((achievement) => {
          const category = achievement.achievement?.category || 'system';
          
          return (
            <motion.div 
              key={achievement.id}
              className="group relative"
              variants={item}
              whileHover={{ scale: 1.1 }}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center
                ${category === 'mining' ? 'bg-yellow-500/20 border border-yellow-500/30' :
                  category === 'social' ? 'bg-blue-500/20 border border-blue-500/30' :
                  category === 'token' ? 'bg-green-500/20 border border-green-500/30' :
                  'bg-purple-500/20 border border-purple-500/30'}`}
              >
                {category === 'mining' ? (
                  <Trophy className="h-4 w-4 text-yellow-500" />
                ) : category === 'social' ? (
                  <Award className="h-4 w-4 text-blue-500" />
                ) : category === 'token' ? (
                  <Medal className="h-4 w-4 text-green-500" />
                ) : (
                  <Award className="h-4 w-4 text-purple-500" />
                )}
              </div>
              
              <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                {achievement.title || achievement.achievement?.title || 'Achievement'}
              </div>
            </motion.div>
          );
        })}
        
        {completedAchievements.length > maxToShow && (
          <motion.div 
            variants={item}
            className="h-8 w-8 rounded-full bg-gray-800/60 flex items-center justify-center cursor-pointer"
            onClick={onViewAll}
            whileHover={{ scale: 1.1 }}
          >
            <span className="text-xs text-gray-400">+{completedAchievements.length - maxToShow}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileCardAchievements;
