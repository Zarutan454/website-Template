import React, { useEffect } from 'react';
import { useMining } from '@/hooks/useMining';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Trophy, Users, Hammer } from 'lucide-react';
import { ActivityList, AnalyticsSection, InfoBox, LeaderboardPreview, MiningHistory, TokenBalance } from './index';
import { DataCard } from '@/components/ui/data-card';
import MiningLoadingState from '@/components/Feed/Mining/MiningLoadingState';

const MiningDashboard: React.FC = () => {
  const { 
    miningStats, 
    recentActivities,
    isLoading, 
    isMining, 
    startMining,
    stopMining,
    syncMiningState,
    miningRate 
  } = useMining();

  useEffect(() => {
    if (isMining) {
      const interval = setInterval(() => {
        syncMiningState();
      }, 60000); // Jede Minute aktualisieren
      
      return () => clearInterval(interval);
    }
  }, [isMining, syncMiningState]);

  const toggleMining = async () => {
    if (isMining) {
      await stopMining();
    } else {
      await startMining();
    }
  };

  if (isLoading) {
    return <MiningLoadingState message="Mining-Daten werden geladen..." />;
  }

  const normalizedStats = {
    ...miningStats,
    totalTokensEarned: miningStats.total_tokens_earned || 0,
    efficiencyMultiplier: miningStats.efficiency_multiplier || 1,
    streakDays: miningStats.streak_days || 0
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Mining Dashboard</h1>
          <p className="text-muted-foreground">
            Erhalte Token für deine Aktivitäten im Netzwerk
          </p>
        </div>
        
        <Button 
          onClick={toggleMining}
          size="lg"
          variant={isMining ? "destructive" : "default"}
          className="gap-2"
        >
          {isMining ? (
            <>
              <Hammer className="h-4 w-4" />
              Mining stoppen
            </>
          ) : (
            <>
              <Hammer className="h-4 w-4" />
              Mining starten
            </>
          )}
        </Button>
      </div>

      {miningStats ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoBox
            title="Token Balance"
            value={normalizedStats.total_tokens_earned.toFixed(2) || "0.00"}
            description="Geminte Token insgesamt"
            icon={<TokenBalance miningRate={miningRate} isLoading={false} />}
          />
          
          <InfoBox
            title="Mining Rate"
            value={`${((miningRate || 0) * 60).toFixed(2)}/h`}
            description={isMining ? "Aktiv" : "Inaktiv"}
            icon={<Hammer className="h-8 w-8 text-primary" />}
            status={isMining ? "success" : "neutral"}
          />
          
          <InfoBox
            title="Effizienz"
            value={`${((normalizedStats.efficiencyMultiplier) * 100).toFixed(0)}%`}
            description={`Streak: ${normalizedStats.streakDays} Tage`}
            icon={<Activity className="h-8 w-8 text-primary" />}
          />
        </div>
      ) : null}

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            Aktivitäten
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Trophy className="h-4 w-4" />
            Statistiken
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Users className="h-4 w-4" />
            Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <DataCard
            title="Mining-Aktivitäten"
            description="Deine letzten Mining-Aktivitäten"
            isLoading={isLoading}
            icon={<Activity className="h-5 w-5" />}
          >
            <MiningHistory 
              activities={recentActivities}
              isLoading={false}
            />
          </DataCard>
          
          <DataCard
            title="Aktivitätsliste"
            description="Detaillierte Übersicht deiner Aktivitäten"
            isLoading={isLoading}
            icon={<Activity className="h-5 w-5" />}
          >
            <ActivityList 
              activities={recentActivities} 
              isLoading={false} 
            />
          </DataCard>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <DataCard
            title="Mining-Statistiken"
            description="Detaillierte Analyse deiner Mining-Aktivitäten"
            isLoading={isLoading}
            icon={<Trophy className="h-5 w-5" />}
          >
            <AnalyticsSection 
              miningStats={miningStats} 
              activities={recentActivities}
              isMining={isMining}
            />
          </DataCard>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="space-y-4">
          <DataCard
            title="Leaderboard"
            description="Die aktivsten Miner im Netzwerk"
            isLoading={isLoading}
            icon={<Users className="h-5 w-5" />}
          >
            <LeaderboardPreview />
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MiningDashboard;
