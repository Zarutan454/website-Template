
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart2, TrendingUp, Users, Heart, MessageSquare, Share2, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

// Type definitions for the component
interface ActivityMetric {
  date: string;
  posts: number;
  likes: number;
  comments: number;
  shares: number;
  followers: number;
}

interface EngagementMetric {
  type: string;
  count: number;
  percentage: number;
}

interface GrowthMetric {
  period: string;
  followers: number;
  engagement: number;
}

interface ProfileAnalyticsProps {
  userId: string;
  username: string;
  activityData: ActivityMetric[];
  engagementData: EngagementMetric[];
  growthData: GrowthMetric[];
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalFollowers: number;
  totalViews: number;
  miningStats?: {
    totalTokens: number;
    miningRate: number;
    efficiency: number;
    streak: number;
  };
  isLoading?: boolean;
}

// Helper component for stats card
const StatCard = ({ 
  title, 
  value, 
  icon, 
  change,
  isPositive
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  change?: number;
  isPositive?: boolean;
}) => (
  <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
    <CardContent className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
          
          {change !== undefined && (
            <div className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}% im Vergleich zum Vormonat
            </div>
          )}
        </div>
        <div className="p-2 rounded-full bg-primary/20 text-primary">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProfileAnalytics: React.FC<ProfileAnalyticsProps> = ({
  userId,
  username,
  activityData,
  engagementData,
  growthData,
  totalPosts,
  totalLikes,
  totalComments,
  totalShares,
  totalFollowers,
  totalViews,
  miningStats,
  isLoading = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };
  
  if (isLoading) {
    return (
      <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            Profilanalyse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-800 rounded-md" />
              ))}
            </div>
            <div className="h-72 bg-gray-800 rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Helper function to format data
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 10000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toLocaleString('de-DE');
  };
  
  return (
    <Card className="border-gray-800/60 bg-gray-900/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="h-5 w-5" />
          Profilanalyse für {username}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="activity">Aktivität</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="growth">Wachstum</TabsTrigger>
            {miningStats && <TabsTrigger value="mining">Mining</TabsTrigger>}
          </TabsList>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <TabsContent value="overview" className="space-y-6 mt-0">
              <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard 
                  title="Beiträge" 
                  value={formatNumber(totalPosts)} 
                  icon={<MessageSquare className="h-5 w-5" />}
                  change={5.2}
                  isPositive={true}
                />
                <StatCard 
                  title="Follower" 
                  value={formatNumber(totalFollowers)} 
                  icon={<Users className="h-5 w-5" />}
                  change={8.7}
                  isPositive={true}
                />
                <StatCard 
                  title="Likes" 
                  value={formatNumber(totalLikes)} 
                  icon={<Heart className="h-5 w-5" />}
                  change={12.3}
                  isPositive={true}
                />
                <StatCard 
                  title="Kommentare" 
                  value={formatNumber(totalComments)} 
                  icon={<MessageSquare className="h-5 w-5" />}
                  change={-2.1}
                  isPositive={false}
                />
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Card className="border-gray-800/60 bg-gray-900/40 p-4">
                  <h3 className="text-lg font-medium mb-4">Aktivitätsübersicht</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={activityData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return format(date, 'dd. MMM', { locale: de });
                          }}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }}
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            return format(date, 'dd. MMMM yyyy', { locale: de });
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="posts" stroke="#8B5CF6" strokeWidth={2} />
                        <Line type="monotone" dataKey="likes" stroke="#EC4899" strokeWidth={2} />
                        <Line type="monotone" dataKey="followers" stroke="#10B981" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-0">
              <motion.div variants={itemVariants}>
                <Card className="border-gray-800/60 bg-gray-900/40 p-4">
                  <h3 className="text-lg font-medium mb-4">Aktivitätsverlauf</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={activityData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9CA3AF"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return format(date, 'dd. MMM', { locale: de });
                          }}
                        />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }}
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            return format(date, 'dd. MMMM yyyy', { locale: de });
                          }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="posts" stroke="#8B5CF6" strokeWidth={2} />
                        <Line type="monotone" dataKey="comments" stroke="#3B82F6" strokeWidth={2} />
                        <Line type="monotone" dataKey="shares" stroke="#F59E0B" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="engagement" className="mt-0">
              <motion.div variants={itemVariants}>
                <Card className="border-gray-800/60 bg-gray-900/40 p-4">
                  <h3 className="text-lg font-medium mb-4">Engagement-Verteilung</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={engagementData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="type" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }}
                          formatter={(value: any, name: any) => {
                            return [formatNumber(value as number), name];
                          }}
                        />
                        <Legend />
                        <Bar dataKey="count" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
            
            <TabsContent value="growth" className="mt-0">
              <motion.div variants={itemVariants}>
                <Card className="border-gray-800/60 bg-gray-900/40 p-4">
                  <h3 className="text-lg font-medium mb-4">Wachstumsentwicklung</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={growthData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="period" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="followers" stroke="#10B981" strokeWidth={2} />
                        <Line type="monotone" dataKey="engagement" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </motion.div>
            </TabsContent>
            
            {miningStats && (
              <TabsContent value="mining" className="mt-0">
                <motion.div variants={containerVariants} className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div variants={itemVariants}>
                      <StatCard 
                        title="Tokens" 
                        value={formatNumber(miningStats.totalTokens)} 
                        icon={<Trophy className="h-5 w-5" />}
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <StatCard 
                        title="Mining-Rate" 
                        value={miningStats.miningRate.toFixed(2)} 
                        icon={<TrendingUp className="h-5 w-5" />}
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <StatCard 
                        title="Effizienz" 
                        value={`${(miningStats.efficiency * 100).toFixed(0)}%`} 
                        icon={<BarChart2 className="h-5 w-5" />}
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <StatCard 
                        title="Streak" 
                        value={miningStats.streak} 
                        icon={<Trophy className="h-5 w-5" />}
                      />
                    </motion.div>
                  </div>
                  
                  <motion.div variants={itemVariants}>
                    <Card className="border-gray-800/60 bg-gray-900/40 p-4">
                      <h3 className="text-lg font-medium mb-4">Mining-Aktivität</h3>
                      {/* Mining activity chart placeholder */}
                      <div className="flex items-center justify-center h-72 bg-gray-800/30 rounded-md">
                        <p className="text-gray-400">Mining-Aktivitätsdaten werden gesammelt...</p>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            )}
          </motion.div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProfileAnalytics;
