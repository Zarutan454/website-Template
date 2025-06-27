import React from 'react';
import { TestNotifications } from '@/components/TestNotifications';
import Layout from '@/components/Layout';

export const TestNotificationsPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Notification System Test
            </h1>
            <p className="text-gray-600">
              Test the notification system functionality
            </p>
          </div>
          
          <TestNotifications />
        </div>
      </div>
    </Layout>
  );
}; 
