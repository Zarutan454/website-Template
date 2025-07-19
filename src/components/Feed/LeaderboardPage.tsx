import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Search, Users, Zap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
// import { supabase } from '@/lib/supabase';
// MIGRATED: Diese Komponente verwendet jetzt Django-API.
import { useAuth } from '@/context/AuthContext';

type UserData = {
  name: string;
  username: string;
  avatar: string;
  avatarColor: string;
};

type MiningEntry = {
  rank: number;
  user: UserData;
  score: number;
  change: string;
  tokens: number;
};

type SocialEntry = {
  rank: number;
  user: UserData;
  score: number;
  change: string;
  followers: number;
};

type ContentEntry = {
  rank: number;
  user: UserData;
  score: number;
  change: string;
  posts: number;
  engagement: string;
};

type LeaderboardData = {
  mining: MiningEntry[];
  social: SocialEntry[];
  content: ContentEntry[];
};

const generateAvatarColor = (username: string): string => {
  const colors = [
    'bg-gradient-to-br from-blue-500 to-purple-600',
    'bg-gradient-to-br from-red-500 to-pink-600',
    'bg-gradient-to-br from-indigo-500 to-blue-600',
    'bg-gradient-to-br from-yellow-500 to-orange-600',
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-green-500 to-emerald-600',
    'bg-gradient-to-br from-green-500 to-teal-600',
    'bg-gradient-to-br from-cyan-500 to-blue-600',
    'bg-gradient-to-br from-pink-500 to-rose-600'
  ];
  
  const sum = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[sum % colors.length];
};

const LeaderboardPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('mining');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    mining: [],
    social: [],
    content: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user: profile } = useAuth();

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setIsLoading(true);
      
      try {
        // TODO: Django-API-Migration: LeaderboardPage auf Django-API umstellen
        // Die gesamte Logik für das Laden der Leaderboard-Daten muss auf die Django-API migriert werden.
        // Aktuell ist keine Funktionalität vorhanden, da Supabase entfernt wurde.
        // const { data: miningData, error: miningError } = await supabase
        //   .from('mining_stats')
        //   .select('user_id, total_points, total_tokens_earned, profiles(id, username, display_name)')
        //   .order('total_points', { ascending: false })
        //   .limit(10);
          
        // if (miningError) throw miningError;
        
        // const { data: socialData, error: socialError } = await supabase
        //   .from('user_relationships')
        //   .select('target_user_id, count, profiles!user_relationships_target_user_id_fkey(id, username, display_name)')
        //   .eq('relationship_type', 'follow')
        //   .order('count', { ascending: false })
        //   .limit(10);
          
        // if (socialError) throw socialError;
        
        // const { data: contentData, error: contentError } = await supabase
        //   .from('content_stats')
        //   .select('user_id, post_count, engagement_rate, profiles(id, username, display_name)')
        //   .order('engagement_rate', { ascending: false })
        //   .limit(10);
          
        // if (contentError) throw contentError;
        
        // const miningEntries: MiningEntry[] = miningData.map((item, index) => {
        //   const profile = item.profiles as any;
        //   const username = profile?.username || 'user';
        //   const displayName = profile?.display_name || username;
        //   const firstLetter = displayName.charAt(0).toUpperCase();
          
        //   return {
        //     rank: index + 1,
        //     user: {
        //       name: displayName,
        //       username: username,
        //       avatar: firstLetter,
        //       avatarColor: generateAvatarColor(username)
        //     },
        //     score: item.total_points || 0,
        //     change: '+10%', // Would need historical data for real change calculation
        //     tokens: item.total_tokens_earned || 0
        //   };
        // });
        
        // const socialEntries: SocialEntry[] = socialData.map((item, index) => {
        //   const profile = item.profiles as any;
        //   const username = profile?.username || 'user';
        //   const displayName = profile?.display_name || username;
        //   const firstLetter = displayName.charAt(0).toUpperCase();
          
        //   return {
        //     rank: index + 1,
        //     user: {
        //       name: displayName,
        //       username: username,
        //       avatar: firstLetter,
        //       avatarColor: generateAvatarColor(username)
        //     },
        //     score: item.count || 0,
        //     change: '+8%', // Would need historical data for real change calculation
        //     followers: item.count || 0
        //   };
        // });
        
        // const contentEntries: ContentEntry[] = contentData.map((item, index) => {
        //   const profile = item.profiles as any;
        //   const username = profile?.username || 'user';
        //   const displayName = profile?.display_name || username;
        //   const firstLetter = displayName.charAt(0).toUpperCase();
          
        //   return {
        //     rank: index + 1,
        //     user: {
        //       name: displayName,
        //       username: username,
        //       avatar: firstLetter,
        //       avatarColor: generateAvatarColor(username)
        //     },
        //     score: Math.round((item.engagement_rate || 0) * 100),
        //     change: '+12%', // Would need historical data for real change calculation
        //     posts: item.post_count || 0,
        //     engagement: `${Math.round((item.engagement_rate || 0) * 100)}%`
        //   };
        // });
        
        // setLeaderboardData({
        //   mining: miningEntries,
        //   social: socialEntries,
        //   content: contentEntries
        // });
      } catch (error) {
        setLeaderboardData({
          mining: [],
          social: [],
          content: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboardData();
  }, [selectedTimeframe]);

  // Filter data based on search query
  const filteredData = {
    mining: leaderboardData.mining.filter(entry => 
      entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    social: leaderboardData.social.filter(entry => 
      entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    content: leaderboardData.content.filter(entry => 
      entry.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.user.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-dark-200 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white mr-4">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
            <p className="text-gray-400">Die aktivsten Mitglieder der BSN Community</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Benutzer suchen..."
              className="w-full bg-dark-100 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex space-x-2">
            <select 
              className="bg-dark-100 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              aria-label="Zeitraum auswählen"
            >
              <option value="day">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
              <option value="all">Gesamt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="bg-dark-200 rounded-xl border border-gray-800">
        <div className="p-6 border-b border-gray-800">
          <div className="flex space-x-4 overflow-x-auto pb-2">
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'mining' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedCategory('mining')}
            >
              <Zap size={18} className="inline-block mr-2" />
              Mining
            </button>
            
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'social' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedCategory('social')}
            >
              <Users size={18} className="inline-block mr-2" />
              Social
            </button>
            
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'content' 
                  ? 'bg-primary-500 text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setSelectedCategory('content')}
            >
              <TrendingUp size={18} className="inline-block mr-2" />
              Content
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredData[selectedCategory as keyof typeof filteredData].length > 0 ? (
              filteredData[selectedCategory as keyof typeof filteredData].map((entry, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 bg-dark-100 rounded-lg border border-gray-800"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 mr-4">
                      #{entry.rank}
                    </div>
                    <div className={`w-10 h-10 rounded-full ${entry.user.avatarColor} flex items-center justify-center text-white font-bold mr-3`}>
                      {entry.user.avatar}
                    </div>
                    <div>
                      <Link to={`/profile/${entry.user.username}`} className="text-white font-medium hover:text-primary-400 transition-colors">
                        {entry.user.name}
                      </Link>
                      <p className="text-gray-400 text-sm">@{entry.user.username}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {selectedCategory === 'mining' && (
                      <>
                        <div className="text-white font-medium">{(entry as MiningEntry).tokens} BSN</div>
                        <div className="text-green-400 text-sm">{entry.change}</div>
                      </>
                    )}
                    {selectedCategory === 'social' && (
                      <>
                        <div className="text-white font-medium">{(entry as SocialEntry).followers} Follower</div>
                        <div className="text-green-400 text-sm">{entry.change}</div>
                      </>
                    )}
                    {selectedCategory === 'content' && (
                      <>
                        <div className="text-white font-medium">{(entry as ContentEntry).posts} Posts</div>
                        <div className="text-green-400 text-sm">{(entry as ContentEntry).engagement} Engagement</div>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                Keine Benutzer gefunden, die deiner Suche entsprechen.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
