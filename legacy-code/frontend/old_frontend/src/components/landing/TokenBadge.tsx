
import React from 'react';
import { motion } from 'framer-motion';

interface TokenBadgeProps {
  symbol: string;
  name?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const TokenBadge: React.FC<TokenBadgeProps> = ({ 
  symbol, 
  name, 
  color = 'bg-pink-500',
  size = 'md',
  animate = false
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base'
  };
  
  const containerClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  const BadgeContent = () => (
    <>
      <span className={`${sizeClasses[size]} rounded-full ${color} inline-flex items-center justify-center text-white font-bold mr-2 flex-shrink-0`}>
        {symbol.charAt(0)}
      </span>
      {name && (
        <span className="inline-flex flex-col">
          <span className="font-medium text-white">{symbol}</span>
          <span className="text-gray-400 text-xs">{name}</span>
        </span>
      )}
    </>
  );
  
  if (animate) {
    return (
      <motion.span 
        className={`inline-flex items-center ${containerClasses[size]}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BadgeContent />
      </motion.span>
    );
  }
  
  return (
    <span className={`inline-flex items-center ${containerClasses[size]}`}>
      <BadgeContent />
    </span>
  );
};

export default TokenBadge;
