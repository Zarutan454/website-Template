import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { MiningStats } from '@/hooks/mining/types';
import { useTranslation } from 'react-i18next';

interface MiningOverviewProps {
  stats: MiningStats | null;
  isLoading: boolean;
}

const MiningOverview: React.FC<MiningOverviewProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div>
        <p className="text-sm text-gray-400">{t('mining.overview.status')}</p>
        <p className="text-2xl font-bold text-green-400">{stats.is_mining ? t('mining.overview.active') : t('mining.overview.inactive')}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">{t('mining.overview.miningRate')}</p>
        <p className="text-2xl font-bold text-white">{stats.current_rate}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">{t('mining.overview.dailyEarnings')}</p>
        <p className="text-2xl font-bold text-white">{stats.accumulated_tokens}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400">{t('mining.overview.miningStreak')}</p>
        <p className="text-2xl font-bold text-white">{stats.streak_days} {t('mining.overview.days')}</p>
      </div>
    </div>
  );
};

export default MiningOverview; 