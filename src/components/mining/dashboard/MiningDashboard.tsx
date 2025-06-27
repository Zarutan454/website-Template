import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMining } from '@/hooks/mining/useMining';
import { useLiveTokenCounter } from '@/hooks/mining/useLiveTokenCounter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Trophy, Users, Hammer } from 'lucide-react';
import { ActivityList, AnalyticsSection, LeaderboardPreview, MiningHistory } from './index';
import { DataCard } from '@/components/ui/data-card';
import MiningLoadingState from '@/components/Feed/Mining/MiningLoadingState';
import { StatCard } from '@/components/mining/StatCard';

const MiningDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { 
    miningStats, 
    recentActivities,
    isLoading, 
    isMining, 
    startMining,
    stopMining,
    heartbeat,
  } = useMining();
  
  const liveTokenValue = useLiveTokenCounter();

  useEffect(() => {
    if (isMining) {
      const interval = setInterval(() => {
        heartbeat();
      }, 30000); // Heartbeat for presence and accurate calculation
      
      return () => clearInterval(interval);
    }
  }, [isMining, heartbeat]);

  const toggleMining = async () => {
    if (isLoading) return;
    if (isMining) {
      await stopMining();
    } else {
      await startMining();
    }
  };

  if (isLoading && !miningStats) {
    return <MiningLoadingState message={t('loading_mining_data', 'Mining-Daten werden geladen...')} />;
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t('mining_dashboard', 'Mining Dashboard')}</h1>
          <p className="text-muted-foreground">
            {t('mining_dashboard_subtitle_long', 'Erhalte Token für deine Aktivitäten im Netzwerk')}
          </p>
        </div>
        
        <Button 
          onClick={toggleMining}
          size="lg"
          variant={isMining ? "destructive" : "default"}
          className="gap-2"
          disabled={isLoading}
        >
          <Hammer className="h-4 w-4" />
          {isLoading 
            ? t('loading', 'Lädt...') 
            : isMining 
            ? t('stop_mining', 'Mining stoppen') 
            : t('start_mining', 'Mining starten')}
        </Button>
      </div>

      {miningStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t('status', 'Status')}
            value={isMining ? t('active', 'Aktiv') : t('inactive', 'Inaktiv')}
          />
          <StatCard
            label={t('accumulated', 'Angesammelt')}
            value={`${liveTokenValue.toFixed(3)} BSN`}
          />
          <StatCard
            label={t('mining_power', 'Mining Power')}
            value={`${miningStats.mining_power} H/s`}
          />
          <StatCard
            label={t('current_rate', 'Aktuelle Rate')}
            value={`${miningStats.current_rate_per_minute.toFixed(4)} BSN/min`}
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
