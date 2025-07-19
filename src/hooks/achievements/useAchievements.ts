import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface AchievementCriteria {
  category?: string;
  points?: number;
  token_reward?: number;
  target_value?: number;
  action?: string;
  [key: string]: unknown;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  criteria: AchievementCriteria;
  reward: string;
  progress: number;
  max_progress: number;
  is_completed: boolean;
  unlocked_at: string | null;
  category: string;
  points: number;
  token_reward: number;
}

export interface AchievementStats {
  total: number;
  completed: number;
  in_progress: number;
  total_points: number;
  earned_points: number;
  total_tokens: number;
  earned_tokens: number;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_pages: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AchievementsResponse {
  results: Achievement[];
  pagination: PaginationInfo;
  stats: AchievementStats;
  filters: {
    search: string;
    category: string;
    status: string;
  };
}

export const useAchievements = (
  page: number = 1,
  pageSize: number = 12,
  search: string = '',
  category: string = 'all',
  status: string = 'all'
) => {
  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
        search: search,
        category: category,
        status: status,
      });

      const response = await fetch(`http://localhost:8000/api/achievements/?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const responseData = await response.json();
        setData(responseData);
        setError(null);
      } else {
        throw new Error('Failed to fetch achievements');
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setError('Network error while fetching achievements');
      toast({
        title: 'Error',
        description: 'Failed to fetch achievements',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, category, status]);

  useEffect(() => {
    setLoading(true);
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements: data?.results || [],
    pagination: data?.pagination || null,
    stats: data?.stats || null,
    filters: data?.filters || null,
    loading,
    error,
    refetch: fetchAchievements,
  };
}; 