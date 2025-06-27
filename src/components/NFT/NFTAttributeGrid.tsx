
import React from 'react';
import { NFTAttribute } from '@/types/token';

interface NFTAttributeGridProps {
  attributes: NFTAttribute[];
}

const NFTAttributeGrid: React.FC<NFTAttributeGridProps> = ({ attributes }) => {
  if (!attributes || attributes.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {attributes.map((attribute, index) => (
        <div
          key={`${attribute.trait_type}-${index}`}
          className="bg-dark-200 border border-gray-800 rounded-lg p-3 flex flex-col items-center text-center"
        >
          <span className="text-xs text-gray-400 mb-1">{attribute.trait_type}</span>
          <span className="font-medium text-primary truncate w-full">
            {attribute.value.toString()}
          </span>
          {attribute.display_type === 'percentage' && '%'}
        </div>
      ))}
    </div>
  );
};

export default NFTAttributeGrid;
