import React from 'react';
import ReelFeed from '@/components/Reels/ReelFeed';
import { FeedLayout } from '@/components/Feed/FeedLayout';

const ReelsPage: React.FC = () => {
  return (
    <FeedLayout>
      <div className="h-full w-full">
        <ReelFeed className="h-[calc(100vh-80px)]" />
      </div>
    </FeedLayout>
  );
};

export default ReelsPage; 