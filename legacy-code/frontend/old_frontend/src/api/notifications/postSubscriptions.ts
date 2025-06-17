
import { supabase } from '@/lib/supabase';
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

    const { data, error } = await supabase
      .from('post_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .eq('active', true)
      .maybeSingle();

    if (error) {
      console.error('Error checking post subscription:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Unexpected error checking post subscription:', error);
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

    // Check if subscription already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('post_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing subscription:', checkError);
      return false;
    }

    if (existingSubscription) {
      // If subscription exists but is inactive, reactivate it
      if (!existingSubscription.active) {
        const { error: updateError } = await supabase
          .from('post_subscriptions')
          .update({ active: true, updated_at: new Date().toISOString() })
          .eq('id', existingSubscription.id);

        if (updateError) {
          console.error('Error updating subscription status:', updateError);
          return false;
        }
      }
      return true; // Successfully subscribed (or already active)
    }

    // Create new subscription
    const { error: insertError } = await supabase
      .from('post_subscriptions')
      .insert([{ user_id: userId, post_id: postId, active: true }]);

    if (insertError) {
      console.error('Error creating subscription:', insertError);
      return false;
    }

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

    // Update subscription to inactive
    const { error } = await supabase
      .from('post_subscriptions')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('post_id', postId);

    if (error) {
      console.error('Error unsubscribing from post:', error);
      return false;
    }

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
    const { data: subscribers, error: subscribersError } = await supabase
      .from('post_subscriptions')
      .select('user_id')
      .eq('post_id', postId)
      .eq('active', true)
      .neq('user_id', actorId);

    if (subscribersError) {
      console.error('Error fetching post subscribers:', subscribersError);
      return [];
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('No subscribers found for post:', postId);
      return [];
    }

    console.log(`Creating notifications for ${subscribers.length} subscribers of post ${postId}`);
    
    // Create notifications for all subscribers
    const notificationPromises = subscribers.map(subscriber => 
      createNotification({
        userId: subscriber.user_id,
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
