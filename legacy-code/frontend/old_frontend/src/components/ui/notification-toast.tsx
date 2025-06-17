import React, { useEffect, useState } from 'react';
import { cn } from "../../lib/utils";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationToastProps {
  type: NotificationType;
  title: string;
  message?: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  className?: string;
}

export function NotificationToast({
  type = 'info',
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  className
}: NotificationToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseStyles = "rounded-lg p-4 shadow-lg border-l-4 flex items-start gap-3 max-w-md";
    
    switch (type) {
      case 'success':
        return "bg-green-50 dark:bg-green-950/30 border-green-500";
      case 'error':
        return "bg-red-50 dark:bg-red-950/30 border-red-500";
      case 'warning':
        return "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500";
      case 'info':
      default:
        return "bg-blue-50 dark:bg-blue-950/30 border-blue-500";
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "rounded-lg p-4 shadow-lg border-l-4 flex items-start gap-3 max-w-md",
            getStyles(),
            className
          )}
        >
          <div className="flex-shrink-0 pt-0.5">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium">{title}</h3>
            {message && (
              <p className="mt-1 text-sm text-muted-foreground">
                {message}
              </p>
            )}
          </div>
          
          <button 
            onClick={handleClose}
            className="flex-shrink-0 ml-auto -mt-1 -mr-1 p-1 rounded-full hover:bg-muted/50"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
