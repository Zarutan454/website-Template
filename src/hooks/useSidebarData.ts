import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/django-api-new';
import { useAuth } from '@/context/AuthContext.utils';

interface TrendingTopic {
  id: string;
  name: string;
  count: number;
}

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  avatarColor: string;
}

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string;
  avatar: string | null;
  avatarColor: string;
  points: number;
  tokens: string;
}

interface MiningProgress {
  current: number;
  max: number;
}

export function useSidebarData() {
  const { profile } = useAuth();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [miningProgress, setMiningProgress] = useState<MiningProgress>({ current: 0, max: 100 });
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  // Funktion zum Generieren zufälliger Farben für Avatare
  const getRandomAvatarColor = () => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        setLoadingTopics(true);
        const data = await apiClient.get<TrendingTopic[]>('/posts/trending/');
        setTrendingTopics(data || []);
      } catch (error) {
        console.error('Error in fetchTrendingTopics:', error);
        // Fallback-Daten
        setTrendingTopics([
          { id: '1', name: '#BSN', count: 1256 },
          { id: '2', name: '#Blockchain', count: 987 },
          { id: '3', name: '#Crypto', count: 756 },
          { id: '4', name: '#DeFi', count: 543 },
          { id: '5', name: '#NFT', count: 432 }
        ]);
      } finally {
        setLoadingTopics(false);
      }
    };

    const fetchSuggestedUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await apiClient.get<SuggestedUser[]>('/users/suggested/');
        setSuggestedUsers(data || []);
      } catch (error) {
        console.error('Error in fetchSuggestedUsers:', error);
        // Fallback-Daten
        setSuggestedUsers([
          { id: '1', name: 'Thomas Lee', avatar: null, avatarColor: getRandomAvatarColor(), mutualFriends: 3 },
          { id: '2', name: 'Sarah Kim', avatar: null, avatarColor: getRandomAvatarColor(), mutualFriends: 2 },
          { id: '3', name: 'Max Weber', avatar: null, avatarColor: getRandomAvatarColor(), mutualFriends: 5 },
          { id: '4', name: 'Lisa Torres', avatar: null, avatarColor: getRandomAvatarColor(), mutualFriends: 1 },
          { id: '5', name: 'Alex Chen', avatar: null, avatarColor: getRandomAvatarColor(), mutualFriends: 4 }
        ]);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        
        const data = await apiClient.get<LeaderboardUser[]>('/mining/leaderboard/');
        setLeaderboard(data || []);
      } catch (error) {
        console.error('Error in fetchLeaderboard:', error);
        // Fallback-Daten
        setLeaderboard([
          { rank: 1, id: '1', name: 'Thomas Lee', avatar: null, avatarColor: getRandomAvatarColor(), points: 1256, tokens: '532 BSN' },
          { rank: 2, id: '2', name: 'Sarah Kim', avatar: null, avatarColor: getRandomAvatarColor(), points: 1129, tokens: '487 BSN' },
          { rank: 3, id: '3', name: 'Max Weber', avatar: null, avatarColor: getRandomAvatarColor(), points: 986, tokens: '423 BSN' },
          { rank: 4, id: '4', name: 'Lisa Torres', avatar: null, avatarColor: getRandomAvatarColor(), points: 874, tokens: '356 BSN' },
          { rank: 5, id: '5', name: 'Alex Chen', avatar: null, avatarColor: getRandomAvatarColor(), points: 753, tokens: '302 BSN' }
        ]);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    const fetchMiningProgress = async () => {
      try {
        if (!profile) return;
        
        // Check if user is authenticated before making API call
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No authentication token found, skipping mining progress fetch');
          setMiningProgress({ current: 0, max: 100 });
          return;
        }
        
        const data = await apiClient.get<{ daily_points: number }>('/mining/stats/');
        const points = data?.daily_points || 0;
        setMiningProgress({ current: points, max: 100 });
      } catch (error) {
        console.error('Error in fetchMiningProgress:', error);
        // Fallback-Werte
        setMiningProgress({ current: 0, max: 100 });
      }
    };

    fetchTrendingTopics();
    fetchSuggestedUsers();
    fetchLeaderboard();
    fetchMiningProgress();
  }, [profile]);

  return {
    trendingTopics,
    suggestedUsers,
    leaderboard,
    miningProgress,
    loadingTopics,
    loadingUsers,
    loadingLeaderboard
  };
}

