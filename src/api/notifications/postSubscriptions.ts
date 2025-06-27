import { postSubscriptionAPI, notificationCreationAPI } from '@/lib/django-api-new';
import { createNotification } from './createNotifications';

/**
 * Checks if a user has subscribed to a post
 * @param userId ID of the user
 * @param postId ID of the post
 * @returns Boolean indicating if the user has subscribed to the post
 */
export const isPostSubscribedByUser = async (
  userId: string,
  postId: string
): Promise<boolean> => {
  try {
    if (!userId || !postId) {
      console.error('Missing required parameters for checking subscription:', { userId, postId });
      return false;
    }

    const response = await postSubscriptionAPI.isSubscribed(postId);
    return response.subscribed;
  } catch (error) {
    console.error('Error checking post subscription:', error);
    return false;
  }
};

/**
 * Subscribes a user to a post
 * @param userId ID of the user subscribing
 * @param postId ID of the post to subscribe to
 * @returns Boolean indicating success
 */
export const subscribeToPost = async (
  userId: string,
  postId: string
): Promise<boolean> => {
  try {
    if (!userId || !postId) {
      console.error('Missing required parameters for post subscription:', { userId, postId });
      return false;
    }

    await postSubscriptionAPI.subscribe(postId);
    return true;
  } catch (error) {
    console.error('Error subscribing to post:', error);
    return false;
  }
};

/**
 * Unsubscribes a user from a post
 * @param userId ID of the user unsubscribing
 * @param postId ID of the post to unsubscribe from
 * @returns Boolean indicating success
 */
export const unsubscribeFromPost = async (
  userId: string,
  postId: string
): Promise<boolean> => {
  try {
    if (!userId || !postId) {
      console.error('Missing required parameters for post unsubscription:', { userId, postId });
      return false;
    }

    await postSubscriptionAPI.unsubscribe(postId);
    console.log(`User ${userId} unsubscribed from post ${postId}`);
    return true;
  } catch (error) {
    console.error('Error unsubscribing from post:', error);
    return false;
  }
};

/**
 * Creates notifications for all users who have subscribed to a post
 * @param postId ID of the post that had activity
 * @param actorId ID of the user who performed the action
 * @param type Type of notification to create
 * @param content Content of the notification
 * @returns Array of notification IDs that were created
 */
export const createPostSubscriptionNotifications = async (
  postId: string,
  actorId: string,
  type: 'post_activity',
  content: string
): Promise<string[]> => {
  try {
    if (!postId || !actorId) {
      console.error('Missing required parameters for subscription notifications:', { postId, actorId });
      return [];
    }

    // Get post subscribers (excluding the actor)
    const subscribersResponse = await postSubscriptionAPI.getSubscribers(postId);
    const subscribers = subscribersResponse.subscribers.filter(id => id !== actorId);

    if (subscribers.length === 0) {
      console.log('No subscribers found for post:', postId);
      return [];
    }

    console.log(`Creating notifications for ${subscribers.length} subscribers of post ${postId}`);
    
    // Create notifications for all subscribers
    const notificationPromises = subscribers.map(subscriberId => 
      createNotification({
        userId: subscriberId,
        type,
        content,
        actorId,
        targetId: postId,
        targetType: 'post'
      })
    );
    
    const results = await Promise.all(notificationPromises);
    return results.filter(id => id !== null) as string[];
  } catch (error) {
    console.error('Error creating subscription notifications:', error);
    return [];
  }
};
