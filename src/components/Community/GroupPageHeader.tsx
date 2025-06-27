
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

interface GroupPageHeaderProps {
  title: string;
  description: string;
}

const GroupPageHeader: React.FC<GroupPageHeaderProps> = ({ 
  title, 
  description 
}) => {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleCreateGroup = () => {
    navigate('/community/create-group');
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h1>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
      <Button onClick={handleCreateGroup} className="flex items-center gap-2">
        <Plus size={16} />
        <span>Gruppe erstellen</span>
      </Button>
    </div>
  );
};

export default GroupPageHeader;
