
import React from 'react';
import { FeedType } from '@/hooks/feed/useFeedData';

interface FeedHeaderProps {
  feedType: FeedType;
  customHeader?: React.ReactNode;
}

const FeedHeader: React.FC<any> = () => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Feed</h1>
  </div>
);

export default FeedHeader;
