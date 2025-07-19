import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hashtagAPI } from '@/lib/django-api-new';
import { toast } from 'sonner';

export interface Hashtag {
  id: number;
  name: string;
  description: string;
  posts_count: number;
  created_at: string;
}

export interface HashtagPost {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
}

// Hook to fetch all hashtags
export const useHashtags = () => {
  return useQuery<Hashtag[]>({
    queryKey: ['hashtags'],
    queryFn: async () => {
      const response = await hashtagAPI.getHashtags();
      return response.data as Hashtag[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch trending hashtags
export const useTrendingHashtags = () => {
  return useQuery<Hashtag[]>({
    queryKey: ['hashtags', 'trending'],
    queryFn: async () => {
      const response = await hashtagAPI.getTrendingHashtags();
      return response.data as Hashtag[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook to fetch hashtag details
export const useHashtag = (id: number) => {
  return useQuery<Hashtag>({
    queryKey: ['hashtags', id],
    queryFn: async () => {
      const response = await hashtagAPI.getHashtag(id);
      return response.data as Hashtag;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to fetch posts for a hashtag
export const useHashtagPosts = (id: number, page = 1) => {
  return useQuery<{ results: HashtagPost[]; count: number; next?: string; previous?: string }>({
    queryKey: ['hashtags', id, 'posts', page],
    queryFn: async () => {
      const response = await hashtagAPI.getHashtagPosts(id);
      return response.data as { results: HashtagPost[]; count: number; next?: string; previous?: string };
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to search hashtags
export const useSearchHashtags = (query: string) => {
  return useQuery<Hashtag[]>({
    queryKey: ['hashtags', 'search', query],
    queryFn: async () => {
      const response = await hashtagAPI.searchHashtags(query);
      return response.data as Hashtag[];
    },
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to extract hashtags from text
export const useExtractHashtags = (text: string) => {
  const hashtagRegex = /#(\w+)/g;
  const matches = text.match(hashtagRegex);
  return matches ? matches.map(match => match.slice(1)) : [];
};

// Hook to validate hashtag format
export const useValidateHashtag = (hashtag: string) => {
  const validFormat = /^[a-zA-Z0-9_]+$/.test(hashtag);
  const validLength = hashtag.length >= 1 && hashtag.length <= 50;
  return validFormat && validLength;
}; 