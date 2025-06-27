
import React from 'react';
import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HashtagDisplayProps {
  hashtags: string[];
  isDarkMode: boolean;
}

const HashtagDisplay: React.FC<HashtagDisplayProps> = ({ hashtags, isDarkMode }) => {
  if (hashtags.length === 0) {
    return (
      <span className="inline-flex items-center">
        <Hash size={14} className="mr-1" /> Hashtags werden automatisch erkannt
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {hashtags.map(tag => (
        <span 
          key={tag} 
          className={cn(
            "inline-flex items-center px-2 py-1 rounded-full text-xs",
            isDarkMode 
              ? "bg-primary-900/30 text-primary-300" 
              : "bg-primary-100 text-primary-700"
          )}
        >
          <Hash size={10} className="mr-1" />
          {tag}
        </span>
      ))}
    </div>
  );
};

export default HashtagDisplay;
