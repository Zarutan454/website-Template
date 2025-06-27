
import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EfficiencyDisplayProps {
  efficiency: number;
  comboMultiplier: number;
}

const EfficiencyDisplay: React.FC<EfficiencyDisplayProps> = ({ efficiency, comboMultiplier }) => {
  const getEfficiencyBadge = () => {
    if (efficiency >= 90) return { color: "text-green-500", label: "Optimal", icon: <Flame className="h-3 w-3" /> };
    if (efficiency >= 70) return { color: "text-yellow-500", label: "Gut", icon: <TrendingUp className="h-3 w-3" /> };
    return { color: "text-gray-400", label: "Niedrig", icon: <TrendingUp className="h-3 w-3" /> };
  };

  const efficiencyBadge = getEfficiencyBadge();

  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${efficiencyBadge.color} border-current flex items-center gap-1`}>
              {efficiencyBadge.icon} {efficiency}% Effizienz
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="text-xs">Bleibe aktiv, um die Mining-Effizienz zu erhöhen</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {comboMultiplier > 1 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge className="bg-primary-500/20 text-primary-500 border-none">
                {comboMultiplier.toFixed(1)}x Combo
              </Badge>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">Kontinuierliche Aktivität erhöht deinen Multiplikator</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default EfficiencyDisplay;
