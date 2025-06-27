
import React from 'react';
import { TokenLock } from '@/hooks/useTokenLocking';
import TokenLockItem from './TokenLockItem';
import EmptyLockState from './EmptyLockState';
import LocksLoadingState from './LocksLoadingState';
import { AnimatePresence, motion } from 'framer-motion';

interface TokenLocksListProps {
  locks: TokenLock[];
  isLoading: boolean;
}

export const TokenLocksList: React.FC<TokenLocksListProps> = ({ locks, isLoading }) => {
  if (isLoading) {
    return <LocksLoadingState />;
  }

  if (locks.length === 0) {
    return <EmptyLockState type="token" />;
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
            <TokenLockItem lock={lock} />
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default TokenLocksList;
