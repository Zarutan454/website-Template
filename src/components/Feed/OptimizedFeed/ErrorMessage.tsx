
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ErrorMessageProps {
  error: Error | null;
  onRetry?: () => void;
  title?: string;
  retryText?: string;
}

/**
 * Verbesserte Fehlerkomponente für Feed-Fehler
 * - Animierte Darstellung für bessere UX
 * - Aussagekräftige Fehlermeldungen
 * - Wiederholungsoption
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry, 
  title = "Ein Fehler ist aufgetreten", 
  retryText = "Erneut versuchen" 
}) => {
  if (!error) return null;
  
  // Benutzerfreundliche Fehlermeldung basierend auf dem Fehlertyp
  const getErrorMessage = () => {
    if (error.message === "User not authenticated") {
      return "Bitte melde dich an, um Beiträge zu sehen";
    }
    
    if (error.message.includes("Network") || error.message.includes("fetch")) {
      return "Es besteht ein Netzwerkproblem. Bitte überprüfe deine Internetverbindung";
    }
    
    if (error.message.includes("permission") || error.message.includes("403")) {
      return "Du hast keine Berechtigung, diese Inhalte anzusehen";
    }
    
    return error.message || "Beim Laden der Beiträge ist ein unbekannter Fehler aufgetreten";
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="my-6"
    >
      <Alert variant="destructive" className="border-red-300 dark:border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="mb-2">{title}</AlertTitle>
        <AlertDescription className="space-y-4">
          <p>{getErrorMessage()}</p>
          
          {onRetry && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onRetry}
                className="flex items-center gap-2"
              >
                <RefreshCcw className="h-4 w-4" />
                {retryText}
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </motion.div>
  );
};

export default ErrorMessage;
