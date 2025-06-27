
import React from 'react';
import { motion } from 'framer-motion';

const tokens = [
  { symbol: 'ETH', color: 'bg-gray-500', delay: 0, glowColor: 'rgba(156, 163, 175, 0.6)' },
  { symbol: 'BNB', color: 'bg-yellow-500', delay: 1, glowColor: 'rgba(234, 179, 8, 0.6)' },
  { symbol: 'BSN', color: 'bg-pink-500', delay: 2, glowColor: 'rgba(227, 28, 121, 0.6)' },
  { symbol: 'MATIC', color: 'bg-purple-500', delay: 3, glowColor: 'rgba(168, 85, 247, 0.6)' },
  { symbol: 'AVAX', color: 'bg-red-500', delay: 4, glowColor: 'rgba(239, 68, 68, 0.6)' },
  { symbol: 'SOL', color: 'bg-green-500', delay: 5, glowColor: 'rgba(34, 197, 94, 0.6)' },
];

const FloatingTokens: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {tokens.map((token, index) => (
        <motion.div
          key={token.symbol}
          className={`absolute ${token.color} w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white font-bold shadow-lg backdrop-blur-sm`}
          initial={{ 
            x: Math.random() * 100 - 50 + '%', 
            y: Math.random() * 100 - 50 + '%',
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            x: [
              Math.random() * 80 - 40 + '%', 
              Math.random() * 80 - 40 + '%', 
              Math.random() * 80 - 40 + '%'
            ],
            y: [
              Math.random() * 80 - 40 + '%', 
              Math.random() * 80 - 40 + '%', 
              Math.random() * 80 - 40 + '%'
            ],
            opacity: [0.7, 0.9, 0.7],
            scale: [0.8, 1, 0.8],
            rotate: [0, 360],
            boxShadow: [
              `0 0 10px ${token.glowColor}`,
              `0 0 25px ${token.glowColor}`,
              `0 0 10px ${token.glowColor}`
            ]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 20 + index * 5,
            ease: "easeInOut",
            times: [0, 0.5, 1],
            delay: token.delay,
            rotate: {
              duration: 20,
              ease: "linear",
              repeat: Infinity
            }
          }}
          style={{
            zIndex: -1
          }}
          whileHover={{ 
            scale: 1.2, 
            rotate: 0, 
            boxShadow: `0 0 30px ${token.glowColor}`,
            transition: { duration: 0.3 }
          }}
        >
          <motion.span
            animate={{
              scale: [1, 1.1, 1],
              opacity: [1, 0.8, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          >
            {token.symbol}
          </motion.span>
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingTokens;
