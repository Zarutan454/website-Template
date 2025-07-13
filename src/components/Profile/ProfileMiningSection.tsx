import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, 
  Coins, 
  TrendingUp, 
  Clock, 
  Award, 
  Activity,
  Play,
  Pause,
  BarChart3,
  Target
} from 'lucide-react';
import { useMining } from '@/hooks/mining/useMining';
import { useLiveTokenCounter } from '@/hooks/mining/useLiveTokenCounter';
import { cn } from '@/lib/utils';

interface ProfileMiningSectionProps {
  userId: string;
  isOwnProfile: boolean;
}

const ProfileMiningSection: React.FC<ProfileMiningSectionProps> = ({ 
  userId, 
  isOwnProfile 
}) => {
  const { 
    miningStats, 
    isLoading, 
    error,
    isMining,
    startMining,
    stopMining
  } = useMining();
  
  const liveTokenValue = useLiveTokenCounter();

  const handleMiningToggle = async () => {
    if (isLoading) return;
    
    try {
      if (isMining) {
        await stopMining();
      } else {
        await startMining();
      }
    } catch (error) {
      console.error('Mining toggle error:', error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card className="bg-dark-200/60 border-gray-700/50">
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-1/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-700/50">
        <CardContent className="p-6">
          <div className="text-center">
            <Zap className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">
              Mining-Daten konnten nicht geladen werden
            </h3>
            <p className="text-red-300 text-sm">
              {error}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No mining data
  if (!miningStats) {
    return (
      <Card className="bg-dark-200/60 border-gray-700/50">
        <CardContent className="p-6">
          <div className="text-center">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              Mining nicht verfügbar
            </h3>
            <p className="text-gray-400 text-sm">
              Mining-Funktionen werden bald verfügbar sein
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = {
    totalTokens: miningStats.total_tokens_earned || 0,
    dailyTokens: miningStats.daily_tokens_earned || 0,
    miningRate: miningStats.mining_rate || 0,
    streakDays: miningStats.streak_days || 0,
    efficiency: miningStats.efficiency_multiplier || 1,
    totalPoints: miningStats.total_points || 0,
    dailyPoints: miningStats.daily_points || 0
  };

  const dailyProgress = Math.min(100, (stats.dailyTokens / 10) * 100); // 10 tokens daily goal
  const efficiencyPercentage = Math.round(stats.efficiency * 100);

  return (
    <div className="space-y-4">
      {/* Mining Status Card */}
      <Card className="bg-dark-200/60 border-gray-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Mining Status</CardTitle>
            </div>
            <Badge 
              variant={isMining ? "default" : "secondary"}
              className={cn(
                "flex items-center gap-1",
                isMining && "bg-green-600 hover:bg-green-700"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                isMining ? "bg-green-400" : "bg-gray-400"
              )} />
              {isMining ? "Aktiv" : "Inaktiv"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Mining Control - Only for own profile */}
          {isOwnProfile && (
            <div className="flex justify-center">
              <Button
                onClick={handleMiningToggle}
                disabled={isLoading}
                variant={isMining ? "destructive" : "default"}
                size="lg"
                className="gap-2 min-w-[140px]"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : isMining ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Stoppen
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Starten
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Live Token Counter */}
          <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border border-primary/20">
            <div className="text-2xl font-bold text-primary">
              {liveTokenValue.toFixed(3)} BSN
            </div>
            <div className="text-sm text-gray-400">Live Token Balance</div>
          </div>

          {/* Daily Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tägliches Ziel</span>
              <span className="text-gray-300">{stats.dailyTokens.toFixed(2)} / 10.00 BSN</span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Mining Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-dark-200/60 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-400">Gesamt</span>
            </div>
            <div className="text-xl font-bold text-white">
              {stats.totalTokens.toFixed(2)} BSN
            </div>
            <div className="text-xs text-gray-500">Verdiente Tokens</div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200/60 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-400">Rate</span>
            </div>
            <div className="text-xl font-bold text-white">
              {(stats.miningRate * 60).toFixed(2)}/h
            </div>
            <div className="text-xs text-gray-500">Tokens pro Stunde</div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200/60 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-gray-400">Streak</span>
            </div>
            <div className="text-xl font-bold text-white">
              {stats.streakDays} Tage
            </div>
            <div className="text-xs text-gray-500">Aktiver Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-dark-200/60 border-gray-700/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-400">Effizienz</span>
            </div>
            <div className="text-xl font-bold text-white">
              {efficiencyPercentage}%
            </div>
            <div className="text-xs text-gray-500">Mining-Effizienz</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Points */}
      <Card className="bg-dark-200/60 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Aktivitätspunkte</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.totalPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Gesamtpunkte</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {stats.dailyPoints.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Heute</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mining Info */}
      <Card className="bg-blue-900/20 border-blue-700/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <h4 className="font-medium text-blue-300">Mining-Status</h4>
              <p className="text-sm text-blue-200">
                Mining ist derzeit deaktiviert bis 100k Nutzer erreicht sind. 
                Token werden simuliert und bei Launch verfügbar sein.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileMiningSection; 