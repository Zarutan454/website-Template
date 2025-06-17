
import React from 'react';
import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

interface GroupEmptyStateProps {
  activeTab: string;
  onBrowseGroups: () => void;
}

const GroupEmptyState: React.FC<GroupEmptyStateProps> = ({ 
  activeTab, 
  onBrowseGroups 
}) => {
  const { theme } = useTheme();

  return (
    <div className={`p-10 text-center border rounded-lg ${theme === 'dark' ? 'border-gray-800 bg-dark-100 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-700'}`}>
      <Users size={40} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-medium mb-2">Keine Gruppen gefunden</h3>
      <p className="text-sm mb-4">
        {activeTab === 'my-groups' 
          ? 'Du bist noch keiner Gruppe beigetreten.' 
          : 'Keine Gruppen gefunden, die deiner Suche entsprechen.'}
      </p>
      {activeTab === 'my-groups' && (
        <Button onClick={onBrowseGroups}>
          Gruppen durchsuchen
        </Button>
      )}
    </div>
  );
};

export default GroupEmptyState;
