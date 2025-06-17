
import { supabase } from '@/lib/supabase';
import { createNotification } from './createNotifications';
import { createPostSubscriptionNotifications } from './postSubscriptions';

/**
 * Creates a notification when a user comments on a post
 * @param commenterId The ID of the user who commented
 * @param postId The ID of the post that was commented on
 * @param commentContent The content of the comment
 * @returns True if the notification was successfully created
 */
export const createCommentNotification = async (
  commenterId: string,
  postId: string,
  commentContent: string
): Promise<boolean> => {
  try {
    if (!commenterId || !postId) {
      return false;
    }

    // Get the post author
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', postId)
      .single();

    if (postError || !post) {
      console.error('Error fetching post for comment notification:', postError);
      return false;
    }

    // Don't notify if the commenter is the post author
    if (post.author_id === commenterId) {
      console.log('Skipping notification: commenter is post author');
      return true;
    }

    // Create notification for post author
    const contentPreview = commentContent ? 
      `hat deinen Beitrag kommentiert: "${commentContent.substring(0, 30)}${commentContent.length > 30 ? '...' : ''}"` : 
      'hat deinen Beitrag kommentiert';

    await createNotification({
      userId: post.author_id,
      type: 'comment',
      content: contentPreview,
      actorId: commenterId,
      targetId: postId,
      targetType: 'post'
    });

    // Create notifications for post subscribers
    await createPostSubscriptionNotifications(
      postId,
      commenterId,
      'post_activity',
      'hat einen Beitrag kommentiert, dem du folgst'
    );

    return true;
  } catch (error) {
    console.error('Error creating comment notification:', error);
    return false;
  }
};
