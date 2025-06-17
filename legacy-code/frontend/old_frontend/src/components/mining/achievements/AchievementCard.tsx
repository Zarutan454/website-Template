
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Achievement } from '@/hooks/mining/achievements/types';

interface AchievementCardProps {
  achievement: Achievement;
  progress?: number;
  completed?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ 
  achievement, 
  progress = 0, 
  completed = false 
}) => {
  // Berechne Fortschrittsanzeige in Prozent
  const progressPercentage = Math.min(100, Math.round((progress / achievement.requirements.value) * 100));

  return (
    <Card className={`bsn-dark-gradient transition-all duration-300 ${
      completed 
        ? 'border-green-500 bg-green-950/20' 
        : 'hover:border-primary/50'
    }`}>
      <CardHeader className="pb-2 pt-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-medium">{achievement.title}</CardTitle>
          <Badge variant={
            achievement.difficulty === 'easy' ? 'default' :
            achievement.difficulty === 'medium' ? 'secondary' :
            achievement.difficulty === 'hard' ? 'destructive' : 'outline'
          }>
            {achievement.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400 mb-3">{achievement.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Fortschritt:</span>
            <span className="font-medium">
              {completed ? 'Abgeschlossen' : `${progressPercentage}%`}
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${completed ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          
          <div className="flex justify-between text-xs mt-2">
            <span className="text-green-400">+{achievement.token_reward} BSN</span>
            <span className="text-primary">+{achievement.points_reward} Punkte</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementCard;
