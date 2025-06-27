
import React from 'react';
import { UserAchievement } from '@/hooks/mining/achievements/types';
import AchievementCard from './AchievementCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ACHIEVEMENT_CATEGORIES } from '@/hooks/mining/achievements/types';

interface AchievementListProps {
  achievements: UserAchievement[];
  loading?: boolean;
}

const AchievementList: React.FC<AchievementListProps> = ({ 
  achievements, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-md bg-gray-800/50 animate-pulse" />
        ))}
      </div>
    );
  }
  
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">Keine Achievements verfügbar</p>
      </div>
    );
  }
  
  // Gruppiere nach Kategorien
  const shortTerm = achievements.filter(a => a.achievement?.category === ACHIEVEMENT_CATEGORIES.SHORT_TERM);
  const midTerm = achievements.filter(a => a.achievement?.category === ACHIEVEMENT_CATEGORIES.MID_TERM);
  const longTerm = achievements.filter(a => a.achievement?.category === ACHIEVEMENT_CATEGORIES.LONG_TERM);
  const elite = achievements.filter(a => a.achievement?.category === ACHIEVEMENT_CATEGORIES.ELITE);
  
  return (
    <Tabs defaultValue="short">
      <TabsList className="w-full mb-4">
        <TabsTrigger value="short" className="flex-1">Mining</TabsTrigger>
        <TabsTrigger value="mid" className="flex-1">Social</TabsTrigger>
        <TabsTrigger value="long" className="flex-1">Token</TabsTrigger>
        <TabsTrigger value="elite" className="flex-1">Elite</TabsTrigger>
      </TabsList>
      
      <TabsContent value="short" className="space-y-4">
        {shortTerm.length > 0 ? (
          shortTerm.map((achievement) => (
            <AchievementCard 
              key={achievement.id}
              achievement={achievement.achievement!}
              progress={achievement.progress}
              completed={achievement.completed}
            />
          ))
        ) : (
          <p className="text-center py-4 text-gray-400">Keine Mining-Achievements verfügbar</p>
        )}
      </TabsContent>
      
      <TabsContent value="mid" className="space-y-4">
        {midTerm.length > 0 ? (
          midTerm.map((achievement) => (
            <AchievementCard 
              key={achievement.id}
              achievement={achievement.achievement!}
              progress={achievement.progress}
              completed={achievement.completed}
            />
          ))
        ) : (
          <p className="text-center py-4 text-gray-400">Keine Social-Achievements verfügbar</p>
        )}
      </TabsContent>
      
      <TabsContent value="long" className="space-y-4">
        {longTerm.length > 0 ? (
          longTerm.map((achievement) => (
            <AchievementCard 
              key={achievement.id}
              achievement={achievement.achievement!}
              progress={achievement.progress}
              completed={achievement.completed}
            />
          ))
        ) : (
          <p className="text-center py-4 text-gray-400">Keine Token-Achievements verfügbar</p>
        )}
      </TabsContent>
      
      <TabsContent value="elite" className="space-y-4">
        {elite.length > 0 ? (
          elite.map((achievement) => (
            <AchievementCard 
              key={achievement.id}
              achievement={achievement.achievement!}
              progress={achievement.progress}
              completed={achievement.completed}
            />
          ))
        ) : (
          <p className="text-center py-4 text-gray-400">Keine Elite-Achievements verfügbar</p>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AchievementList;
