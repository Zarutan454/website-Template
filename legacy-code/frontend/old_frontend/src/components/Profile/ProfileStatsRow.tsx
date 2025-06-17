
import React from 'react';
import { motion } from 'framer-motion';

interface ProfileStatsRowProps {
  followers: number;
  following: number;
  posts: number;
  tokens?: number;
  onFollowersClick?: () => void;
  onFollowingClick?: () => void;
}

const ProfileStatsRow: React.FC<ProfileStatsRowProps> = ({
  followers, 
  following, 
  posts,
  tokens,
  onFollowersClick,
  onFollowingClick
}) => {
  const items = [
    { label: 'Beiträge', value: posts },
    { label: 'Follower', value: followers, onClick: onFollowersClick },
    { label: 'Folgt', value: following, onClick: onFollowingClick },
  ];
  
  if (tokens !== undefined) {
    items.push({ label: 'Tokens', value: tokens });
  }

  return (
    <div className="flex justify-around items-center py-4 border-b border-gray-800">
      {items.map((item, index) => (
        <motion.div 
          key={index}
          className="text-center cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={item.onClick}
        >
          <p className="text-xl font-bold">{item.value.toLocaleString()}</p>
          <p className="text-sm text-gray-400">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default ProfileStatsRow;
