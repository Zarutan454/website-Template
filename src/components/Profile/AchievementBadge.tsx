
import React from 'react';
import { Award, Trophy, Star, CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserAchievement } from '@/hooks/mining/achievements/types';
import { Badge } from '@/components/ui/badge';

interface AchievementBadgeProps {
  achievement: UserAchievement;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
  showProgress?: boolean;
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  size = 'md', 
  showTooltip = true,
  showProgress = false 
}) => {
  const isCompleted = achievement.completed;
  const progress = achievement.progress;
  const category = achievement.achievement?.category || 'system';
  
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'lg': return 'h-16 w-16';
      default: return 'h-12 w-12';
    }
  };
  
  const getIconClass = () => {
    switch (size) {
      case 'sm': return 'h-4 w-4';
      case 'lg': return 'h-8 w-8';
      default: return 'h-6 w-6';
    }
  };
  
  const getIcon = () => {
    switch (category) {
      case 'mining':
        return <Trophy className={`${getIconClass()} ${isCompleted ? 'text-yellow-500' : 'text-gray-500'}`} />;
      case 'social':
        return <Award className={`${getIconClass()} ${isCompleted ? 'text-blue-500' : 'text-gray-500'}`} />;
      case 'token':
        return <Star className={`${getIconClass()} ${isCompleted ? 'text-green-500' : 'text-gray-500'}`} />;
      default:
        return <CheckCircle className={`${getIconClass()} ${isCompleted ? 'text-purple-500' : 'text-gray-500'}`} />;
    }
  };
  
  return (
    <div className="relative group">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`flex items-center justify-center rounded-full ${getSizeClass()} ${
          isCompleted 
            ? `bg-gradient-to-br from-gray-800 to-gray-900 border-2 ${
                category === 'mining' ? 'border-yellow-500/50' : 
                category === 'social' ? 'border-blue-500/50' : 
                category === 'token' ? 'border-green-500/50' : 
                'border-purple-500/50'
              }`
            : 'bg-gray-800/50 border border-gray-700'
        }`}
      >
        {getIcon()}
        
        {showProgress && !isCompleted && progress > 0 && (
          <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 32 32">
            <circle
              className="text-gray-700"
              strokeWidth="2"
              stroke="currentColor"
              fill="transparent"
              r="15"
              cx="16"
              cy="16"
            />
            <circle
              className="text-primary"
              strokeWidth="2"
              strokeDasharray={94.2}
              strokeDashoffset={94.2 - (94.2 * Math.min(progress, 100)) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="15"
              cx="16"
              cy="16"
            />
          </svg>
        )}
      </motion.div>
      
      {showTooltip && (
        <div className="absolute z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
          {achievement.title || achievement.achievement?.title || 'Achievement'}
          {!isCompleted && progress > 0 && (
            <span className="ml-1">({Math.floor(progress)}%)</span>
          )}
        </div>
      )}
      
      {isCompleted && (achievement.tokenReward || achievement.token_reward) && (
        <Badge 
          variant="success" 
          className="absolute -bottom-1 -right-1 text-xs px-1 py-0 min-w-[1rem] text-center"
        >
          +{achievement.tokenReward || achievement.token_reward}
        </Badge>
      )}
    </div>
  );
};

export default AchievementBadge;
