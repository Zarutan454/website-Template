
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FeedType } from '@/hooks/feed/useFeedData';
import { UiFilterType } from '@/hooks/feed/useFilterControl';

export interface FeedFilterOptimizedProps {
  showFilters: boolean;
  selectedFilter: UiFilterType | null;
  handleFilterSelect: (filter: UiFilterType | null) => void;
  feedType?: FeedType;
  lastUpdated?: Date;
}

/**
 * Optimierte Filter-Komponente für den Feed mit verbesserten Animationen und Typsicherheit
 */
const FeedFilterOptimized: React.FC<FeedFilterOptimizedProps> = ({
  showFilters,
  selectedFilter,
  handleFilterSelect,
  feedType = 'recent',
  lastUpdated
}) => {
  // Standard-Filter für alle Feed-Typen
  const commonFilters: UiFilterType[] = ['Neueste', 'Beliebt', 'Alle'];
  
  // Feed-Typ-spezifische Filter
  const getTypeSpecificFilters = (): UiFilterType[] => {
    switch (feedType) {
      case 'tokens': return ['Tokens'];
      case 'nfts': return ['NFTs'];
      case 'following': return ['Folge ich'];
      case 'foryou': return ['Für dich'];
      default: return [];
    }
  };
  
  // Kombinierte Filter basierend auf Feed-Typ
  const filters: UiFilterType[] = [...commonFilters, ...getTypeSpecificFilters()];

  // Formatiere das Zeitstempel in ein benutzerfreundliches Format
  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <ScrollArea className="whitespace-nowrap pb-2 mt-2">
            <div className="flex space-x-2 py-1">
              {filters.map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleFilterSelect(filter)}
                  className="rounded-full"
                >
                  {filter}
                </Button>
              ))}
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-muted-foreground mt-2 text-right">
                Zuletzt aktualisiert: {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </ScrollArea>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedFilterOptimized;
