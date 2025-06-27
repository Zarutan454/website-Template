import { postAPI, notificationCreationAPI } from '@/lib/django-api-new';
import { createNotification } from './createNotifications';
import { createPostSubscriptionNotifications } from './postSubscriptions';

/**
 * Creates a notification when a user likes a post
 * @param likerId The ID of the user who liked the post
 * @param postId The ID of the post that was liked
 * @returns True if the notification was successfully created
 */
export const createLikeNotification = async (
  likerId: string,
  postId: string
): Promise<boolean> => {
  try {
    if (!likerId || !postId) {
      return false;
    }

    // Get the post author using Django API
    const postAuthor = await postAPI.getPostAuthor(postId);

    if (!postAuthor) {
      console.error('Error fetching post for like notification');
      return false;
    }

    // Don't notify if the liker is the post author
    if (postAuthor.author_id === likerId) {
      console.log('Skipping notification: liker is post author');
      return true;
    }

    // Create notification for post author
    await createNotification({
      userId: postAuthor.author_id,
      type: 'like',
      content: 'hat deinen Beitrag geliked',
      actorId: likerId,
      targetId: postId,
      targetType: 'post'
    });

    // Create notifications for post subscribers
    await createPostSubscriptionNotifications(
      postId,
      likerId,
      'post_activity',
      'hat einen Beitrag geliked, dem du folgst'
    );

    return true;
  } catch (error) {
    console.error('Error creating like notification:', error);
    return false;
  }
};
