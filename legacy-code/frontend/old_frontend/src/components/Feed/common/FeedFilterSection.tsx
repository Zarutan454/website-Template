
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TooltipProvider } from "@/components/ui/tooltip";

interface FeedFilterSectionProps {
  showFilters: boolean;
  selectedFilter: string | null;
  handleFilterSelect: (filter: string | null) => void;
  feedType?: string;
}

/**
 * Optimierte Filter-Sektion für den Feed mit animierten Übergängen
 * Zeigt Filter-Optionen basierend auf dem aktuellen Feed-Typ an
 */
const FeedFilterSection: React.FC<FeedFilterSectionProps> = ({
  showFilters,
  selectedFilter,
  handleFilterSelect,
  feedType = 'recent'
}) => {
  // Standard-Filter für alle Feed-Typen
  const commonFilters = [
    { id: 'Neueste', label: 'Neueste' },
    { id: 'Beliebt', label: 'Beliebt' },
    { id: 'Alle', label: 'Alle zeigen' }
  ];
  
  // Feed-Typ-spezifische Filter
  const feedTypeFilters = {
    'tokens': [{ id: 'Tokens', label: 'Nur Tokens' }],
    'nfts': [{ id: 'NFTs', label: 'Nur NFTs' }],
    'recent': [],
    'popular': [],
    'following': [{ id: 'Folge ich', label: 'Folge ich' }],
    'foryou': [{ id: 'Für dich', label: 'Für dich personalisiert' }]
  };
  
  // Kombinierte Filter basierend auf Feed-Typ
  const filters = [
    ...commonFilters,
    ...(feedTypeFilters[feedType as keyof typeof feedTypeFilters] || [])
  ];

  return (
    <TooltipProvider>
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
                    key={filter.id}
                    variant={selectedFilter === filter.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterSelect(filter.id)}
                    className="rounded-full"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
};

export default FeedFilterSection;
