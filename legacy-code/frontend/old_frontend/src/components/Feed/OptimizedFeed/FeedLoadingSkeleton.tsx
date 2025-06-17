
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface FeedLoadingSkeletonProps {
  count?: number;
  darkMode?: boolean;
}

/**
 * Optimiertes Lade-Skeleton für Feed-Beiträge
 * - Animiert für bessere UX
 * - Variabel in der Anzahl
 * - Anpassbar an Dark/Light Mode
 */
const FeedLoadingSkeleton: React.FC<FeedLoadingSkeletonProps> = ({
  count = 3,
  darkMode = false
}) => {
  const skeletons = Array.from({ length: count }, (_, i) => i);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
      role="status"
      aria-label="Lädt Beiträge"
    >
      {skeletons.map((_, index) => (
        <div 
          key={index} 
          className={`p-4 border rounded-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-1/6" />
            </div>
          </div>
          
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          
          {index % 2 === 0 && (
            <Skeleton className="h-48 w-full rounded-md mb-4" />
          )}
          
          <div className="flex justify-between pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      ))}
    </motion.div>
  );
};

export default FeedLoadingSkeleton;
