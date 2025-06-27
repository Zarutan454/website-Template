
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Gift, 
  Award,
  TrendingUp,
  Check,
  Trophy,
  Star,
  Tag,
  Lock
} from 'lucide-react';

export const MiningRewards: React.FC = () => {
  const rewards = [
    {
      type: 'post',
      name: 'Beitrag erstellen',
      icon: <MessageSquare size={20} />,
      tokens: 5,
      points: 5,
      color: 'from-green-500 to-emerald-600'
    },
    {
      type: 'comment',
      name: 'Kommentieren',
      icon: <MessageSquare size={20} />,
      tokens: 2,
      points: 2,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      type: 'like',
      name: 'Beitrag liken',
      icon: <ThumbsUp size={20} />,
      tokens: 1,
      points: 1,
      color: 'from-red-500 to-pink-600'
    },
    {
      type: 'share',
      name: 'Beitrag teilen',
      icon: <Share2 size={20} />,
      tokens: 3,
      points: 3,
      color: 'from-purple-500 to-violet-600'
    },
    {
      type: 'airdrop',
      name: 'Airdrop teilnehmen',
      icon: <Gift size={20} />,
      tokens: 10,
      points: 10,
      color: 'from-yellow-500 to-amber-600'
    },
    {
      type: 'trending',
      name: 'Trending Post',
      icon: <TrendingUp size={20} />,
      tokens: 25,
      points: 25,
      color: 'from-primary-500 to-secondary-600'
    }
  ];

  return (
    <Card className="bg-dark-100 border-gray-800 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center">
          <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
          Mining Belohnungen
        </CardTitle>
        <CardDescription>Verdiene zusätzliche Token durch spezielle Aktivitäten</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <motion.div
              key={reward.type}
              className="bg-dark-200 rounded-lg p-4 border border-gray-800"
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)"
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${reward.color} flex items-center justify-center text-white`}>
                  {reward.icon}
                </div>
                <div className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                  +{reward.tokens} BSN
                </div>
              </div>
              <h3 className="text-white font-medium">{reward.name}</h3>
              <div className="flex items-center mt-2 text-sm text-gray-400">
                <Check size={14} className="mr-1" />
                {reward.points} Punkte
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MiningRewards;
