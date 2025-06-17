
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Gem, 
  Zap, 
  TrendingUp, 
  Clock, 
  Award, 
  BarChart, 
  Users,
  Hammer
} from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useMining } from '@/hooks/useMining';
import { formatNumber } from '@/utils/formatters';

export const MiningOverview: React.FC = () => {
  const { miningStats, isMining, miningRate } = useMining();
  
  // Calculate the daily progress percentage
  const dailyProgress = Math.min(100, (miningStats.daily_tokens_earned / 100) * 100);
  
  // Format the mining rate in a readable way
  const formattedMiningRate = ((miningRate || 0) * 60).toFixed(2);
  
  return (
    <div className="space-y-6">
      <Card className="border border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white">Mining Overview</CardTitle>
            <Badge variant={isMining ? "success" : "secondary"} className="px-2 py-1">
              {isMining ? (
                <div className="flex items-center">
                  <Hammer className="h-3.5 w-3.5 mr-1 animate-pulse" />
                  <span>Active</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  <span>Inactive</span>
                </div>
              )}
            </Badge>
          </div>
          <CardDescription>
            Your mining performance at a glance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col space-y-1.5 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center gap-2">
                <Gem className="h-4 w-4 text-primary-400" />
                <span className="text-xs font-medium text-gray-400">Total Earned</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formatNumber(miningStats.total_tokens_earned)} BSN
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-400" />
                <span className="text-xs font-medium text-gray-400">Mining Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {formattedMiningRate} BSN/h
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium text-gray-400">Efficiency</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {((miningStats.efficiency_multiplier || 1) * 100).toFixed(0)}%
              </div>
            </div>
            
            <div className="flex flex-col space-y-1.5 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-blue-400" />
                <span className="text-xs font-medium text-gray-400">Streak</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {miningStats.streak_days || 0} days
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Daily Progress</span>
              <span className="text-sm font-medium text-white">
                {miningStats.daily_tokens_earned.toFixed(2)} / 100 BSN
              </span>
            </div>
            <Progress value={dailyProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" /> Stats
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gem className="h-4 w-4" /> Rewards
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Leaderboard
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
              <CardDescription>
                Your mining performance and rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Total Points</p>
                  <p className="text-lg font-medium">{formatNumber(miningStats.total_points)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Daily Points</p>
                  <p className="text-lg font-medium">{formatNumber(miningStats.daily_points)}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Daily Posts</p>
                  <p className="text-lg font-medium">{miningStats.daily_posts_count || 0}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Daily Comments</p>
                  <p className="text-lg font-medium">{miningStats.daily_comments_count || 0}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Daily Likes</p>
                  <p className="text-lg font-medium">{miningStats.daily_likes_count || 0}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Daily Shares</p>
                  <p className="text-lg font-medium">{miningStats.daily_shares_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewards" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Mining Rewards</CardTitle>
              <CardDescription>
                Complete these actions to earn BSN tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-full">
                      <Zap className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Create a Post</p>
                      <p className="text-sm text-gray-400">Share content with the community</p>
                    </div>
                  </div>
                  <Badge variant="outline">+0.5 BSN</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-full">
                      <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Comment on Posts</p>
                      <p className="text-sm text-gray-400">Engage with other users</p>
                    </div>
                  </div>
                  <Badge variant="outline">+0.2 BSN</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-full">
                      <Zap className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Like Content</p>
                      <p className="text-sm text-gray-400">Show appreciation for posts</p>
                    </div>
                  </div>
                  <Badge variant="outline">+0.1 BSN</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Miners</CardTitle>
              <CardDescription>
                The most active miners in the BSN network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would be populated from an API in a real implementation */}
                <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-yellow-500/20 text-yellow-500 font-bold">1</div>
                    <div>
                      <p className="font-medium">CryptoMaster</p>
                      <p className="text-sm text-gray-400">32 day streak</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">5,260 BSN</div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-400/20 text-gray-400 font-bold">2</div>
                    <div>
                      <p className="font-medium">TokenWhale</p>
                      <p className="text-sm text-gray-400">28 day streak</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">4,890 BSN</div>
                </div>
                
                <div className="flex items-center justify-between p-3 border border-gray-800 rounded-lg bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-orange-500/20 text-orange-500 font-bold">3</div>
                    <div>
                      <p className="font-medium">BlockchainGuru</p>
                      <p className="text-sm text-gray-400">25 day streak</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium">4,210 BSN</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MiningOverview;
