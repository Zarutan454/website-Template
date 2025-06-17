
import React from 'react';
import { TokenLock } from '@/hooks/useTokenLocking';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Lock, Unlock, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { formatTokenAmount } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface TokenLockItemProps {
  lock: TokenLock;
}

export const TokenLockItem: React.FC<TokenLockItemProps> = ({ lock }) => {
  const now = new Date();
  const unlockDate = new Date(lock.unlock_date);
  const lockDate = new Date(lock.lock_date);
  const isLocked = unlockDate > now;
  
  // Berechne den Fortschritt
  const totalLockTime = unlockDate.getTime() - lockDate.getTime();
  const elapsedTime = now.getTime() - lockDate.getTime();
  const progressPercentage = Math.min(100, Math.max(0, (elapsedTime / totalLockTime) * 100));
  
  // Berechne die verbleibende Zeit
  const remainingTime = unlockDate.getTime() - now.getTime();
  const remainingDays = Math.max(0, Math.floor(remainingTime / (1000 * 60 * 60 * 24)));
  const remainingHours = Math.max(0, Math.floor((remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  
  const getRemainingText = () => {
    if (!isLocked) return "Entsperrt";
    if (remainingDays > 0) return `${remainingDays} Tage verbleibend`;
    return `${remainingHours} Stunden verbleibend`;
  };
  
  const getStatusColor = () => {
    if (!isLocked) return "default";
    if (remainingDays > 30) return "secondary";
    if (remainingDays > 7) return "default";
    return "destructive"; // Weniger als 7 Tage - Warnung
  };

  const openBlockExplorer = () => {
    if (!lock.transaction_hash) return;
    
    let explorerUrl = "";
    if (lock.network === "ethereum") {
      explorerUrl = `https://etherscan.io/tx/${lock.transaction_hash}`;
    } else if (lock.network === "bsc") {
      explorerUrl = `https://bscscan.com/tx/${lock.transaction_hash}`;
    } else if (lock.network === "polygon") {
      explorerUrl = `https://polygonscan.com/tx/${lock.transaction_hash}`;
    } else {
      explorerUrl = `https://etherscan.io/tx/${lock.transaction_hash}`;
    }
    
    window.open(explorerUrl, '_blank');
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 to-transparent h-1" />
      <CardContent className="p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{formatTokenAmount(lock.amount)} Tokens gesperrt</h3>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>Gesperrt am: {format(lockDate, 'dd.MM.yyyy')}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getStatusColor()}>
                {isLocked ? (
                  <Lock className="h-3 w-3 mr-1" />
                ) : (
                  <Unlock className="h-3 w-3 mr-1" />
                )}
                {getRemainingText()}
              </Badge>
              
              {lock.transaction_hash && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={openBlockExplorer}
                  className="gap-1.5 text-xs"
                >
                  <ExternalLink className="h-3 w-3" />
                  {lock.network.charAt(0).toUpperCase() + lock.network.slice(1)}
                  -Scan
                </Button>
              )}
            </div>
          </div>
          
          {isLocked && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Gesperrt</span>
                <span>Entsperrt</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{format(lockDate, 'dd.MM.yyyy')}</span>
                <span>{format(unlockDate, 'dd.MM.yyyy')}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>
              Freigabe am: {format(unlockDate, 'dd.MM.yyyy')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenLockItem;
