import React, { useState, useEffect } from 'react';
import { useMining } from '@/hooks/useMining';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gem, 
  Hammer, 
  Layers, 
  Activity, 
  Trophy,
  Users, 
  BarChart, 
  Clock, 
  AlertTriangle,
  Loader2,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import MiningOverview from '@/components/mining/dashboard/MiningOverview';
import TokenBalance from '@/components/mining/dashboard/TokenBalance';
import MiningActivityTracker from '@/components/mining/activity-tracker/MiningActivityTracker';
import AchievementSection from '@/components/mining/achievements/AchievementSection';

const Mining: React.FC = () => {
  const { 
    miningStats, 
    recentActivities,
    isLoading, 
    isMining, 
    startMining, 
    stopMining,
    miningRate
  } = useMining();
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const handleMiningToggle = async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      
      if (isMining) {
        const success = await stopMining();
        if (success) {
          toast.success('Mining stopped successfully');
        } else {
          toast.error('Failed to stop mining');
        }
      } else {
        const success = await startMining();
        if (success) {
          toast.success('Mining started successfully');
        } else {
          toast.error('Failed to start mining');
        }
      }
    } catch (error) {
      toast.error('An error occurred while toggling mining');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-8">
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:items-center justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Mining Dashboard</h1>
              {isMining && (
                <Badge variant="success" className="animate-pulse">
                  <Hammer className="h-3 w-3 mr-1" />
                  <span>Active</span>
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              Earn BSN tokens through your activities in the network
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              onClick={handleMiningToggle}
              disabled={isProcessing}
              variant={isMining ? "destructive" : "default"}
              className="gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isMining ? "Stopping..." : "Starting..."}
                </>
              ) : (
                <>
                  <Hammer className="h-4 w-4" />
                  {isMining ? "Stop Mining" : "Start Mining"}
                </>
              )}
            </Button>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <TokenBalance 
              miningRate={isMining ? miningRate : 0} 
              isLoading={isLoading} 
            />
            
            <MiningActivityTracker />
          </div>
          
          <div className="lg:col-span-8">
            <MiningOverview />
          </div>
        </div>

        <AchievementSection />

        <Card className="border border-gray-800">
          <CardContent className="p-6">
            <Tabs 
              defaultValue="overview" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                <TabsTrigger value="overview" className="py-2">
                  <BarChart className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="rewards" className="py-2">
                  <Gem className="h-4 w-4 mr-2" />
                  Rewards
                </TabsTrigger>
                <TabsTrigger value="leaderboard" className="py-2">
                  <Users className="h-4 w-4 mr-2" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="achievements" className="py-2">
                  <Trophy className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="text-center py-8">
                  <BarChart className="h-12 w-12 mx-auto text-primary-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Advanced Analytics</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Detailed mining analytics are coming soon. Track your mining performance, rewards, and more.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="rewards" className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="text-center py-8">
                  <Gem className="h-12 w-12 mx-auto text-primary-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Mining Rewards</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Rewards system is being enhanced. Check back soon for more ways to earn BSN tokens.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="leaderboard" className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-primary-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Global Leaderboard</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Compete with other miners worldwide. Leaderboard will be available soon.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="p-4 bg-gray-900 rounded-lg border border-gray-800">
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-primary-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Mining Achievements</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Unlock special achievements and earn bonus tokens. Coming soon.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-800 bg-gradient-to-r from-blue-900/20 to-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Mining Tips</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    Keep your mining active to earn tokens continuously
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    Interact with posts to earn additional token bonuses
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    Maintain a daily streak to increase your efficiency multiplier
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                    Create quality content to get more likes and earn more tokens
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Mining;
