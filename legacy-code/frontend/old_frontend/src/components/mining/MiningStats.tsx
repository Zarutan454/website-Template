
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatNumber } from '@/utils/formatters';

interface MiningStatsProps {
  stats: {
    total_points: number;
    total_tokens_earned: number;
    daily_points: number;
    daily_tokens_earned: number;
    efficiency_multiplier?: number;
    streak_days?: number;
  };
  miningRate: number;
}

const MiningStats: React.FC<MiningStatsProps> = ({ stats, miningRate }) => {
  // Formatiert einen Dezimalwert als Prozentsatz
  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined) return '100%';
    return `${(value * 100).toFixed(0)}%`;
  };

  const statItems = [
    {
      label: 'Gesamte Tokens verdient',
      value: `${stats.total_tokens_earned.toFixed(2)} BSN`,
    },
    {
      label: 'Heutige Belohnungen',
      value: `${stats.daily_tokens_earned.toFixed(2)} BSN`,
    },
    {
      label: 'Mining-Rate',
      value: `${miningRate.toFixed(2)} BSN/h`,
    },
    {
      label: 'Aktivitätspunkte',
      value: formatNumber(stats.total_points),
    },
    {
      label: 'Heutige Punkte',
      value: formatNumber(stats.daily_points),
    },
    {
      label: 'Effizienz',
      value: formatPercentage(stats.efficiency_multiplier),
    },
  ];

  return (
    <Card className="bg-dark-100 border-gray-800">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {statItems.map((item, index) => (
            <div key={index} className="bg-dark-200 p-4 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">{item.label}</div>
              <div className="text-lg font-semibold">{item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningStats;
