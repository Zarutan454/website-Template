
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const ProfileLoader: React.FC = () => {
  return (
    <div className="space-y-6 container max-w-4xl mx-auto px-4 py-6">
      <Card>
        <div className="h-32 bg-gradient-to-r from-gray-900 to-gray-800"></div>
        <CardContent className="px-4 -mt-16 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <Skeleton className="h-24 w-24 rounded-full" />
            
            <div className="flex-1 space-y-4 w-full mt-4 sm:mt-0">
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              
              <div className="flex gap-8 pt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <div className="flex items-start space-x-4 py-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-3 flex-1">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileLoader;
