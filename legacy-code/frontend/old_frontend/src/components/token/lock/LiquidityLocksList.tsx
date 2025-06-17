
import React from 'react';
import { LiquidityLock } from '@/hooks/useTokenLocking';
import LiquidityLockItem from './LiquidityLockItem';
import EmptyLockState from './EmptyLockState';
import LocksLoadingState from './LocksLoadingState';
import { AnimatePresence, motion } from 'framer-motion';

interface LiquidityLocksListProps {
  locks: LiquidityLock[];
  isLoading: boolean;
}

export const LiquidityLocksList: React.FC<LiquidityLocksListProps> = ({ locks, isLoading }) => {
  if (isLoading) {
    return <LocksLoadingState />;
  }

  if (locks.length === 0) {
    return <EmptyLockState type="liquidity" />;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {locks.map((lock, index) => (
          <motion.div
            key={lock.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <LiquidityLockItem key={lock.id} lock={lock} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default LiquidityLocksList;
