import React from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { MiningStats } from '@/hooks/mining/types';

interface MiningActivityTrackerProps {
  stats: MiningStats | null;
  isLoading: boolean;
}

const MiningActivityTracker: React.FC<MiningActivityTrackerProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation();

  if (isLoading || !stats) {
    return (
      <div className="p-4 border rounded-lg bg-gray-800 bg-opacity-50">
        <h3 className="text-lg font-bold text-white mb-4">{t('mining.activity.title')}</h3>
        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  const activityData = [
    {
      label: t('mining.stats.miningPower'),
      value: stats.mining_power,
      icon: '⚡️',
    },
    {
      label: t('mining.stats.currentRate'),
      value: `${stats.current_rate} ${t('mining.tokensPerDay')}`,
      icon: '⛏️',
    },
    {
      label: t('mining.stats.activeBoosts'),
      value: stats.active_boosts.length,
      icon: '🚀',
    },
  ];

  return (
    <div className="p-4 border rounded-lg bg-gray-800 bg-opacity-50 backdrop-blur-sm">
      <h3 className="text-lg font-bold text-white mb-4">{t('mining.activity.title')}</h3>
      <ul className="space-y-3">
        {activityData.map((item, index) => (
          <li key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <span className="mr-3 text-xl">{item.icon}</span>
              <span className="text-gray-300">{item.label}</span>
            </div>
            <span className="font-semibold text-white">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MiningActivityTracker; 