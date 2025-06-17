
import React, { useState, useEffect, useCallback } from 'react';
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationsHeader } from "@/components/notifications/NotificationsHeader";
import { NotificationTabs } from "@/components/notifications/NotificationTabs";
import { useTheme } from '@/components/ThemeProvider';
import { FeedLayout } from '@/components/Feed/FeedLayout';
import { toast } from 'sonner';
import { ErrorDisplay } from '@/components/common/ErrorHandler';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { RefreshCw, Bell, Settings2 } from 'lucide-react';
import { NotificationType } from '@/types/notifications';
import { EmptyState } from '@/components/notifications/EmptyState';
import { useProfile } from '@/hooks/useProfile';
import { NotificationSettings } from '@/components/notifications/NotificationSettings';

const Notifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [testType, setTestType] = useState<NotificationType>('system');
  const [showSettings, setShowSettings] = useState(false);
  const { theme } = useTheme();
  const { profile } = useProfile();
  const {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    formatTime
  } = useNotifications();
  
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  
  const filteredNotifications = activeTab === "unread" 
    ? notifications.filter(notification => !notification.read)
    : notifications;

  const hasUnread = notifications.some(notification => !notification.read);
  
  const handleRefresh = () => {
    fetchNotifications();
    toast.info("Benachrichtigungen werden aktualisiert...");
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead();
    if (hasUnread) {
      toast.success("Alle Benachrichtigungen als gelesen markiert");
    }
  };

  const createTestNotification = async () => {
    try {
      setIsCreatingTest(true);
      const { data: userSession } = await supabase.auth.getUser();
      
      if (!userSession.user) {
        toast.error("Bitte melde dich an, um eine Test-Benachrichtigung zu erstellen");
        return;
      }
      
      const content = 
        testType === 'like' ? 'Test: Jemand hat deinen Beitrag geliked' :
        testType === 'comment' ? 'Test: Jemand hat deinen Beitrag kommentiert' :
        testType === 'follow' ? 'Test: Jemand folgt dir jetzt' :
        testType === 'mining_reward' ? 'Test: Du hast Token durch Mining verdient' :
        'Dies ist eine Test-Benachrichtigung';
      
      const { data, error } = await supabase.rpc('create_notification', {
        p_user_id: userSession.user.id,
        p_type: testType,
        p_content: content,
        p_actor_id: null,
        p_target_id: null,
        p_target_type: null
      });
      
      if (error) {
        toast.error("Fehler beim Erstellen der Test-Benachrichtigung");
      } else {
        fetchNotifications();
        toast.success(`Test-Benachrichtigung (${testType}) erstellt`);
      }
    } catch (err) {
      toast.error("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsCreatingTest(false);
    }
  };

  const rotateTestType = useCallback(() => {
    const types: NotificationType[] = ['system', 'like', 'comment', 'follow', 'mining_reward'];
    const currentIndex = types.indexOf(testType);
    const nextIndex = (currentIndex + 1) % types.length;
    setTestType(types[nextIndex]);
  }, [testType]);

  const toggleSettings = () => setShowSettings(!showSettings);

  // Wrapper-Funktion für markAsRead, um Promise<void> zurückzugeben
  const handleMarkAsRead = async (id: string): Promise<void> => {
    await markAsRead(id);
  };

  return (
    <FeedLayout hideRightSidebar={true}>
      <div className="pt-2">
        <div className="flex flex-col space-y-6">
          {error && (
            <ErrorDisplay 
              message="Fehler beim Laden der Benachrichtigungen" 
              onRetry={handleRefresh}
            />
          )}
          
          <div className="flex justify-between items-center">
            <NotificationsHeader 
              isLoading={isLoading}
              hasUnread={hasUnread}
              onMarkAllAsRead={handleMarkAllAsRead}
              onRefresh={handleRefresh}
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSettings}
              className="flex items-center gap-1"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Einstellungen</span>
            </Button>
          </div>

          {showSettings && profile && (
            <NotificationSettings userId={profile.id} onClose={() => setShowSettings(false)} />
          )}

          {!showSettings && (
            <>
              <NotificationTabs 
                notifications={notifications}
                filteredNotifications={filteredNotifications}
                activeTab={activeTab}
                isLoading={isLoading}
                error={error}
                onTabChange={setActiveTab}
                onMarkAsRead={handleMarkAsRead}
                onMarkAllAsRead={handleMarkAllAsRead}
                onRefresh={handleRefresh}
                formatTime={formatTime}
              />

              {notifications.length === 0 && !isLoading && (
                <EmptyState 
                  isCreatingTest={isCreatingTest}
                  testType={testType}
                  onCreateTest={createTestNotification}
                  onRotateTestType={rotateTestType}
                  onRefresh={handleRefresh}
                  isLoading={isLoading}
                />
              )}
            </>
          )}
        </div>
      </div>
    </FeedLayout>
  );
};

export default Notifications;
