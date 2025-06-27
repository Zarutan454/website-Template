import React from 'react';
import { Card } from '../../components/ui/card';
import StoryList from '../Stories/StoryList';
import { useTheme } from '../../components/ThemeProvider';

interface StoriesSectionProps {
  className?: string;
}

const StoriesSection: React.FC<StoriesSectionProps> = ({ className = '' }) => {
  const { theme } = useTheme();
  
  return (
    <Card className={`overflow-hidden ${theme === 'dark' ? 'border-gray-800' : 'border-gray-200'} ${className}`}>
      <StoryList />
    </Card>
  );
};

export default StoriesSection;
