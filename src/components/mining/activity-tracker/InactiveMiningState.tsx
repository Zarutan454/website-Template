
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InactiveMiningStateProps {
  errorMessage: string | null;
}

const InactiveMiningState: React.FC<InactiveMiningStateProps> = ({ errorMessage }) => {
  return (
    <div className="bg-dark-200 rounded-lg p-4 flex items-center">
      <AlertCircle className="h-5 w-5 text-gray-400 mr-2" />
      <p className="text-gray-400 text-sm">
        {errorMessage || 'Mining ist derzeit inaktiv. Starte das Mining, um BSN-Token zu verdienen.'}
      </p>
    </div>
  );
};

export default InactiveMiningState;
