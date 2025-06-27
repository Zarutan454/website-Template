
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, ThumbsUp, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface UserStatsProps {
  stats: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    tokenBalance: number;
    miningRate: number;
    level: number;
  };
  isLoading: boolean;
}

export const UserStatsWidget: React.FC<UserStatsProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="bg-dark-100 border-gray-800 shadow-md">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-32 bg-dark-300" />
          <Skeleton className="h-4 w-48 bg-dark-300 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 py-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col p-3 bg-dark-200 rounded-lg">
                <Skeleton className="h-8 w-12 bg-dark-300 mx-auto" />
                <Skeleton className="h-3 w-16 bg-dark-300 mt-2 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-dark-100 border-gray-800 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-white">Deine Statistiken</CardTitle>
        <CardDescription>Übersicht deiner BSN Aktivitäten</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="flex flex-col items-center p-3 bg-dark-200 rounded-lg">
            <div className="flex items-center justify-center mb-1 text-primary-400">
              <MessageSquare size={18} />
            </div>
            <div className="text-lg font-bold text-white">{stats.totalPosts}</div>
            <div className="text-xs text-gray-400">Beiträge</div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-dark-200 rounded-lg">
            <div className="flex items-center justify-center mb-1 text-primary-400">
              <ThumbsUp size={18} />
            </div>
            <div className="text-lg font-bold text-white">{stats.totalLikes}</div>
            <div className="text-xs text-gray-400">Likes</div>
          </div>
          
          <div className="flex flex-col items-center p-3 bg-dark-200 rounded-lg">
            <div className="flex items-center justify-center mb-1 text-primary-400">
              <Zap size={18} />
            </div>
            <div className="text-lg font-bold text-white">{stats.miningRate.toFixed(2)}</div>
            <div className="text-xs text-gray-400">Token/Tag</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
