
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';
import { TabsContent } from "@/components/ui/tabs";

interface FeedFiltersProps {
  showFilters: boolean;
  selectedFilter: string | null;
  handleFilterSelect: (filter: string | null) => void;
  toggleFilters?: () => void;
}

const FeedFilters: React.FC<FeedFiltersProps> = ({
  showFilters,
  selectedFilter,
  handleFilterSelect,
  toggleFilters
}) => {
  const filters = [
    { id: 'newest', label: 'Neueste', value: 'Neueste' },
    { id: 'popular', label: 'Beliebt', value: 'Beliebt' },
    { id: 'trending', label: 'Trending', value: 'Trending' }
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          {toggleFilters && (
            <button
              onClick={toggleFilters}
              className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Filter size={16} className="mr-1" />
              <span>Filter</span> 
              <span className="text-xs ml-1 text-primary">
                ({selectedFilter || 'Alle'})
              </span>
            </button>
          )}
        </div>
      </div>

      <TabsContent value="filters">
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 mb-4 bg-dark-300/50 rounded-xl border border-dark-50"
            >
              <h3 className="text-sm font-medium text-white mb-3">Sortieren nach</h3>
              <div className="grid grid-cols-3 gap-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleFilterSelect(filter.value)}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedFilter === filter.value
                        ? 'bg-primary text-white'
                        : 'bg-dark-200 text-gray-400 hover:bg-dark-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </TabsContent>
    </div>
  );
};

export default FeedFilters;
