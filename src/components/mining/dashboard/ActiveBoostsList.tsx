import React from 'react';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { MiningBoost } from '@/hooks/mining/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ActiveBoostsListProps {
  boosts: MiningBoost[];
  isLoading: boolean;
}

const ActiveBoostsList: React.FC<ActiveBoostsListProps> = ({ boosts, isLoading }) => {
  const { t } = useTranslation();

  const getRemainingTime = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };
  
  if (isLoading) {
    return (
        <Card className="bg-gray-800 bg-opacity-50 border-gray-700">
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="bg-gray-800 bg-opacity-50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">{t('mining.boosts.active')}</CardTitle>
      </CardHeader>
      <CardContent>
        {boosts.length === 0 ? (
          <p className="text-gray-400 text-sm">{t('mining.boosts.noActive')}</p>
        ) : (
          <ul className="space-y-3">
            {boosts.map((boost) => (
              <li key={boost.id} className="flex items-center justify-between p-2 bg-gray-700 bg-opacity-50 rounded-md">
                <div>
                    <Badge variant="secondary" className="capitalize mb-1">{boost.boost_type}</Badge>
                    <p className="text-sm text-gray-300">{getRemainingTime(boost.expires_at)}</p>
                </div>
                <div className="text-lg font-bold text-green-400">
                  +{parseFloat(boost.multiplier).toFixed(1)}x
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default ActiveBoostsList; 