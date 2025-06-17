
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Zap, Clock } from 'lucide-react';

function formatGasPrice(price: number | bigint): string {
  // Konvertiere bigint zu number für die Formatierung, wenn nötig
  const priceNumber = typeof price === 'bigint' ? Number(price) : price;
  return priceNumber.toFixed(0);
}

const GasPriceWidget: React.FC = () => {
  const [gasPrices, setGasPrices] = React.useState({
    slow: 25,
    average: 35,
    fast: 50
  });
  
  const [selectedSpeed, setSelectedSpeed] = React.useState('average');
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Aktuelle Gas-Preise</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <div 
            className={`p-3 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              selectedSpeed === 'slow' 
                ? 'bg-blue-500/20 border border-blue-500/50' 
                : 'bg-dark-200 hover:bg-dark-300'
            }`}
            onClick={() => setSelectedSpeed('slow')}
          >
            <Clock className="h-5 w-5 mb-1 text-blue-400" />
            <span className="text-xs font-medium">Langsam</span>
            <span className="text-sm mt-1 font-bold">
              {formatGasPrice(gasPrices.slow)} Gwei
            </span>
          </div>
          
          <div 
            className={`p-3 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              selectedSpeed === 'average' 
                ? 'bg-green-500/20 border border-green-500/50' 
                : 'bg-dark-200 hover:bg-dark-300'
            }`}
            onClick={() => setSelectedSpeed('average')}
          >
            <Zap className="h-5 w-5 mb-1 text-green-400" />
            <span className="text-xs font-medium">Normal</span>
            <span className="text-sm mt-1 font-bold">
              {formatGasPrice(gasPrices.average)} Gwei
            </span>
          </div>
          
          <div 
            className={`p-3 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              selectedSpeed === 'fast' 
                ? 'bg-amber-500/20 border border-amber-500/50' 
                : 'bg-dark-200 hover:bg-dark-300'
            }`}
            onClick={() => setSelectedSpeed('fast')}
          >
            <Flame className="h-5 w-5 mb-1 text-amber-400" />
            <span className="text-xs font-medium">Schnell</span>
            <span className="text-sm mt-1 font-bold">
              {formatGasPrice(gasPrices.fast)} Gwei
            </span>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
          <span>Ethereum Network</span>
          <Badge variant="outline" className="text-xs">
            Sepolia Testnet
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default GasPriceWidget;
