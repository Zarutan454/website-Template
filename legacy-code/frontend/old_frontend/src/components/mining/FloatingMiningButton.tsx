
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Cpu, Zap, X } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useMining } from '@/hooks/useMining';
import { Badge } from '@/components/ui/badge';

interface MiningWidgetProps {
  closePopover: () => void;
}

// Simple Mining Widget for the floating button popover
const MiningWidget: React.FC<MiningWidgetProps> = ({ closePopover }) => {
  const { miningStats, startMining, stopMining, isMining, isLoading } = useMining();

  const handleToggleMining = async () => {
    if (isMining) {
      await stopMining();
    } else {
      await startMining();
    }
  };

  // Support both property naming conventions using optional chaining and nullish coalescing
  const tokenBalance = miningStats?.total_tokens_earned ?? 0;

  return (
    <div className="p-4">
      <div className="mb-4">
        <p className="text-sm text-muted-foreground mb-2">BSN Token Verfügbar:</p>
        <p className="text-2xl font-bold">{tokenBalance.toFixed(2) || '0.00'}</p>
      </div>
      
      <div className="space-y-2">
        <button
          onClick={handleToggleMining}
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded text-white text-sm font-medium transition-colors ${
            isMining
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isLoading ? 'Laden...' : isMining ? 'Mining stoppen' : 'Mining starten'}
        </button>
        
        <button
          onClick={closePopover}
          className="w-full py-2 px-4 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium transition-colors"
        >
          Dashboard öffnen
        </button>
      </div>
    </div>
  );
};

const FloatingMiningButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const { isMining, syncMiningState } = useMining();
  const [isAnimating, setIsAnimating] = useState(false);

  // Initial sync on load
  useEffect(() => {
    if (syncMiningState) {
      syncMiningState().then(success => {
      });
    }
  }, [syncMiningState]);

  // Set up periodic sync
  useEffect(() => {
    const syncInterval = setInterval(() => {
      if (syncMiningState) {
        syncMiningState().then(success => {
          console.log("FloatingMiningButton: Periodic sync completed");
        });
      }
    }, 60000); // Sync every minute
    
    return () => clearInterval(syncInterval);
  }, [syncMiningState]);

  // Animation effect
  useEffect(() => {
    if (isMining) {
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
    }
  }, [isMining]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <motion.button
          className={`fixed bottom-20 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
            isMining 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
              : 'bg-gradient-to-r from-gray-700 to-gray-800'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={isAnimating ? { 
            boxShadow: ['0 0 0 rgba(16, 185, 129, 0)', '0 0 20px rgba(16, 185, 129, 0.5)'],
          } : {}}
          transition={isAnimating ? { 
            repeat: Infinity, 
            repeatType: "reverse", 
            duration: 1.5 
          } : {}}
        >
          {isMining ? (
            <div className="relative">
              <Zap size={20} className="text-white" />
              <motion.div 
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          ) : (
            <Cpu size={20} className="text-gray-300" />
          )}
        </motion.button>
      </PopoverTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <PopoverContent 
            side="top" 
            align="end" 
            sideOffset={16}
            className="w-80 p-0 border border-gray-800 bg-dark-200 shadow-lg"
            forceMount
            asChild
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <button 
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={14} className="text-gray-400" />
                </button>
                
                <div className="flex items-center space-x-2 p-3 border-b border-gray-800 bg-dark-100">
                  <Cpu size={16} className="text-primary" />
                  <h3 className="text-white font-medium">BSN Mining</h3>
                  {isMining && (
                    <Badge variant="success" className="ml-auto">
                      Aktiv
                    </Badge>
                  )}
                </div>
                
                <MiningWidget closePopover={() => setIsOpen(false)} />
              </div>
            </motion.div>
          </PopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
};

export default FloatingMiningButton;
