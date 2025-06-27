import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

interface FeedSkeletonLoaderProps {
  count?: number;
  darkMode?: boolean;
}

const FeedSkeletonLoader: React.FC<FeedSkeletonLoaderProps> = ({ 
  count = 3, 
  darkMode = true 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-4">
        <Spinner size="lg" text="Beiträge werden geladen..." />
      </div>
      
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: count }).map((_, index) => (
          <Card 
            key={`skeleton-${index}`}
            className={`border-0 ${darkMode ? 'bg-dark-100/60' : 'bg-gray-100/60'} overflow-hidden`}
          >
            <CardHeader className="space-y-2 pb-2">
              <div className="flex items-start">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-4 py-2 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
              
              {/* Random chance (33%) to show an image skeleton */}
              {Math.random() > 0.66 && (
                <Skeleton className="h-48 w-full mt-2 rounded-md" />
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between px-4 pt-0 pb-3">
              <div className="flex space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FeedSkeletonLoader;
