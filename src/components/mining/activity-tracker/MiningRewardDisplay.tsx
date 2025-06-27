
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, TrendingUp, Activity } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface MiningRewardDisplayProps {
  totalTokens: number;
  dailyTokens: number;
  efficiency: number;
  miningRate: number;
  dailyGoal?: number;
  comboMultiplier?: number;
}

const MiningRewardDisplay: React.FC<MiningRewardDisplayProps> = ({
  totalTokens,
  dailyTokens,
  efficiency,
  miningRate,
  dailyGoal = 10,
  comboMultiplier = 1
}) => {
  // Berechne den Fortschritt zum täglichen Ziel (maximal 100%)
  const dailyProgress = Math.min(100, (dailyTokens / dailyGoal) * 100);
  
  // Berechne die voraussichtliche stündliche Rate basierend auf der aktuellen Mining-Rate
  const hourlyRate = miningRate * 60;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gesamt BSN Token</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Coins className="w-4 h-4 mr-2 text-primary" />
              <span className="text-2xl font-bold">{formatNumber(totalTokens)}</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mining Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              <span className="text-2xl font-bold">{hourlyRate.toFixed(2)}</span>
              <span className="text-xs ml-1 self-end mb-1 text-muted-foreground">BSN/h</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Effizienz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary" />
              <span className="text-2xl font-bold">{efficiency}%</span>
              {comboMultiplier > 1 && (
                <span className="text-xs ml-2 text-green-500">×{comboMultiplier.toFixed(1)}</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium text-muted-foreground">Täglicher Fortschritt</CardTitle>
            <span className="text-xs text-muted-foreground">
              {dailyTokens.toFixed(2)} / {dailyGoal} BSN
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={dailyProgress} className="h-2" />
          <p className="text-xs mt-2 text-muted-foreground">
            {dailyProgress >= 100 
              ? "Tägliches Ziel erreicht! Weiter so!" 
              : `${(100 - dailyProgress).toFixed(0)}% bis zum täglichen Ziel`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MiningRewardDisplay;
