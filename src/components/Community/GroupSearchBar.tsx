
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/components/ThemeProvider';

interface GroupSearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const GroupSearchBar: React.FC<GroupSearchBarProps> = ({ 
  searchQuery, 
  setSearchQuery 
}) => {
  const { theme } = useTheme();

  return (
    <div className="relative">
      <Search 
        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`} 
        size={18} 
      />
      <Input
        className={`pl-10 ${
          theme === 'dark' ? 'bg-dark-100 border-gray-800' : 'bg-gray-100 border-gray-300'
        }`}
        placeholder="Gruppen durchsuchen..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};

export default GroupSearchBar;
