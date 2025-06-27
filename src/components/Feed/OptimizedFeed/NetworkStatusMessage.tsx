
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface NetworkStatusMessageProps {
  status: 'online' | 'offline' | 'reconnecting';
  onRetry?: () => void;
}

/**
 * Netzwerkstatus-Nachrichtenkomponente
 * - Zeigt verschiedene Nachrichten basierend auf dem Verbindungsstatus
 * - Animierte Statusübergänge
 * - Wiederverbindungs-Button
 */
const NetworkStatusMessage: React.FC<NetworkStatusMessageProps> = ({ 
  status, 
  onRetry 
}) => {
  // Konfiguration basierend auf dem Status
  const getConfig = () => {
    switch (status) {
      case 'offline':
        return {
          icon: <WifiOff className="h-4 w-4" />,
          title: "Keine Internetverbindung",
          description: "Es scheint, dass deine Internetverbindung unterbrochen wurde. Bitte überprüfe deine Verbindung und versuche es erneut.",
          variant: "destructive" as const,
          buttonText: "Erneut versuchen"
        };
      case 'reconnecting':
        return {
          icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          title: "Verbindung wird wiederhergestellt",
          description: "Die Verbindung wird gerade wiederhergestellt. Bitte warte einen Moment...",
          variant: "default" as const,
          buttonText: "Aktualisieren"
        };
      default:
        return {
          icon: <Wifi className="h-4 w-4" />,
          title: "Du bist online",
          description: "Die Internetverbindung wurde wiederhergestellt. Du kannst den Feed jetzt aktualisieren.",
          variant: "default" as const,
          buttonText: "Aktualisieren"
        };
    }
  };
  
  const { icon, title, description, variant, buttonText } = getConfig();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-6"
    >
      <Alert variant={variant} className="border">
        {icon}
        <AlertTitle className="font-medium mb-2">{title}</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{description}</p>
          
          {onRetry && (
            <div className="pt-2">
              <Button 
                variant={status === 'offline' ? "outline" : "default"} 
                size="sm" 
                onClick={onRetry}
                disabled={status === 'reconnecting'}
                className="flex items-center gap-2"
              >
                {status === 'reconnecting' && <RefreshCw className="h-3 w-3 animate-spin" />}
                {buttonText}
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default NetworkStatusMessage;
