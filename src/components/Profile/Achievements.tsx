import React from 'react';
import { Achievement } from '../../hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Star, Target, TrendingUp } from 'lucide-react';

interface AchievementsProps {
  achievements: Achievement[];
  totalAchievements: number;
  totalPossible: number;
}

export const Achievements: React.FC<AchievementsProps> = ({ 
  achievements, 
  totalAchievements, 
  totalPossible 
}) => {
  const progressPercentage = Math.round((totalAchievements / totalPossible) * 100);

  const getAchievementColor = (achievementId: string) => {
    if (achievementId.includes('first')) return 'bg-green-100 text-green-800';
    if (achievementId.includes('prolific')) return 'bg-blue-100 text-blue-800';
    if (achievementId.includes('popular')) return 'bg-purple-100 text-purple-800';
    if (achievementId.includes('mining')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getAchievementIcon = (achievementId: string) => {
    if (achievementId.includes('first')) return '🥇';
    if (achievementId.includes('prolific')) return '📊';
    if (achievementId.includes('popular')) return '⭐';
    if (achievementId.includes('mining')) return '⛏️';
    return '🏆';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Achievements
          <Badge variant="secondary" className="ml-auto">
            {totalAchievements}/{totalPossible}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fortschrittsbalken */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fortschritt</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${getAchievementColor(achievement.id)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {getAchievementIcon(achievement.id)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs opacity-80 mt-1">
                      {achievement.description}
                    </p>
                    <p className="text-xs opacity-60 mt-2">
                      Freigeschaltet: {new Date(achievement.unlocked_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Noch keine Achievements freigeschaltet</p>
            <p className="text-xs mt-1">Sei aktiv, um Achievements zu verdienen!</p>
          </div>
        )}

        {/* Achievement-Kategorien */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">Achievement-Kategorien</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
              <Star className="w-3 h-3 text-green-600" />
              <span>Erste Schritte</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
              <TrendingUp className="w-3 h-3 text-blue-600" />
              <span>Aktivität</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
              <Target className="w-3 h-3 text-purple-600" />
              <span>Popularität</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
              <Trophy className="w-3 h-3 text-orange-600" />
              <span>Mining</span>
            </div>
          </div>
        </div>

        {/* Nächste Achievements */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium text-sm">Nächste Achievements</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>100 Posts erstellen</span>
              <Badge variant="outline" className="text-xs">
                Fortschritt: 0/100
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>500 Follower erreichen</span>
              <Badge variant="outline" className="text-xs">
                Fortschritt: 0/500
              </Badge>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span>10.000 Token minen</span>
              <Badge variant="outline" className="text-xs">
                Fortschritt: 0/10000
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 