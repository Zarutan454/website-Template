
import React from 'react';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

interface Highlight {
  id: string;
  title: string;
  coverUrl: string;
}

interface ProfileHighlightsProps {
  highlights: Highlight[];
  isOwnProfile: boolean;
  isLoading?: boolean;
  onAddHighlight?: () => void;
  onViewHighlight?: (id: string) => void;
}

const ProfileHighlights: React.FC<ProfileHighlightsProps> = ({
  highlights,
  isOwnProfile,
  isLoading = false,
  onAddHighlight,
  onViewHighlight
}) => {
  if (isLoading) {
    return (
      <div className="py-4">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-12 h-3 mt-2 bg-gray-200 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (highlights.length === 0 && !isOwnProfile) {
    return null;
  }

  return (
    <div className="py-4">
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {isOwnProfile && (
          <motion.div 
            className="flex-shrink-0 flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddHighlight}
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center cursor-pointer">
              <PlusCircle className="text-gray-500" />
            </div>
            <span className="text-xs mt-2 text-gray-400">Neu</span>
          </motion.div>
        )}
        
        {highlights.map((highlight) => (
          <motion.div 
            key={highlight.id} 
            className="flex-shrink-0 flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewHighlight && onViewHighlight(highlight.id)}
          >
            <div 
              className="w-16 h-16 rounded-full border-2 border-primary bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url(${highlight.coverUrl})` }}
            />
            <span className="text-xs mt-2 text-gray-400 truncate w-20 text-center">{highlight.title}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ProfileHighlights;
