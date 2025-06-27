import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/django-api-new';
import { useAuth } from '@/context/AuthContext';

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
  const { user: profile } = useAuth();
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [miningProgress, setMiningProgress] = useState<MiningProgress>({ current: 0, max: 100 });
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

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
        
        const data = await apiClient.get<TrendingTopic[]>('/hashtags/trending/');
        setTrendingTopics(data || []);
      } catch (error) {
        console.error('Error in fetchTrendingTopics:', error);
        // Fallback zu Dummy-Daten im Fehlerfall
        setTrendingTopics([
          { id: '1', name: 'blockchain', count: 128 },
          { id: '2', name: 'crypto', count: 94 },
          { id: '3', name: 'nft', count: 72 },
          { id: '4', name: 'defi', count: 57 },
          { id: '5', name: 'web3', count: 43 }
        ]);
      } finally {
        setLoadingTopics(false);
      }
    };

    const fetchSuggestedUsers = async () => {
      try {
        setLoadingUsers(true);
        
        if (!profile) return;
        
        const data = await apiClient.get<SuggestedUser[]>('/users/suggested/');
        setSuggestedUsers(data || []);
      } catch (error) {
        console.error('Error in fetchSuggestedUsers:', error);
        // Fallback zu Dummy-Daten
        setSuggestedUsers([
          { id: '1', name: 'Alice Chen', username: '@alicechen', avatar: null, avatarColor: getRandomAvatarColor() },
          { id: '2', name: 'Bob Smith', username: '@bobsmith', avatar: null, avatarColor: getRandomAvatarColor() },
          { id: '3', name: 'Clara Jung', username: '@clarajung', avatar: null, avatarColor: getRandomAvatarColor() }
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
        
        const data = await apiClient.get<{ daily_points: number }>('/mining/stats/');
        const points = data?.daily_points || 0;
        setMiningProgress({ current: points, max: 100 });
      } catch (error) {
        console.error('Error in fetchMiningProgress:', error);
        // Fallback-Werte
        setMiningProgress({ current: 25, max: 100 });
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
