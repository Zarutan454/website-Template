
import React, { useEffect, useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useProfile } from '@/hooks/useProfile';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import PageTitle from '@/components/PageTitle';
import StatsCard from '@/components/Dashboard/StatsCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Users, ThumbsUp, MessageCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { posts, fetchPosts } = usePosts();
  const { profile } = useProfile();
  const [lastSevenDaysStats, setLastSevenDaysStats] = useState<any[]>([]);
  
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);
  
  useEffect(() => {
    if (posts.length > 0 && profile) {
      // Filter own posts
      const myPosts = posts.filter(post => post.author_id === profile.id);
      const myLikedPosts = posts.filter(post => post.author_id === profile.id && post.likes_count > 0);
      const myCommentedPosts = posts.filter(post => post.author_id === profile.id && post.comments_count > 0);
      
      // Create last 7 days data
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
      }).reverse();
      
      const stats = last7Days.map(date => {
        return {
          date,
          posts: Math.floor(Math.random() * 5),
          likes: Math.floor(Math.random() * 15),
          comments: Math.floor(Math.random() * 10),
        };
      });
      
      setLastSevenDaysStats(stats);
    }
  }, [posts, profile]);
  
  return (
    <DashboardLayout>
      <PageTitle title="Dashboard" subtitle="Übersicht über deine Aktivitäten" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Beiträge" 
          value="24" 
          change="+12%" 
          icon={<Users className="h-5 w-5" />} 
          description="Gesamtanzahl deiner Beiträge" 
        />
        <StatsCard 
          title="Likes" 
          value="142" 
          change="+18%" 
          icon={<ThumbsUp className="h-5 w-5" />} 
          description="Erhaltene Likes auf deine Beiträge" 
        />
        <StatsCard 
          title="Kommentare" 
          value="38" 
          change="+5%" 
          icon={<MessageCircle className="h-5 w-5" />} 
          description="Kommentare zu deinen Beiträgen" 
        />
      </div>
      
      <motion.div 
        className="bg-card border rounded-lg p-6 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-semibold mb-4">Aktivität der letzten 7 Tage</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lastSevenDaysStats}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip contentStyle={{ background: 'rgba(17, 24, 39, 0.9)', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="likes" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="comments" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-muted-foreground">Beiträge</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
            <span className="text-sm text-muted-foreground">Likes</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
            <span className="text-sm text-muted-foreground">Kommentare</span>
          </div>
        </div>
      </motion.div>
      
      {/* Weitere Dashboard-Widgets hier */}
    </DashboardLayout>
  );
};

export default Dashboard;
