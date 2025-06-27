
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Star, Calendar } from "lucide-react";
import { UserAchievement } from '@/hooks/mining/achievements/types';
import { ACHIEVEMENTS } from '@/hooks/mining/achievements/achievementList';

interface AchievementOverviewProps {
  userAchievements: UserAchievement[];
  isLoading?: boolean;
}

const AchievementOverview: React.FC<AchievementOverviewProps> = ({ 
  userAchievements,
  isLoading = false
}) => {
  // Calculate total progress
  const completedCount = userAchievements.filter(ua => ua.completed).length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  // Calculate total rewards earned
  const earnedRewards = userAchievements
    .filter(ua => ua.completed)
    .reduce((total, ua) => {
      const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId);
      return total + (achievement?.tokenReward || 0);
    }, 0);
  
  if (isLoading) {
    return (
      <Card className="bg-dark-100 border-gray-800 animate-pulse">
        <CardHeader>
          <div className="h-6 w-48 bg-dark-300 rounded mb-2"></div>
          <div className="h-4 w-full bg-dark-300 rounded"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full bg-dark-300 rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-24 bg-dark-300 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-dark-100 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          Achievement-Fortschritt
        </CardTitle>
        <CardDescription>
          Verfolge deinen Fortschritt bei verschiedenen Herausforderungen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">Gesamtfortschritt</span>
              <span className="text-sm text-primary">{completedCount} / {totalCount} Abgeschlossen</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-dark-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <Award className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-lg font-bold text-white">{completedCount}</span>
              <span className="text-xs text-gray-400">Abgeschlossene Achievements</span>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <Star className="h-8 w-8 text-primary-400 mb-2" />
              <span className="text-lg font-bold text-white">{earnedRewards}</span>
              <span className="text-xs text-gray-400">BSN Token verdient</span>
            </div>
            
            <div className="bg-dark-200 rounded-lg p-4 flex flex-col items-center justify-center">
              <Calendar className="h-8 w-8 text-blue-400 mb-2" />
              <span className="text-lg font-bold text-white">{totalCount - completedCount}</span>
              <span className="text-xs text-gray-400">Ausstehende Achievements</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementOverview;
