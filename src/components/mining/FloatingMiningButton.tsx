import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gem, X, Zap, ArrowRight, Hourglass } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMining } from '@/hooks/mining/useMining';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLiveTokenCounter } from '@/hooks/mining/useLiveTokenCounter';
import { useAuth } from '@/context/AuthContext.utils';

const FloatingMiningButton: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const { isMining, miningStats } = useMining();
  const liveTokenValue = useLiveTokenCounter();
  if (!user) return null;

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50" data-theme={theme}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 right-0 w-72 bg-dark-200 border border-gray-700 rounded-lg shadow-lg p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-white">Mining Status</h4>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-white"
                title="Close"
                aria-label="Close mining status panel"
              >
                <X size={18} />
              </button>
            </div>
            <div className="text-center">
              {isMining ? (
                <div className="space-y-3">
                  <p className="text-sm text-green-400">Mining is Active</p>
                  <p className="text-xs text-gray-400">Rate: {miningStats?.current_rate_per_minute.toFixed(4)} BSN/min</p>
                  <p className="text-lg font-bold text-white">{liveTokenValue.toFixed(3)} BSN</p>
                  <p className="text-xs text-gray-400">Mining starts automatically when you're online</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Mining is Inactive</p>
                  <p className="text-lg font-bold text-white">{liveTokenValue.toFixed(3)} BSN</p>
                  <p className="text-xs text-gray-400">Mining will start automatically when you're online</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleToggle}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white ${
          isMining
            ? 'bg-green-500 animate-pulse'
            : 'bg-primary-500'
        }`}
        title={isMining ? "Mining Active" : "Mining Inactive"}
      >
        <Gem size={24} />
      </motion.button>
    </div>
  );
};

export default FloatingMiningButton;

