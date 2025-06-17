
import React, { useEffect } from 'react';
import { useMining } from '@/hooks/useMining';
import { useTheme } from '@/components/ThemeProvider';
import MiningStats from './MiningStats';
import MiningRewards from './MiningRewards';
import { MiningActivityTracker } from './activity-tracker';
import { 
  ActivityList, 
  LeaderboardPreview, 
  AnalyticsSection, 
  InfoBox,
  TokenBalance,
  MiningHistory 
} from './dashboard';
import { Gem, History, Trophy, Users, Loader2, Wallet } from 'lucide-react';
import AchievementSection from './achievements/AchievementSection';
import { ConnectWalletButton } from '@/wallet/auth/ConnectWalletButton';
import { useAccount } from 'wagmi';
import TokenGeneratorIntegration from './TokenGeneratorIntegration';

interface InfoBoxProps {
  title: string;
  value: string;
  description?: string;
  status?: 'success' | 'neutral' | 'warning' | 'error';
}

const MiningDashboard: React.FC = React.memo(() => {
  const { 
    miningStats, 
    recentActivities,
    isLoading, 
    isMining,
    syncMiningState,
    miningRate,
    currentSpeedBoost,
    effectiveMiningRate
  } = useMining();
  
  const { theme } = useTheme();
  const { isConnected } = useAccount();

  // Sync mining state when component mounts
  useEffect(() => {
    if (syncMiningState) {
      syncMiningState();
    }
  }, [syncMiningState]);

  if (isLoading && !miningStats) {
    return (
      <div className="flex justify-center items-center h-[50vh]" data-theme={theme}>
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary-400" />
          <p className="mt-4 text-gray-500">Lade Mining-Daten...</p>
        </div>
      </div>
    );
  }

  // Convert miningStats to MiningStats format required by MiningStats component
  const statsForMiningStats = {
    total_points: miningStats.total_points || 0,
    total_tokens_earned: miningStats.total_tokens_earned || 0,
    daily_points: miningStats.daily_points || 0,
    daily_tokens_earned: miningStats.daily_tokens_earned || 0,
    efficiency_multiplier: miningStats.efficiency_multiplier || 1,
    streak_days: miningStats.streak_days || 0,
  };

  return (
    <div className="space-y-6" data-theme={theme}>
      {/* Mining Overview Grid - Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Balance & Key Stats */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Token Balance with real-time updates when mining is active */}
            <TokenBalance 
              miningRate={isMining ? miningRate : 0} 
              speedBoost={isMining ? currentSpeedBoost : 0}
              effectiveRate={isMining ? effectiveMiningRate : 0}
              isLoading={isLoading} 
            />
            
            {/* Mining History - Compact version */}
            <MiningHistory activities={recentActivities.slice(0, 5)} />
          </div>
        </div>
        
        {/* Mining Activity Tracker - Main Control Center */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex justify-end">
            {!isConnected && (
              <ConnectWalletButton size="sm" />
            )}
          </div>
          <MiningActivityTracker />
        </div>
      </div>

      {/* Token Generator Integration */}
      <TokenGeneratorIntegration 
        miningStats={miningStats} 
        createdTokens={3} // This would ideally come from a token service
      />

      {/* Achievement Section */}
      <AchievementSection />

      {/* Statistics Summary Section */}
      <div className="bg-dark-100 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center mb-4">
          <Gem className="h-5 w-5 text-primary-400 mr-2" />
          <h3 className="text-lg font-medium">Mining Statistiken</h3>
        </div>
        <MiningStats stats={statsForMiningStats} miningRate={miningRate} />
      </div>
      
      {/* Recent Activities & Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-dark-100 rounded-xl border border-gray-800 p-6">
          <ActivityList 
            activities={recentActivities.slice(0, 5)} 
            isLoading={isLoading} 
          />
        </div>

        {/* Leaderboard */}
        <div className="lg:col-span-1 bg-dark-100 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-primary-400 mr-2" />
            <h3 className="text-lg font-medium">Top Miner</h3>
          </div>
          <LeaderboardPreview />
        </div>
      </div>

      {/* Mining Rewards */}
      <div className="bg-dark-100 rounded-xl border border-gray-800 p-6">
        <div className="flex items-center mb-4">
          <Trophy className="h-5 w-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-medium">Mining Belohnungen</h3>
        </div>
        <MiningRewards />
      </div>

      {/* Advanced Analytics (collapsible) */}
      <AnalyticsSection 
        miningStats={miningStats} 
        activities={recentActivities}
        isMining={isMining}
      />

      {/* Info Box */}
      <InfoBox 
        title="Mining Informationen"
        value="BSN Network"
        description="Verdiene Token durch deine Aktivitäten im Netzwerk"
        status="neutral"
      />

      {/* Wallet Connect Reminder */}
      {!isConnected && (
        <div className="bg-dark-100 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <Wallet className="h-5 w-5 text-primary-400 mr-2" />
            <h3 className="text-lg font-medium">Wallet verbinden</h3>
          </div>
          <div className="text-center py-4">
            <p className="text-gray-400 mb-4">Verbinde deine Wallet, um deine BSN-Token zu sichern und an Transaktionen teilzunehmen.</p>
            <ConnectWalletButton />
          </div>
        </div>
      )}
    </div>
  );
});

MiningDashboard.displayName = 'MiningDashboard';

export default MiningDashboard;
