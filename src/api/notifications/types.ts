
import { Notification } from '@/types/notifications';

// Helper types for the notification API modules
export interface NotificationAPIResponse {
  success: boolean;
  data?: Notification[] | null;
  error?: Error | unknown;
}

export interface SingleNotificationResponse {
  success: boolean;
  data?: Notification | null;
  error?: Error | unknown;
}
