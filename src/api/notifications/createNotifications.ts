import { notificationCreationAPI } from '@/lib/django-api-new';
import { NotificationType } from '@/types/notifications';

/**
 * Function signature types for createNotification
 */
type NotificationParams = {
  userId: string;
  type: NotificationType;
  content: string;
  actorId?: string;
  targetId?: string;
  targetType?: string;
};

/**
 * Creates a new notification for a user
 * @param params Object with notification parameters OR
 * @param userId The ID of the user to notify
 * @param type The notification type
 * @param content The notification content
 * @param actorId The ID of the user who triggered the notification (optional)
 * @param targetId The ID of the related resource (optional)
 * @param targetType The type of the related resource (optional)
 * @returns The ID of the created notification
 */
export const createNotification = async (
  paramsOrUserId: NotificationParams | string,
  type?: NotificationType,
  content?: string,
  actorId?: string,
  targetId?: string,
  targetType?: string
): Promise<string | null> => {
  try {
    let userId: string;
    let notificationType: NotificationType;
    let notificationContent: string;
    let notificationActorId: string | undefined;
    let notificationTargetId: string | undefined;
    let notificationTargetType: string | undefined;

    // Check if the first argument is an object (params) or a string (userId)
    if (typeof paramsOrUserId === 'object') {
      // Object-based call
      const params = paramsOrUserId;
      userId = params.userId;
      notificationType = params.type;
      notificationContent = params.content;
      notificationActorId = params.actorId;
      notificationTargetId = params.targetId;
      notificationTargetType = params.targetType;
    } else {
      // Parameter-based call
      userId = paramsOrUserId;
      notificationType = type as NotificationType;
      notificationContent = content as string;
      notificationActorId = actorId;
      notificationTargetId = targetId;
      notificationTargetType = targetType;
    }

    // Use Django API to create the notification
    const response = await notificationCreationAPI.createNotification({
      user_id: userId,
      type: notificationType,
      content: notificationContent,
      actor_id: notificationActorId,
      target_id: notificationTargetId,
      target_type: notificationTargetType
    });

    return response.id;
  } catch (err) {
    console.error('Unexpected error creating notification:', err);
    return null;
  }
};

/**
 * Creates a system notification for a user
 * @param userId The ID of the user to notify
 * @param content The notification content
 * @returns The ID of the created notification
 */
export const createSystemNotification = async (
  userId: string,
  content: string
): Promise<string | null> => {
  return createNotification(userId, 'system', content);
};

/**
 * Creates a mining reward notification for a user
 * @param userId The ID of the user to notify
 * @param amount The amount of tokens earned
 * @returns The ID of the created notification
 */
export const createMiningRewardNotification = async (
  userId: string,
  amount: number
): Promise<string | null> => {
  const content = `Du hast ${amount} Token durch Mining verdient!`;
  return createNotification(userId, 'mining_reward', content);
};
