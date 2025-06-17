
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAchievements } from '@/hooks/mining/useAchievements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Medal, Trophy, Award, Lightbulb, Lock } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';
import { useMining } from '@/hooks/useMining';
import { Skeleton } from '@/components/ui/skeleton';

const AchievementCard = ({ achievement, userAchievement }) => {
  const progress = userAchievement ? Math.min(100, (userAchievement.progress / achievement.requirements.value) * 100) : 0;
  const isCompleted = userAchievement?.completed || false;
  
  const getAchievementIcon = () => {
    switch (achievement.icon) {
      case 'pick': return <Medal className="h-6 w-6 text-primary" />;
      case 'chat': return <Lightbulb className="h-6 w-6 text-yellow-500" />;
      case 'coin': return <Award className="h-6 w-6 text-blue-400" />;
      default: return <Trophy className="h-6 w-6 text-purple-400" />;
    }
  };
  
  const getDifficultyColor = () => {
    switch (achievement.difficulty) {
      case 'easy': return 'text-green-500 border-green-500/20 bg-green-500/10';
      case 'medium': return 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10';
      case 'hard': return 'text-purple-500 border-purple-500/20 bg-purple-500/10';
      case 'expert': return 'text-red-500 border-red-500/20 bg-red-500/10';
      default: return 'text-gray-500 border-gray-500/20 bg-gray-500/10';
    }
  };
  
  return (
    <Card className={`border-gray-800 ${isCompleted ? 'bg-dark-100/80' : 'bg-dark-100'}`}>
      <CardHeader className="pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className="mr-3 p-2 rounded-full bg-dark-200">
              {getAchievementIcon()}
            </div>
            <div>
              <CardTitle className="text-base mb-1 flex items-center">
                {achievement.title}
                {isCompleted && <Trophy className="h-4 w-4 text-yellow-500 ml-2" />}
              </CardTitle>
              <p className="text-sm text-gray-400">{achievement.description}</p>
            </div>
          </div>
          <Badge className={`${getDifficultyColor()}`}>
            {achievement.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Fortschritt</span>
            <span>{userAchievement ? userAchievement.progress : 0}/{achievement.requirements.value}</span>
          </div>
          <Progress
            value={progress}
            className="h-2"
          />
          <div className="flex justify-between text-sm">
            <span className="text-primary">
              +{formatNumber(achievement.tokenReward)} BSN
            </span>
            <span className="text-yellow-500">
              +{formatNumber(achievement.pointsReward)} Punkte
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AchievementSection = () => {
  const [activeTab, setActiveTab] = useState('all');
  const { miningStats } = useMining();
  const { achievements, userAchievements, isLoading, achievementCounts } = useAchievements(miningStats);
  
  if (isLoading) {
    return (
      <div className="bg-dark-100 rounded-xl border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium flex items-center">
            <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
            Errungenschaften
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-gray-800">
              <CardHeader className="pb-0">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  // Filter achievements based on active tab
  const filteredAchievements = achievements.filter(achievement => {
    if (activeTab === 'all') return true;
    
    const userAchievement = userAchievements.find(ua => 
      ua.achievement_id === achievement.id || ua.achievementId === achievement.id
    );
    
    if (activeTab === 'completed') return userAchievement && userAchievement.completed;
    if (activeTab === 'inprogress') return userAchievement && !userAchievement.completed && userAchievement.progress > 0;
    
    return true;
  });
  
  return (
    <div className="bg-dark-100 rounded-xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          Errungenschaften
        </h3>
        <div className="flex space-x-2">
          <Badge 
            className={`cursor-pointer ${activeTab === 'all' ? 'bg-primary/30' : 'bg-dark-200'}`} 
            onClick={() => setActiveTab('all')}
          >
            Alle ({achievements.length})
          </Badge>
          <Badge 
            className={`cursor-pointer ${activeTab === 'completed' ? 'bg-green-500/30' : 'bg-dark-200'}`} 
            onClick={() => setActiveTab('completed')}
          >
            Abgeschlossen ({achievementCounts.completed})
          </Badge>
          <Badge 
            className={`cursor-pointer ${activeTab === 'inprogress' ? 'bg-yellow-500/30' : 'bg-dark-200'}`} 
            onClick={() => setActiveTab('inprogress')}
          >
            In Arbeit
          </Badge>
        </div>
      </div>
      
      {filteredAchievements.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h4 className="text-lg font-medium mb-2">Keine Errungenschaften gefunden</h4>
          <p className="text-gray-400">
            {activeTab === 'completed' 
              ? 'Du hast noch keine Errungenschaften abgeschlossen.' 
              : activeTab === 'inprogress' 
                ? 'Du hast noch keine Errungenschaften in Bearbeitung.' 
                : 'Es sind keine Errungenschaften verfügbar.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAchievements.map(achievement => {
            const userAchievement = userAchievements.find(ua => 
              ua.achievement_id === achievement.id || ua.achievementId === achievement.id
            );
            
            return (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
                userAchievement={userAchievement} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AchievementSection;
