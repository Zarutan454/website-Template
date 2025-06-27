import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useAccount } from 'wagmi';
import { Loader2, AlertCircle, Gem } from 'lucide-react';

import { useMining } from '@/hooks/mining/useMining';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AchievementSection from '@/components/mining/achievements/AchievementSection';
import { useLiveTokenCounter } from '@/hooks/mining/useLiveTokenCounter';

const StatCard = ({ label, value }: { label: string; value: string | number }) => (
  <div className="bg-dark-100 p-4 rounded-lg border border-gray-800 text-center">
    <p className="text-sm text-gray-400">{label}</p>
    <p className="text-xl font-bold text-white">{value}</p>
  </div>
);

const MiningDashboard: React.FC = React.memo(() => {
  const { 
    miningStats, 
    isMining,
    isLoading,
    error,
    heartbeat,
    startMining,
    stopMining,
    clearError,
  } = useMining();
  const liveTokenValue = useLiveTokenCounter();
  
  const { theme } = useTheme();
  const { isConnected } = useAccount();
  const { t } = useTranslation();

  useEffect(() => {
    if (isMining) {
      const interval = setInterval(() => {
        heartbeat();
      }, 30000); // Send heartbeat every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isMining, heartbeat]);
  
  const handleMiningToggle = async () => {
    if (isLoading) return;
    const action = isMining ? stopMining : startMining;
    await action();
  };

  if (isLoading && !miningStats) {
    return (
      <div className="flex justify-center items-center h-[50vh]" data-theme={theme}>
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary-400" />
          <p className="text-lg font-medium text-gray-200">{t('loading_mining_data', 'Lade Mining-Daten...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={clearError} variant="outline" className="mt-4">
            {t('dismiss', 'Verwerfen')}
          </Button>
        </Alert>
      </div>
    );
  }

  if (!isConnected || !miningStats) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-lg text-gray-400">{t('connect_wallet_or_no_data', 'Bitte Wallet verbinden oder Seite neu laden.')}</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8" data-theme={theme}>
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t('mining_dashboard', 'Mining Dashboard')}</h1>
          <p className="text-gray-400 mt-1">{t('mining_dashboard_subtitle', 'Überwache deine Mining-Performance.')}</p>
        </div>
        <Button onClick={handleMiningToggle} disabled={isLoading} variant={isMining ? 'destructive' : 'default'} size="lg">
          <Gem className="mr-2 h-5 w-5" />
          {isLoading ? t('loading', 'Lädt...') : isMining ? t('stop_mining', 'Mining stoppen') : t('start_mining', 'Mining starten')}
        </Button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label={t('status', 'Status')} value={isMining ? 'Aktiv' : 'Inaktiv'} />
        <StatCard label={t('mining_power', 'Mining Power')} value={`${miningStats.mining_power} H/s`} />
        <StatCard label={t('current_rate', 'Aktuelle Rate')} value={`${miningStats.current_rate_per_minute.toFixed(4)} BSN/min`} />
        <StatCard label={t('accumulated', 'Angesammelt')} value={`${liveTokenValue.toFixed(3)} BSN`} />
      </main>

      <div className="pt-8">
        <AchievementSection />
      </div>
    </div>
  );
});

export default MiningDashboard; 