
import React from 'react';
import GroupCard from './GroupCard';
import { Group } from '@/hooks/useGroups';
import { motion } from 'framer-motion';

interface GroupsGridProps {
  groups: Group[];
}

const GroupsGrid: React.FC<GroupsGridProps> = ({ groups }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ staggerChildren: 0.1 }}
    >
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} />
      ))}
    </motion.div>
  );
};

export default GroupsGrid;
