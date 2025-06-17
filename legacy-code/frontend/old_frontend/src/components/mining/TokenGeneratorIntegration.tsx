
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, PlusCircle, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { MiningStats } from '@/hooks/mining/types';

interface TokenGeneratorIntegrationProps {
  miningStats: MiningStats;
  createdTokens: number;
}

const TokenGeneratorIntegration: React.FC<TokenGeneratorIntegrationProps> = ({ 
  miningStats, 
  createdTokens 
}) => {
  const requiredTokens = 100;
  const progress = Math.min(100, (miningStats.total_tokens_earned / requiredTokens) * 100);
  const hasEnoughTokens = miningStats.total_tokens_earned >= requiredTokens;

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary-900/10 to-secondary-900/10">
        <CardTitle className="flex items-center text-lg">
          <Coins className="h-5 w-5 mr-2 text-primary" />
          Token Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Geminte BSN Token</span>
            <span className="font-medium">{miningStats.total_tokens_earned.toFixed(2)} / {requiredTokens} BSN</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Erstellte Tokens</h4>
              <div className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-1 text-green-500" />
                <span>{createdTokens}</span>
              </div>
            </div>
            
            <div className="flex justify-end items-end">
              <Button 
                variant={hasEnoughTokens ? "default" : "outline"} 
                size="sm"
                className="gap-1"
                disabled={!hasEnoughTokens}
              >
                {hasEnoughTokens ? "Token erstellen" : "Nicht genug BSN"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenGeneratorIntegration;
