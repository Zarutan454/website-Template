
import * as React from 'react';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GroupsErrorStateProps {
  onRetry?: () => void;
  message?: string;
  error?: Error | null;
  isRetrying?: boolean;
}

const GroupsErrorState: React.FC<GroupsErrorStateProps> = ({ 
  onRetry,
  message = "Es ist ein Fehler beim Laden der Gruppen aufgetreten.",
  error,
  isRetrying = false
}) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [lastRetryTime, setLastRetryTime] = React.useState<Date | null>(null);

  const handleRetry = React.useCallback(() => {
    if (onRetry) {
      setRetryCount(prev => prev + 1);
      setLastRetryTime(new Date());
      onRetry();
    }
  }, [onRetry]);

  // Auto-retry after 30 seconds if retry count is low
  React.useEffect(() => {
    if (retryCount < 3 && onRetry) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [retryCount, handleRetry, onRetry]);

  const getErrorMessage = () => {
    if (error?.message) {
      return error.message;
    }
    return message;
  };

  const getErrorType = () => {
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      return 'network';
    }
    if (error?.message?.includes('unauthorized') || error?.message?.includes('403')) {
      return 'auth';
    }
    return 'general';
  };

  const errorType = getErrorType();

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          {errorType === 'network' ? (
            <WifiOff className="h-12 w-12 text-red-500" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-red-500" />
          )}
        </div>
        <CardTitle className="text-lg font-semibold">
          {errorType === 'network' && 'Verbindungsfehler'}
          {errorType === 'auth' && 'Zugriff verweigert'}
          {errorType === 'general' && 'Fehler beim Laden'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          {getErrorMessage()}
        </p>
        
        {retryCount > 0 && (
          <p className="text-sm text-muted-foreground">
            Versuch {retryCount} von 3
            {lastRetryTime && (
              <span className="block text-xs">
                Letzter Versuch: {lastRetryTime.toLocaleTimeString()}
              </span>
            )}
          </p>
        )}

        {retryCount >= 3 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Mehrere Versuche fehlgeschlagen. Bitte überprüfe deine Internetverbindung oder versuche es später erneut.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-2">
          {onRetry && retryCount < 3 && (
            <Button 
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRetrying ? 'Versuche...' : 'Erneut versuchen'}
            </Button>
          )}
          
          <Button 
            onClick={() => window.location.reload()}
            variant="default"
          >
            Seite neu laden
          </Button>
        </div>

        {errorType === 'network' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Netzwerk-Tipps:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Überprüfe deine Internetverbindung</li>
              <li>• Versuche es in einigen Minuten erneut</li>
              <li>• Kontaktiere den Support bei anhaltenden Problemen</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupsErrorState;
