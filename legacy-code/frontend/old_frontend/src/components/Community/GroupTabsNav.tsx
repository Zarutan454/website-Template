
import React from 'react';
import { useTheme } from '@/components/ThemeProvider';

interface GroupTabsNavProps {
  activeTab: 'all' | 'my-groups' | 'suggested';
  setActiveTab: (tab: 'all' | 'my-groups' | 'suggested') => void;
}

const GroupTabsNav: React.FC<GroupTabsNavProps> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  const { theme } = useTheme();

  return (
    <div className="flex border-b overflow-x-auto scrollbar-hide">
      <button
        onClick={() => setActiveTab('all')}
        className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
          activeTab === 'all'
            ? `border-b-2 border-primary ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
            : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
        }`}
      >
        Alle Gruppen
      </button>
      <button
        onClick={() => setActiveTab('my-groups')}
        className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
          activeTab === 'my-groups'
            ? `border-b-2 border-primary ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
            : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
        }`}
      >
        Meine Gruppen
      </button>
      <button
        onClick={() => setActiveTab('suggested')}
        className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
          activeTab === 'suggested'
            ? `border-b-2 border-primary ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`
            : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
        }`}
      >
        Vorgeschlagen
      </button>
    </div>
  );
};

export default GroupTabsNav;
