
import * as React from 'react';
import { useAuth } from '@/context/AuthContext.utils';
import { useMining } from '@/hooks/useMining';
import { useTheme } from '@/components/ThemeProvider.utils';
import MiningDashboard from './MiningDashboard';
import FloatingMiningButton from './FloatingMiningButton';

const IntegratedMiningDashboard: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl" data-theme={theme}>
      <div className="pb-20"> {/* Added padding to bottom for floating button */}
        <h1 className="text-3xl font-bold mb-6">BSN Mining</h1>
        <p className="text-muted-foreground mb-8">
          Erhalte BSN Token als Belohnung für deine Aktivitäten im Netzwerk. Diese Token kannst du für das Erstellen eigener Kryptowährungen und andere Funktionen verwenden.
        </p>
        
        <MiningDashboard />
      </div>
      
      <FloatingMiningButton />
    </div>
  );
};

export default IntegratedMiningDashboard;
