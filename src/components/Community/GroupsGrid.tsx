
import * as React from 'react';
import GroupCard from './GroupCard';
import { Group } from '@/hooks/useGroups';
import { motion } from 'framer-motion';
import { FixedSizeGrid as Grid } from 'react-window';

interface GroupsGridProps {
  groups: Group[];
  virtualized?: boolean;
}

interface CellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
}

const GroupsGrid: React.FC<GroupsGridProps> = ({ groups, virtualized = false }) => {
  // For small lists, use regular grid
  if (!virtualized || groups.length < 20) {
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
  }

  // For large lists, use virtualization
  const COLUMN_COUNT = 3;
  const ITEM_WIDTH = 300;
  const ITEM_HEIGHT = 200;
  const ROW_COUNT = Math.ceil(groups.length / COLUMN_COUNT);

  const Cell: React.FC<CellProps> = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * COLUMN_COUNT + columnIndex;
    const group = groups[index];
    
    if (!group) return null;
    
    return (
      <div style={style} className="p-2">
        <GroupCard group={group} />
      </div>
    );
  };

  return (
    <div className="h-[600px] w-full">
      <Grid
        columnCount={COLUMN_COUNT}
        columnWidth={ITEM_WIDTH}
        height={600}
        rowCount={ROW_COUNT}
        rowHeight={ITEM_HEIGHT}
        width={COLUMN_COUNT * ITEM_WIDTH}
        itemData={groups}
      >
        {Cell}
      </Grid>
    </div>
  );
};

export default GroupsGrid;
