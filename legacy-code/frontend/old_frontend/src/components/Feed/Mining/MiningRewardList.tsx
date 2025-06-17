
import React from 'react';
import RewardCard from './RewardCard';
import { Coins, Gift, Zap, Trophy, Star, Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface MiningRewardListProps {
  onAction: (type: string, points: number, tokens: number) => Promise<void>;
  isLoading: string | null;
}

const MiningRewardList: React.FC<MiningRewardListProps> = ({ onAction, isLoading }) => {
  const rewards = [
    {
      type: 'daily',
      icon: <Gift className="text-white" size={20} />,
      text: 'Täglicher Bonus',
      tokens: '15 BSN',
      points: '15 Punkte',
      color: 'bg-gradient-to-r from-primary to-primary/80',
      pointsValue: 15,
      tokensValue: 15
    },
    {
      type: 'boost',
      icon: <Zap className="text-white" size={20} />,
      text: 'Mining Boost',
      tokens: '10 BSN',
      points: '10 Punkte',
      color: 'bg-gradient-to-r from-yellow-500 to-amber-600',
      pointsValue: 10,
      tokensValue: 10
    },
    {
      type: 'post',
      icon: <Plus className="text-white" size={20} />,
      text: 'Neuer Beitrag',
      tokens: '5 BSN',
      points: '5 Punkte',
      color: 'bg-gradient-to-r from-green-500 to-emerald-600',
      pointsValue: 5,
      tokensValue: 5
    },
    {
      type: 'streak',
      icon: <Trophy className="text-white" size={20} />,
      text: 'Mining Streak',
      tokens: '20 BSN',
      points: '20 Punkte',
      color: 'bg-gradient-to-r from-orange-500 to-amber-600',
      pointsValue: 20,
      tokensValue: 20
    },
    {
      type: 'special',
      icon: <Sparkles className="text-white" size={20} />,
      text: 'Special Bonus',
      tokens: '25 BSN',
      points: '25 Punkte',
      color: 'bg-gradient-to-r from-purple-500 to-violet-600',
      pointsValue: 25,
      tokensValue: 25
    },
  ];

  return (
    <motion.div 
      className="p-5 bg-dark-200/90 backdrop-blur-md rounded-xl border border-gray-800 shadow-lg"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Coins size={20} className="mr-2 text-primary" />
          Mining Belohnungen
        </h3>
        <motion.div 
          className="flex items-center text-gray-300 text-sm"
          whileHover={{ scale: 1.05 }}
        >
          <span>Verdiene BSN-Token</span>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-5 gap-3">
        {rewards.map((reward, index) => (
          <motion.div
            key={reward.type}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <RewardCard
              icon={reward.icon}
              text={reward.text}
              tokens={reward.tokens}
              points={reward.points}
              color={reward.color}
              onClick={() => onAction(reward.type, reward.pointsValue, reward.tokensValue)}
              isLoading={isLoading === reward.type}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default MiningRewardList;
