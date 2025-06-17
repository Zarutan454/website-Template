
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { useTheme } from '@/components/ThemeProvider';

interface PostFiltersProps {
  showFilters: boolean;
  selectedFilter: string | null;
  handleFilterSelect: (filter: string | null) => void;
}

const PostFilters: React.FC<PostFiltersProps> = ({ 
  showFilters, 
  selectedFilter, 
  handleFilterSelect 
}) => {
  const { theme } = useTheme();

  return (
    <AnimatePresence mode="wait">
      {showFilters && (
        <motion.div 
          key="filters-container"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 data-[theme=dark]:bg-dark-100/80 data-[theme=light]:bg-white/80 backdrop-blur-md rounded-lg data-[theme=dark]:border-gray-800/80 data-[theme=light]:border-gray-300/80 mb-4 overflow-hidden shadow-lg"
          data-theme={theme}
        >
          <h3 className="text-lg font-semibold data-[theme=dark]:text-white data-[theme=light]:text-gray-800 mb-2 flex items-center">
            <Filter size={16} className="mr-2 text-primary" />
            Filter
          </h3>
          <div className="flex flex-wrap gap-2">
            {['Neueste', 'Beliebt', 'Trending', 'Meine Follows'].map(filter => (
              <Button
                key={`filter-${filter}`}
                variant={selectedFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => handleFilterSelect(filter)}
                className={selectedFilter === filter 
                  ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 border-none transition-all duration-300 shadow-md text-white" 
                  : "data-[theme=dark]:bg-dark-200/90 data-[theme=light]:bg-gray-100/90 data-[theme=dark]:border-gray-700 data-[theme=light]:border-gray-300 hover:border-primary/50 data-[theme=dark]:hover:bg-dark-200 data-[theme=light]:hover:bg-gray-200 data-[theme=dark]:text-white data-[theme=light]:text-gray-700 transition-all duration-300"
                }
                data-theme={theme}
              >
                {filter}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterSelect(null)}
              className="data-[theme=dark]:text-gray-400 data-[theme=light]:text-gray-600 data-[theme=dark]:hover:text-white data-[theme=light]:hover:text-gray-800"
              data-theme={theme}
            >
              Zurücksetzen
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PostFilters;
