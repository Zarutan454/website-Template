
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Activity, Award, BarChart2, Hammer } from 'lucide-react';

interface MiningProfileStatsProps {
  miningStats: any;
}

const MiningProfileStats: React.FC<MiningProfileStatsProps> = ({ miningStats }) => {
  const navigate = useNavigate();
  
  // Mapping von Backend-Eigenschaften
  const normalizedStats = {
    totalPoints: miningStats.total_points || 0,
    totalTokensEarned: miningStats.total_tokens_earned || 0,
    dailyPoints: miningStats.daily_points || 0,
    dailyTokensEarned: miningStats.daily_tokens_earned || 0,
    isMining: miningStats.is_mining || false,
    miningRate: miningStats.mining_rate || 0.1,
    streakDays: miningStats.streak_days || 0,
    efficiencyMultiplier: miningStats.efficiency_multiplier || 1
  };
  
  // Maximales tägliches Ziel für Token (10 pro Tag)
  const dailyTokenGoal = 10;
  const dailyProgress = Math.min(100, (normalizedStats.dailyTokensEarned / dailyTokenGoal) * 100);
  
  // Effizienz in Prozent darstellen
  const efficiencyPercentage = Math.round(normalizedStats.efficiencyMultiplier * 100);
  
  return (
    <Card className="border-gray-800">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-medium flex items-center">
              <Hammer className="h-4 w-4 mr-2 text-primary" />
              Mining Status
            </h3>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/mining')}
            >
              Dashboard öffnen
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className={`font-medium flex items-center ${normalizedStats.isMining ? 'text-green-500' : 'text-gray-400'}`}>
                {normalizedStats.isMining ? 'Aktiv' : 'Inaktiv'}
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="font-medium">{(normalizedStats.miningRate * 60).toFixed(2)}/h</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Streak</span>
              <span className="font-medium flex items-center">
                <Award className="h-3 w-3 mr-1 text-amber-500" />
                {normalizedStats.streakDays} Tage
              </span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Effizienz</span>
              <span className="font-medium flex items-center">
                <Activity className="h-3 w-3 mr-1 text-primary" />
                {efficiencyPercentage}%
              </span>
            </div>
          </div>
          
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Heutiger Fortschritt</span>
              <span className="font-medium">
                {normalizedStats.dailyTokensEarned.toFixed(2)}/{dailyTokenGoal} Tokens
              </span>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Progress value={dailyProgress} className="h-2" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>{dailyProgress.toFixed(1)}% des täglichen Ziels erreicht</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex justify-between text-sm pt-2">
            <span className="text-muted-foreground">Insgesamt verdient:</span>
            <span className="font-medium">{normalizedStats.totalTokensEarned.toFixed(2)} BSN</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningProfileStats;
