
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bell } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface NewPostsNotificationProps {
  show: boolean;
  onRefresh: () => void;
  count?: number;
  type?: 'new' | 'update' | 'alert';
}

/**
 * Fortschrittliche Benachrichtigungskomponente für neue Beiträge mit kontextabhängigen
 * Audio-Hinweisen, verbesserten visuellen Effekten und erweiterter Barrierefreiheit
 */
const NewPostsNotification: React.FC<NewPostsNotificationProps> = ({
  show,
  onRefresh,
  count,
  type = 'new'
}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Kontextbezogenes Audio-Feedback mit verbesserten Sounds
  useEffect(() => {
    // Audio-Element nur einmal erstellen
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = 0.4;
    }
    
    // Unterschiedliche Sounds basierend auf dem Benachrichtigungstyp und Theme
    if (show && !hasPlayedRef.current) {
      // Sound-URL basierend auf dem Benachrichtigungstyp wählen
      let soundUrl = '';
      
      if (type === 'alert') {
        // Wichtige Benachrichtigungen
        soundUrl = isDarkMode ? 
          '/sounds/notification-important-dark.mp3' : 
          '/sounds/notification-important-light.mp3';
      } else if (type === 'update') {
        // Updates und Änderungen
        soundUrl = isDarkMode ? 
          '/sounds/notification-update-dark.mp3' : 
          '/sounds/notification-update-light.mp3';
      } else {
        // Standard-Benachrichtigungen (neue Beiträge)
        soundUrl = isDarkMode ? 
          '/sounds/notification-subtle.mp3' : 
          '/sounds/notification-light.mp3';
      }
      
      if (audioRef.current) {
        audioRef.current.src = soundUrl;
        audioRef.current.play().catch(() => {
        });
        
        hasPlayedRef.current = true;
        
        // Flag nach 10 Sekunden zurücksetzen, um zukünftige Sounds zu ermöglichen
        setTimeout(() => {
          hasPlayedRef.current = false;
        }, 10000);
      }
    }
    
    // Bereinigung
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [show, isDarkMode, type]);

  // Verbesserte Refresh-Funktion mit präziserem visuellen Feedback
  const handleRefresh = () => {
    if (isRefreshing) return; // Verhindere mehrfache Klicks
    
    setIsRefreshing(true);
    onRefresh();
    
    // Taktiles Feedback, falls vom Gerät unterstützt
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    // Nach einer kurzen Verzögerung den Refresh-Status zurücksetzen
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Festlegen der Anzeigeklassen basierend auf dem Benachrichtigungstyp
  const getNotificationClasses = () => {
    const baseClasses = "p-2 text-center rounded-md mb-4 shadow-lg backdrop-blur-sm relative overflow-hidden border";
    
    switch (type) {
      case 'alert':
        return `${baseClasses} bg-red-500/90 text-white dark:bg-red-700 border-red-400/20 dark:border-red-600/30`;
      case 'update':
        return `${baseClasses} bg-blue-500/90 text-white dark:bg-blue-700 border-blue-400/20 dark:border-blue-600/30`;
      default: // 'new'
        return `${baseClasses} bg-primary/90 text-primary-foreground dark:bg-primary-900 dark:text-primary-100 border-primary/20 dark:border-primary-800/30`;
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={getNotificationClasses()}
          role="alert"
          aria-live="polite"
        >
          {/* Hintergrund-Gradient-Effekt mit verbesserter Animation */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
            animate={{ 
              x: ['-100%', '100%'], 
              opacity: [0.2, 0.5, 0.2] 
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3, 
              ease: "linear" 
            }}
          />
          
          {/* Verbesserter Spotlight-Effekt mit dynamischerem Pulsieren */}
          <motion.div 
            className={`absolute inset-0 ${isDarkMode ? 'bg-white/5' : 'bg-white/10'} rounded-md`}
            animate={{ 
              opacity: [0, 0.2, 0],
              scale: [0.85, 1.05, 0.85]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 2, 
              ease: "easeInOut" 
            }}
          />
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full hover:bg-white/10 flex items-center justify-center space-x-2 py-1.5 group 
                      focus:ring-2 focus:ring-white/30 focus:outline-none relative z-10 transition-all duration-300"
            aria-label={`${count ? `${count} neue` : 'Neue'} Beiträge anzeigen`}
          >
            <motion.div
              initial={{ scale: 1 }}
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -5, 5, -5, 0]
              }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                repeatType: "reverse",
                times: [0, 0.2, 0.5, 0.8, 1]
              }}
              className="mr-2"
            >
              <Bell className="h-4 w-4" />
            </motion.div>
            <span className="font-medium">
              {count ? `${count} neue Beiträge verfügbar` : 'Neue Beiträge verfügbar'}
            </span>
            <motion.div
              animate={isRefreshing ? 
                { rotate: 360, transition: { duration: 0.8, ease: "linear", repeat: 1 } } : 
                { rotate: 0 }}
              className={`group-hover:text-primary-foreground ml-1 transition-transform ${isRefreshing ? 'text-white' : ''}`}
            >
              <RefreshCw className="h-4 w-4" />
            </motion.div>
            
            {/* Erweiterte visuelle Rückmeldung beim Aktualisieren */}
            {isRefreshing && (
              <motion.span
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-white/20 rounded-md z-0"
              />
            )}
          </Button>
          
          {/* Verbesserte Unterstützung für Screenreader-Nutzer */}
          <div className="sr-only">
            {count ? `${count} neue Beiträge` : 'Neue Beiträge'} wurden veröffentlicht. 
            Klicken Sie auf die Schaltfläche, um sie anzuzeigen.
            {type === 'alert' ? ' Dies ist eine wichtige Benachrichtigung.' : ''}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewPostsNotification;
