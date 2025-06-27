
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedProfileBackground from './AnimatedProfileBackground';

const ProfileSkeleton: React.FC = () => {
  return (
    <div className="relative min-h-screen pb-16">
      <AnimatedProfileBackground />
      
      <div className="container mx-auto p-4">
        {/* Header Card Skeleton */}
        <div className="bg-dark-100/80 backdrop-blur-sm rounded-lg shadow-md p-8 border border-gray-800/50 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="h-24 w-24 rounded-full bg-dark-300/70" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-7 w-1/3 bg-dark-300/70" />
              <Skeleton className="h-4 w-2/3 bg-dark-300/70" />
              <div className="flex gap-4 pt-2">
                <Skeleton className="h-10 w-32 rounded-full bg-dark-300/70" />
                <Skeleton className="h-10 w-32 rounded-full bg-dark-300/70" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs Skeleton */}
        <Skeleton className="h-12 w-full bg-dark-300/70 rounded-lg mb-6" />
        
        {/* Content Skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-64 w-full bg-dark-300/70 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full bg-dark-300/70 rounded-lg" />
            <Skeleton className="h-48 w-full bg-dark-300/70 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
