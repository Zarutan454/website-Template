
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Filter } from 'lucide-react';

interface ExtraAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

interface PostListHeaderProps {
  toggleFilters: () => void;
  showFilters: boolean;
  selectedFilter: string | null;
  extraAction?: ExtraAction;
}

const PostListHeader: React.FC<PostListHeaderProps> = ({ 
  toggleFilters, 
  showFilters, 
  selectedFilter,
  extraAction
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center">
        <h2 className="text-lg font-medium text-white">Posts</h2>
        {selectedFilter && (
          <div className="ml-3 px-2 py-1 bg-primary-900/30 rounded-md">
            <span className="text-xs text-primary-400">{selectedFilter}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {extraAction && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={extraAction.onClick}
            className="text-primary-400 border-primary-900 hover:text-primary-300 hover:border-primary-800"
          >
            {extraAction.icon && (
              <span className="mr-1.5">{extraAction.icon}</span>
            )}
            {extraAction.label}
          </Button>
        )}
        
        {/* Alle Filter-Buttons und UI entfernt */}
      </div>
    </div>
  );
};

export default PostListHeader;
