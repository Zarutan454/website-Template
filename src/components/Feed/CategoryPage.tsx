import React from 'react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import UnifiedFeedContainer from './UnifiedFeedContainer';
import { usePosts } from '@/hooks/usePosts';
import { Skeleton } from '@/components/ui/skeleton';

interface PostCardData {
  id: string;
  author: {
    id: string;
    avatar_url?: string;
    display_name?: string;
    username: string;
  };
  content: string;
  created_at: string;
  updated_at?: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked: boolean;
  is_repost?: boolean;
}

const CategoryHeader = ({ title }: { title: string }) => {
  return (
    <div className="pb-4 border-b mb-4">
      <h1 className="text-2xl font-bold">#{title}</h1>
      <p className="text-gray-500">Posts tagged with #{title}</p>
    </div>
  );
};

const CategoryPage = () => {
  const { category } = useParams<{ category: string }>();
  const { posts, adaptedPosts, isLoading, error, fetchPosts } = usePosts();
  const [filteredPosts, setFilteredPosts] = useState<PostCardData[]>([]);

  useEffect(() => {
    const loadPosts = async () => {
      await fetchPosts('recent');
    };
    
    loadPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (category && adaptedPosts.length > 0) {
      // Filter posts that have the category in hashtags or content
      const filtered = adaptedPosts.filter(post => {
        // Check if post content includes the hashtag
        const includesInContent = post.content.toLowerCase().includes(`#${category.toLowerCase()}`);
        
        return includesInContent;
      });
      
      setFilteredPosts(filtered);
    }
  }, [category, adaptedPosts]);

  if (isLoading && !adaptedPosts.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CategoryHeader title={category || ''} />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border rounded-lg">
              <div className="flex items-center space-x-4 mb-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CategoryHeader title={category || ''} />
        <div className="p-4 bg-red-50 text-red-500 rounded-lg">
          Error loading posts. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryHeader title={category || ''} />
      {filteredPosts.length > 0 ? (
        <UnifiedFeedContainer feedType="recent" />
      ) : (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          No posts found with #{category}. Be the first to post with this tag!
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
