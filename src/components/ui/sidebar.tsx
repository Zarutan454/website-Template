
import React, { ReactNode } from 'react';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from './button';
// Change to use useMobile instead of useIsMobile
import { useMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  position?: 'left' | 'right';
  width?: string;
  className?: string;
}

export const Sidebar = ({
  children,
  isOpen,
  onClose,
  position = 'left',
  width = '300px',
  className = ''
}: SidebarProps) => {
  const isMobile = useMobile();
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black z-40"
              onClick={onClose}
            />
          )}
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: position === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: position === 'left' ? '-100%' : '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={`fixed top-0 ${position}-0 h-full z-50 bg-white dark:bg-gray-900 shadow-lg flex flex-col ${className}`}
            style={{ width }}
          >
            <div className="flex justify-end p-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <X size={20} />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
