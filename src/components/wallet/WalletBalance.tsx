
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';

const WalletBalance = () => {
  return (
    <Card className="bg-gradient-to-br from-primary-900/20 to-primary-800/10 border-primary-800/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Wallet className="h-5 w-5 mr-2" />
          Wallet Übersicht
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-dark-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">BSN Token</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">1,246.85</div>
            <div className="flex justify-between mt-1">
              <div className="text-xs text-muted-foreground">≈ $124.68</div>
              <div className="text-xs text-green-500 flex items-center">
                +2.4% <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
          
          <div className="bg-dark-200 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground">Ethereum</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">0.145 ETH</div>
            <div className="flex justify-between mt-1">
              <div className="text-xs text-muted-foreground">≈ $275.50</div>
              <div className="text-xs text-green-500 flex items-center">
                +1.2% <ArrowUpRight className="h-3 w-3 ml-1" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-4 bg-dark-200 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <div className="text-sm text-muted-foreground">Gesamtbalance</div>
          </div>
          <div className="text-3xl font-bold">$400.18</div>
          <div className="flex justify-between mt-1">
            <div className="text-xs text-muted-foreground">2 Assets</div>
            <div className="text-xs text-green-500 flex items-center">
              +1.8% <ArrowUpRight className="h-3 w-3 ml-1" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WalletBalance;
