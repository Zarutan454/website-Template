import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface Boost {
  boost_type: string;
  multiplier: number;
  expires_at: string;
}

interface ActiveBoostsListProps {
  boosts: Boost[];
}

const getBoostDisplayName = (boostType: string): string => {
  const names: { [key: string]: string } = {
    like: 'Like Boost',
    comment: 'Comment Boost',
    post: 'Post Boost',
    share: 'Share Boost',
    login: 'Daily Login',
    referral: 'Referral'
  };
  return names[boostType] || boostType.charAt(0).toUpperCase() + boostType.slice(1);
};

const calculateRemainingTime = (expiresAt: string) => {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  return Math.max(0, diff);
};

const BoostItem: React.FC<{ boost: Boost }> = ({ boost }) => {
  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime(boost.expires_at));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime(boost.expires_at));
    }, 1000);

    return () => clearInterval(timer);
  }, [boost.expires_at]);

  if (remainingTime <= 0) {
    return null;
  }

  const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
  const seconds = Math.floor((remainingTime / 1000) % 60);

  return (
    <div className="flex justify-between items-center p-2 bg-secondary/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Flame className="w-5 h-5 text-orange-400" />
        <span className="font-semibold">{getBoostDisplayName(boost.boost_type)}</span>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="destructive">+{((boost.multiplier - 1) * 100).toFixed(0)}%</Badge>
        <span className="text-sm text-muted-foreground font-mono">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

const ActiveBoostsList: React.FC<ActiveBoostsListProps> = ({ boosts }) => {
  if (!boosts || boosts.length === 0) {
    return null;
  }

  const activeBoosts = boosts.filter(b => calculateRemainingTime(b.expires_at) > 0);

  if (activeBoosts.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Active Boosts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activeBoosts.map((boost, index) => (
            <BoostItem key={index} boost={boost} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveBoostsList; 