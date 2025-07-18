
import React from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

export type ErrorType = 'network' | 'auth' | 'permission' | 'notFound' | 'unknown';

interface ErrorConfig {
  message: string;
  action?: () => void;
  actionText?: string;
}

export const errorMessages: Record<ErrorType, ErrorConfig> = {
  network: {
    message: 'Netzwerkfehler. Bitte überprüfe deine Internetverbindung.',
    action: () => window.location.reload(),
    actionText: 'Erneut versuchen'
  },
  auth: {
    message: 'Du musst angemeldet sein, um diese Aktion durchzuführen.',
    actionText: 'Anmelden'
  },
  permission: {
    message: 'Du hast keine Berechtigung für diese Aktion.',
  },
  notFound: {
    message: 'Die angeforderte Ressource wurde nicht gefunden.',
  },
  unknown: {
    message: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.',
  }
};

export const handleError = (error: unknown, type: ErrorType = 'unknown') => {
  // Log error only in development
  if (import.meta.env.DEV) {
    console.error('Fehler aufgetreten:', error);
  }
  
  const errorConfig = errorMessages[type];
  
  toast.error(errorConfig.message, {
    action: errorConfig.action && errorConfig.actionText ? {
      label: errorConfig.actionText,
      onClick: errorConfig.action
    } : undefined
  });
  
  return errorConfig.message;
};

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
