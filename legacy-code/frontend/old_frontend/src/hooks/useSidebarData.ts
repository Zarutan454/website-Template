
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useProfile } from './useProfile';

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
  const { profile } = useProfile();
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
        
        // Hier nun mit der richtigen hashtags-Tabelle arbeiten
        const { data, error } = await supabase
          .from('hashtags')
          .select('*')
          .order('post_count', { ascending: false })
          .limit(5);
        
        if (error) {
          // Fallback zu Dummy-Daten im Fehlerfall
          setTrendingTopics([
            { id: '1', name: 'blockchain', count: 128 },
            { id: '2', name: 'crypto', count: 94 },
            { id: '3', name: 'nft', count: 72 },
            { id: '4', name: 'defi', count: 57 },
            { id: '5', name: 'web3', count: 43 }
          ]);
        } else {
          setTrendingTopics(
            data.map(topic => ({
              id: topic.id,
              name: topic.name,
              count: topic.post_count || 0
            }))
          );
        }
      } catch (error) {
        console.error('Error in fetchTrendingTopics:', error);
      } finally {
        setLoadingTopics(false);
      }
    };

    const fetchSuggestedUsers = async () => {
      try {
        setLoadingUsers(true);
        
        if (!profile) return;
        
        // Hier holen wir Benutzer aus der users-Tabelle, nicht aus profiles
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .neq('id', profile.id)
          .limit(5);
        
        if (error) {
          console.error('Error fetching suggested users:', error);
          // Fallback zu Dummy-Daten
          setSuggestedUsers([
            { id: '1', name: 'Alice Chen', username: '@alicechen', avatar: null, avatarColor: getRandomAvatarColor() },
            { id: '2', name: 'Bob Smith', username: '@bobsmith', avatar: null, avatarColor: getRandomAvatarColor() },
            { id: '3', name: 'Clara Jung', username: '@clarajung', avatar: null, avatarColor: getRandomAvatarColor() }
          ]);
        } else {
          setSuggestedUsers(
            data.map(user => ({
              id: user.id,
              name: user.display_name || user.username,
              username: `@${user.username}`,
              avatar: user.avatar_url,
              avatarColor: getRandomAvatarColor()
            }))
          );
        }
      } catch (error) {
        console.error('Error in fetchSuggestedUsers:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        
        // Da wir jetzt mining_stats haben, können wir diese verwenden
        const { data, error } = await supabase
          .from('mining_stats')
          .select('*, users:user_id(id, display_name, username, avatar_url)')
          .order('total_points', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error('Error fetching leaderboard:', error);
          // Fallback-Daten
          setLeaderboard([
            { rank: 1, id: '1', name: 'Thomas Lee', avatar: null, avatarColor: getRandomAvatarColor(), points: 1256, tokens: '532 BSN' },
            { rank: 2, id: '2', name: 'Sarah Kim', avatar: null, avatarColor: getRandomAvatarColor(), points: 1129, tokens: '487 BSN' },
            { rank: 3, id: '3', name: 'Max Weber', avatar: null, avatarColor: getRandomAvatarColor(), points: 986, tokens: '423 BSN' },
            { rank: 4, id: '4', name: 'Lisa Torres', avatar: null, avatarColor: getRandomAvatarColor(), points: 874, tokens: '356 BSN' },
            { rank: 5, id: '5', name: 'Alex Chen', avatar: null, avatarColor: getRandomAvatarColor(), points: 753, tokens: '302 BSN' }
          ]);
        } else {
          setLeaderboard(
            data.map((item, index) => {
              const user = item.users;
              return {
                rank: index + 1,
                id: item.user_id,
                name: user?.display_name || user?.username || 'Unbekannt',
                avatar: user?.avatar_url,
                avatarColor: getRandomAvatarColor(),
                points: item.total_points || 0,
                tokens: `${item.total_tokens_earned || 0} BSN`
              };
            })
          );
        }
      } catch (error) {
        console.error('Error in fetchLeaderboard:', error);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    const fetchMiningProgress = async () => {
      try {
        // Verwenden der aktuellen mining_stats für den Fortschritt
        if (!profile) return;
        
        const { data, error } = await supabase
          .from('mining_stats')
          .select('daily_points')
          .eq('user_id', profile.id)
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 bedeutet keinen Eintrag gefunden
          console.error('Error fetching mining progress:', error);
          // Fallback-Werte
          setMiningProgress({ current: 25, max: 100 });
        } else {
          // Wenn kein Datensatz gefunden wurde oder points null ist, verwende Standardwerte
          const points = data?.daily_points || 0;
          setMiningProgress({ current: points, max: 100 });
        }
      } catch (error) {
        console.error('Error in fetchMiningProgress:', error);
      }
    };

    fetchTrendingTopics();
    fetchSuggestedUsers();
    fetchLeaderboard();
    fetchMiningProgress();
  }, [profile]);

  return {
    profile,
    trendingTopics,
    suggestedUsers,
    leaderboard,
    miningProgress,
    loadingTopics,
    loadingUsers,
    loadingLeaderboard
  };
}
