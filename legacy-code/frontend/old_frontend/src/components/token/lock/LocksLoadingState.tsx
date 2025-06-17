
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

interface LocksLoadingStateProps {
  count?: number;
}

export const LocksLoadingState: React.FC<LocksLoadingStateProps> = ({ count = 3 }) => {
  return (
    <>
      {Array(count).fill(0).map((_, i) => (
        <motion.div
          key={`lock-skeleton-${i}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card key={`lock-skeleton-${i}`} className="mb-4">
            <CardContent className="p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <div className="flex justify-end">
                  <Skeleton className="h-8 w-28 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </>
  );
};

export default LocksLoadingState;
