
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useTheme } from '@/components/ThemeProvider';

interface GroupsLoadingSkeletonProps {
  count?: number;
}

const GroupsLoadingSkeleton: React.FC<GroupsLoadingSkeletonProps> = ({ count = 6 }) => {
  const { theme } = useTheme();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className={`${theme === 'dark' ? 'bg-dark-100 border-gray-800' : 'bg-white border-gray-200'} overflow-hidden`}>
          <div className={`h-24 ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-100'} animate-pulse`}></div>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'} animate-pulse`}></div>
              <div className="space-y-2">
                <div className={`h-4 w-24 ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'} animate-pulse rounded`}></div>
                <div className={`h-3 w-16 ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'} animate-pulse rounded`}></div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className={`h-4 w-full ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'} animate-pulse rounded mb-2`}></div>
            <div className={`h-4 w-3/4 ${theme === 'dark' ? 'bg-dark-200' : 'bg-gray-200'} animate-pulse rounded`}></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default GroupsLoadingSkeleton;
