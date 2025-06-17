
import React from 'react';
import { Loader2 } from 'lucide-react';

interface MiningStartFeedbackProps {
  isStarting: boolean;
}

const MiningStartFeedback: React.FC<MiningStartFeedbackProps> = ({ isStarting }) => {
  if (!isStarting) return null;
  
  return (
    <div className="flex items-center bg-primary-900/20 border border-primary-900/30 rounded-md p-2 my-2">
      <Loader2 className="h-4 w-4 text-primary animate-spin mr-2" />
      <p className="text-primary-50 text-sm">Verbinde Mining-System...</p>
    </div>
  );
};

export default MiningStartFeedback;
