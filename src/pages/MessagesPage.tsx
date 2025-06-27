
import React from 'react';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { MessagesPage as MessagingComponent } from '@/components/Messaging/MessagesPage';

const MessagesPage = () => {
  return (
    <FeedLayout hideRightSidebar={true}>
      <MessagingComponent />
    </FeedLayout>
  );
};

export default MessagesPage;
