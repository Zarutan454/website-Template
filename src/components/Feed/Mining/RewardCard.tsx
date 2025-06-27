
import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface RewardCardProps { 
  icon: React.ReactNode;
  text: string;
  tokens: string;
  color: string;
  points: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const RewardCard: React.FC<RewardCardProps> = ({
  icon, 
  text, 
  tokens, 
  color, 
  points, 
  onClick,
  isLoading
}) => {
  return (
    <motion.div 
      className="flex flex-col items-center text-center cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center mb-2 shadow-lg transition-all duration-200`}>
        {isLoading ? <Loader2 size={20} className="text-white animate-spin" /> : icon}
      </div>
      <span className="text-xs line-clamp-1 mb-0.5 font-medium text-white">{text}</span>
      <span className="text-xs font-bold text-primary">{tokens}</span>
      <span className="text-[10px] text-gray-400">{points}</span>
    </motion.div>
  );
};

export default RewardCard;
