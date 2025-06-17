
import React from 'react';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  isMining: boolean;
  onMiningToggle: () => void;
  showToggle?: boolean;
  title?: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  isMining, 
  onMiningToggle,
  showToggle = true,
  title = "Mining Dashboard",
  subtitle = "Verfolge deine Mining-Aktivitäten und Belohnungen"
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white mr-4">
          <Zap size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-gray-400">{subtitle}</p>
        </div>
      </div>
      {showToggle && (
        <Button 
          size="sm"
          variant={isMining ? "destructive" : "default"}
          className="flex items-center gap-2"
          onClick={onMiningToggle}
        >
          <Zap size={16} />
          {isMining ? "Mining stoppen" : "Mining starten"}
        </Button>
      )}
    </div>
  );
};

export default DashboardHeader;
