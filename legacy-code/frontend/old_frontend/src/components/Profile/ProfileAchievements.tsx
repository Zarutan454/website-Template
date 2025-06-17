
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Award, Star, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAchievement } from '@/hooks/mining/achievements/types';

interface ProfileAchievementsProps {
  achievements: UserAchievement[];
  isLoading?: boolean;
  maxItems?: number;
  showCompleted?: boolean;
  onViewAllClick?: () => void;
}

const AchievementIcon = ({ type, completed }: { type: string; completed: boolean }) => {
  const className = `h-5 w-5 ${completed ? 'text-primary' : 'text-gray-500'}`;
  
  switch (type) {
    case 'mining':
      return <Trophy className={className} />;
    case 'social':
      return <Award className={className} />;
    case 'token':
      return <Star className={className} />;
    default:
      return <CheckCircle className={className} />;
  }
};

const ProfileAchievements: React.FC<ProfileAchievementsProps> = ({
  achievements,
  isLoading = false,
  maxItems = 5,
  showCompleted = true,
  onViewAllClick
}) => {
  if (isLoading) {
    return (
      <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/40 transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary mr-1" />
            Erfolge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-800"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!achievements || achievements.length === 0) {
    return (
      <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/40 transition-colors duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary mr-1" />
            Erfolge
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Lock className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">Noch keine Erfolge</h3>
            <p className="text-gray-400 max-w-md">Sei aktiv in der Community und schalte Erfolge frei.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter achievements based on completed status if needed
  const filteredAchievements = showCompleted 
    ? achievements 
    : achievements.filter(achievement => !achievement.completed);
  
  // Limit the number of achievements to display
  const displayedAchievements = filteredAchievements.slice(0, maxItems);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm hover:bg-gray-900/40 transition-colors duration-300">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary mr-1" />
          Erfolge
          {filteredAchievements.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {filteredAchievements.filter(a => a.completed).length}/{filteredAchievements.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {displayedAchievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <div className={`flex items-center justify-center h-10 w-10 rounded-full ${achievement.completed ? 'bg-primary/20' : 'bg-gray-800/50'}`}>
                <AchievementIcon 
                  type={achievement.achievement?.category || 'system'} 
                  completed={achievement.completed}
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">
                  {achievement.title || achievement.achievement?.title || 'Unbekannter Erfolg'}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 rounded-full bg-gray-800 w-full mt-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-primary"
                      style={{ width: `${achievement.completed ? 100 : Math.min(Math.max(0, achievement.progress), 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {achievement.completed ? '100%' : `${Math.floor(achievement.progress)}%`}
                  </span>
                </div>
              </div>
              {achievement.tokenReward || achievement.achievement?.tokenReward ? (
                <Badge variant="success" className="ml-auto">
                  +{achievement.tokenReward || achievement.achievement?.tokenReward || 0}
                </Badge>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
        
        {filteredAchievements.length > maxItems && onViewAllClick && (
          <div className="mt-4 text-center">
            <button 
              onClick={onViewAllClick}
              className="text-sm text-primary hover:text-primary-600 transition-colors"
            >
              Alle {filteredAchievements.length} Erfolge anzeigen
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileAchievements;
