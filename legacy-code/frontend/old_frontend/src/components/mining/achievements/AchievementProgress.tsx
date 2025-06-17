
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { UserAchievement } from '@/hooks/mining/achievements/types';

interface AchievementProgressProps {
  achievement: UserAchievement;
  showDetails?: boolean;
}

const AchievementProgress: React.FC<AchievementProgressProps> = ({ 
  achievement, 
  showDetails = true 
}) => {
  // Berechne den aktuellen Fortschritt in Prozent
  const targetValue = achievement.achievement?.requirements.value || 100;
  const progressValue = achievement.progress || 0;
  const progressPercentage = Math.min(100, Math.round((progressValue / targetValue) * 100));
  
  return (
    <div className="space-y-1 bsn-dark-gradient p-3 rounded-lg">
      {showDetails && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">{achievement.achievement?.title || achievement.title || 'Unbekannt'}</span>
          <span className="font-medium">
            {achievement.completed 
              ? 'Abgeschlossen' 
              : `${progressValue}/${targetValue}`}
          </span>
        </div>
      )}
      
      <Progress 
        value={progressPercentage} 
        className={`h-2 ${achievement.completed ? 'bg-green-500/20' : 'bg-primary/20'}`}
        indicatorClassName={achievement.completed ? 'bg-green-500' : 'bg-primary'}
      />
      
      {showDetails && achievement.completed && (
        <div className="text-xs text-green-500 mt-1">
          Abgeschlossen am: {achievement.completedAt?.toLocaleDateString() || achievement.completed_at?.toLocaleDateString() || 'Kürzlich'}
        </div>
      )}
    </div>
  );
};

export default AchievementProgress;
