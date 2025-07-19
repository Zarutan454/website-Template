
import React from 'react';
import { FeedType } from '@/hooks/feed/useFeedData';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeedHeaderProps {
  feedType: FeedType;
  customHeader?: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  animated?: boolean;
}

const FeedHeader: React.FC<any> = () => (
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Feed</h1>
  </div>
);

export default FeedHeader;
