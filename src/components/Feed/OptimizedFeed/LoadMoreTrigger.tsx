
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadMoreTriggerProps {
  hasMore: boolean;
  isLoading: boolean;
  postsCount: number;
  onLoadMore: () => void;
  loadMoreRef: (node: Element | null) => void;
  showMinimalVersion?: boolean;
}

/**
 * Optimierte Komponente, die als Trigger für das Laden weiterer Posts dient
 * - Zeigt Ladeanzeige oder "Keine weiteren Beiträge" basierend auf Status
 * - Unterstützt IntersectionObserver-Referenz für Infinite Scrolling
 * - Bietet manuellen "Mehr laden" Button als Fallback
 * - Unterstützt eine minimale Version für mobile Geräte
 */
const LoadMoreTrigger: React.FC<LoadMoreTriggerProps> = ({
  hasMore,
  isLoading,
  postsCount,
  onLoadMore,
  loadMoreRef,
  showMinimalVersion = false
}) => {
  const [hasClicked, setHasClicked] = useState(false);
  
  // Reset hasClicked when loading is completed
  useEffect(() => {
    if (!isLoading && hasClicked) {
      setHasClicked(false);
    }
  }, [isLoading, hasClicked]);

  // Wenn keine Beiträge vorhanden sind, nichts rendern
  if (postsCount === 0) {
    return null;
  }

  // Handler für Button-Klick
  const handleClick = () => {
    setHasClicked(true);
    onLoadMore();
  };

  // Minimale Version für mobile Geräte
  if (showMinimalVersion) {
    return (
      <div 
        ref={loadMoreRef} 
        className="py-4 flex flex-col items-center justify-center"
        aria-live="polite"
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </motion.div>
          ) : hasMore ? (
            <motion.div
              key="more"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button 
                variant="ghost" 
                onClick={handleClick}
                size="sm"
                disabled={hasClicked}
                className="min-w-[120px]"
              >
                {hasClicked ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Mehr laden"
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="end"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-xs text-muted-foreground"
            >
              Ende erreicht
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Standardversion
  return (
    <div 
      ref={loadMoreRef} 
      className="py-8 flex flex-col items-center justify-center"
      aria-live="polite"
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-2"
          >
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Lade weitere Beiträge</span>
          </motion.div>
        ) : hasMore ? (
          <motion.div
            key="more"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Button 
              variant="outline" 
              onClick={handleClick}
              className="min-w-[180px]"
              disabled={hasClicked}
            >
              {hasClicked ? (
                <span className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Lädt...
                </span>
              ) : (
                "Mehr laden"
              )}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Oder scrolle für automatisches Laden
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              Keine weiteren Beiträge
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Export als memoisierten Komponente für bessere Performance
export default React.memo(LoadMoreTrigger);
