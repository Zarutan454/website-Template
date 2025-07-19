
import * as React from 'react';
import { AlertTriangle } from 'lucide-react';

export const ErrorDisplay: React.FC<{
  message: string;
  onRetry?: () => void;
  retryText?: string;
}> = ({ message, onRetry, retryText = "Erneut versuchen" }) => {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 my-2">
      <div className="flex items-start">
        <AlertTriangle size={20} className="text-red-400 mr-3 flex-shrink-0" />
        <div>
          <p className="text-red-400 mb-2">{message}</p>
          {onRetry && (
            <button 
              className="text-red-400 hover:text-red-300 transition-colors underline text-sm"
              onClick={onRetry}
            >
              {retryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
