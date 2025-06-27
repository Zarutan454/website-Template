
import { Notification } from '@/types/notifications';

export type UserNotification = Notification;

export interface NotificationHookResult {
  notifications: UserNotification[];
  isLoading: boolean;
  error: Error | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  formatTime: (timestamp: string) => string;
}
