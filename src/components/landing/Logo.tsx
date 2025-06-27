
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  // Size mappings
  const sizes = {
    sm: {
      container: 'h-8 w-8',
      text: 'text-lg'
    },
    md: {
      container: 'h-10 w-10',
      text: 'text-xl'
    },
    lg: {
      container: 'h-12 w-12',
      text: 'text-2xl'
    },
    xl: {
      container: 'h-16 w-16',
      text: 'text-3xl'
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <motion.div 
        className={`relative ${sizes[size].container} flex-shrink-0`}
        whileHover={{ rotate: 360 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ willChange: 'transform' }}
      >
        {/* Outer circle */}
        <motion.div 
          className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-pink-600"
          animate={{ 
            boxShadow: ['0 0 0 rgba(227, 28, 121, 0.4)', '0 0 20px rgba(227, 28, 121, 0.6)', '0 0 0 rgba(227, 28, 121, 0.4)']
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          style={{ willChange: 'box-shadow' }}
        />
        
        {/* Inner circle with cutout */}
        <div className="absolute inset-[2px] rounded-full bg-dark-200 flex items-center justify-center overflow-hidden">
          {/* Network lines */}
          <div className="absolute inset-0">
            <motion.div 
              className="absolute top-1/2 left-0 right-0 h-[1px] bg-pink-500/50"
              animate={{ rotate: [0, 180] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
            />
            <motion.div 
              className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-pink-600/50"
              animate={{ rotate: [0, 180] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ willChange: 'transform' }}
            />
            <motion.div 
              className="absolute top-0 left-0 w-full h-full border-[1px] border-pink-500/30 rounded-full"
              animate={{ scale: [0.5, 1.2, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ willChange: 'transform' }}
            />
          </div>
          
          {/* BSN Text */}
          <div className="relative z-10 text-white font-bold text-xs">BSN</div>
        </div>
      </motion.div>
      
      {showText && (
        <motion.div 
          className={`ml-2 font-bold ${sizes[size].text} text-white flex flex-col leading-tight`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.3, type: 'spring', stiffness: 100 }}
        >
          <span className="flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-500">
              Blockchain
            </span>
            <span className="hidden md:inline-block md:ml-1">-</span>
          </span>
          <span className="flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-secondary-400 to-accent-500">
              Social
            </span>
            <span className="hidden md:inline-block md:ml-1">.</span>
          </span>
          <span className="hidden md:block bg-clip-text text-transparent bg-gradient-to-r from-accent-400 to-primary-500">
            Network
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default Logo;
