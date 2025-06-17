
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatNumber, formatBalance } from '@/wallet/utils/formatters';

interface WalletOverviewProps {
  totalBalance: number;
  mainToken: {
    symbol: string;
    balance: number;
    name: string;
  };
  onSend?: () => void;
  onReceive?: () => void;
  onSwap?: () => void;
  onBuy?: () => void;
}

const WalletOverview: React.FC<WalletOverviewProps> = ({
  totalBalance,
  mainToken,
  onSend,
  onReceive,
  onSwap,
  onBuy
}) => {
  return (
    <Card className="bg-dark-200 border-gray-800">
      <CardContent className="p-0">
        <div className="p-5 space-y-3">
          <div className="text-sm text-gray-400">Gesamtguthaben</div>
          <div className="flex items-baseline space-x-1">
            <div className="text-3xl font-bold">
              ${formatNumber(totalBalance)}
            </div>
          </div>
          
          <div className="pt-1">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">Haupt-Token</div>
              <div className="text-sm text-gray-400">{mainToken.name}</div>
            </div>
            <div className="text-lg font-medium mt-1">
              {formatBalance(mainToken.balance, mainToken.symbol)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center py-3 h-auto rounded-none hover:bg-dark-300"
            onClick={onSend}
          >
            <ArrowUpRight className="h-5 w-5 mb-1" />
            <span className="text-xs">Senden</span>
          </Button>
          
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center py-3 h-auto rounded-none hover:bg-dark-300"
            onClick={onReceive}
          >
            <ArrowDownLeft className="h-5 w-5 mb-1" />
            <span className="text-xs">Empfangen</span>
          </Button>
          
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center py-3 h-auto rounded-none hover:bg-dark-300"
            onClick={onSwap}
          >
            <ArrowLeftRight className="h-5 w-5 mb-1" />
            <span className="text-xs">Tauschen</span>
          </Button>
          
          <Button
            variant="ghost"
            className="flex flex-col items-center justify-center py-3 h-auto rounded-none hover:bg-dark-300"
            onClick={onBuy}
          >
            <Plus className="h-5 w-5 mb-1" />
            <span className="text-xs">Kaufen</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletOverview;
