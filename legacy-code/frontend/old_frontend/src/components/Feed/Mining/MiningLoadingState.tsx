
import React from 'react';
import { Loader2 } from 'lucide-react';

interface MiningLoadingStateProps {
  message?: string;
}

const MiningLoadingState: React.FC<MiningLoadingStateProps> = ({ 
  message = 'Mining-Daten werden geladen...'
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
};

export default MiningLoadingState;
